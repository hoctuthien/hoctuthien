# core/services.py
import requests
import re
from datetime import datetime, timedelta
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.db.models import Q
from .models import ExternalTransaction, PaymentRequest, CharityCampaign, User, Booking

# core/services.py
import pytz
from datetime import datetime

def parse_vietnam_time(time_str):
    """
    Chuyển đổi chuỗi thời gian từ API Thiện Nguyện (Giờ VN)
    thành datetime object có múi giờ (Aware Datetime) để Django lưu đúng.
    Input: "2025-11-25T23:22:00" (Giả định là giờ VN)
    Output: Datetime object (đã quy đổi sang UTC hoặc giữ timezone info)
    """
    if not time_str:
        return None

    # 1. Parse chuỗi thành datetime nguyên thủy (naive)
    # API trả về định dạng ISO 8601: "YYYY-MM-DDTHH:MM:SS"
    try:
        naive_dt = datetime.strptime(time_str, "%Y-%m-%dT%H:%M:%S")
    except ValueError:
        # Fallback nếu format có thêm milliseconds hoặc khác biệt
        naive_dt = parse_datetime(time_str)

    if naive_dt is None:
        return None

    # 2. Định nghĩa múi giờ Việt Nam
    vn_tz = pytz.timezone('Asia/Ho_Chi_Minh')

    # 3. Gán múi giờ VN vào object (Localize)
    # Lúc này Python hiểu: Đây là 23:22 ở VN (tức là 16:22 UTC)
    aware_dt = vn_tz.localize(naive_dt)

    return aware_dt

def generate_vietqr_link(amount, content, account_no, bank_id="MB"):
    """Tạo link ảnh VietQR"""
    import urllib.parse
    base_url = f"https://img.vietqr.io/image/{bank_id}-{account_no}-compact.png"
    params = {'amount': int(amount), 'addInfo': content}
    return f"{base_url}?{urllib.parse.urlencode(params)}"

def sync_campaign_data(campaign):
    """Quét API của một chiến dịch cụ thể"""
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    # Format URL: .../2000/transactionsV2
    url = campaign.api_url_template.format(account_no=campaign.account_number)
    
    params = {
        "fromDate": current_date, # Có thể chỉnh lùi ngày nếu cần
        "toDate": current_date,
        "pageNumber": 1,
        "pageSize": 20 # Chỉ lấy 20 giao dịch mới nhất để tối ưu
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        if "data" in data and "transactions" in data["data"]:
            for trans in data["data"]["transactions"]:
                process_single_transaction(trans, campaign)
    except Exception as e:
        print(f"Lỗi sync campaign {campaign.name}: {e}")

def process_single_transaction(trans_data, campaign):
    """Xử lý từng giao dịch: Lưu DB -> Regex tìm mã -> Khớp lệnh"""
    
    # 1. Chỉ nhận tiền vào (CREDIT)
    if trans_data.get("type") != "CREDIT":
        return

    # 2. Lưu vào DB (Tránh trùng lặp)

    # SỬ DỤNG HÀM XỬ LÝ GIỜ MỚI
    transaction_date = parse_vietnam_time(trans_data.get("transactionTime"))

    obj, created = ExternalTransaction.objects.get_or_create(
        transaction_id=trans_data.get("id"),
        defaults={
            'campaign': campaign,
            'transaction_date': transaction_date,
            'amount': trans_data.get("transactionAmount"),
            'description': trans_data.get("narrative", ""),
            'is_processed': False
        }
    )

    if not obj.is_processed:
        # 3. Logic khớp lệnh
        content = obj.description.upper()
        
        # Regex: Tìm chuỗi 6-8 ký tự in hoa (Mã Payment Code)
        match = re.search(r'\b[A-Z]{6,8}\b', content)
        
        if match:
            code = match.group(0)
            try:
                # Tìm PaymentRequest khớp: Code + Số tiền + Đúng chiến dịch
                req = PaymentRequest.objects.get(
                    payment_code=code,
                    status=PaymentRequest.Status.PENDING,
                    amount=obj.amount,
                    target_campaign=campaign
                )
                
                # Cập nhật trạng thái
                req.status = PaymentRequest.Status.SUCCESS
                req.save()
                
                obj.payment_request = req
                obj.is_processed = True
                obj.save()
                
                # Trigger nghiệp vụ
                finalize_payment(req)
                print(f"-> SUCCESS: {code}")
                
            except PaymentRequest.DoesNotExist:
                pass

def finalize_payment(req):
    """Xử lý nghiệp vụ sau khi thanh toán thành công"""
    if req.request_type == 'ACTIVATION':
        req.user.status = User.Status.ACTIVE
        req.user.save()
    elif req.request_type == 'SESSION_PAYMENT' and req.booking:
        req.booking.status = Booking.Status.PAID
        req.booking.save()

def run_smart_sync():
    """Logic thông minh: Chỉ sync những campaign đang có giao dịch chờ"""
    # Lấy các campaign có giao dịch Pending hoặc giao dịch mới tạo trong 24h
    yesterday = timezone.now() - timedelta(hours=24)
    
    campaign_ids = PaymentRequest.objects.filter(
        Q(status=PaymentRequest.Status.PENDING) | 
        Q(created_at__gte=yesterday)
    ).values_list('target_campaign_id', flat=True).distinct()
    
    if not campaign_ids:
        print("Không có giao dịch cần xử lý.")
        return

    campaigns = CharityCampaign.objects.filter(id__in=campaign_ids)
    for campaign in campaigns:
        print(f"Syncing: {campaign.name}")
        sync_campaign_data(campaign)