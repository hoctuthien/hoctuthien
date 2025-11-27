# core/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.cache import cache
from .models import PaymentRequest, CharityCampaign
from .services import generate_vietqr_link, sync_campaign_data

class CreateActivationPayment(APIView):
    """API tạo mã QR để kích hoạt tài khoản 10k"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.status == 'ACTIVE':
            return Response({"message": "Tài khoản đã kích hoạt"}, status=400)

        # 1. Chọn chiến dịch mặc định (VD: Lấy cái đầu tiên)
        campaign = CharityCampaign.objects.filter(is_active=True).first()
        if not campaign:
             return Response({"message": "Hệ thống chưa cấu hình quỹ từ thiện"}, status=500)

        # 2. Tạo Request
        req = PaymentRequest.objects.create(
            user=user,
            amount=10000,
            target_campaign=campaign,
            request_type='ACTIVATION'
        )

        # 3. Tạo QR Link
        content = f"HOCTUTHIEN {req.payment_code}"
        qr_link = generate_vietqr_link(req.amount, content, campaign.account_number, campaign.bank_id)

        return Response({
            "payment_code": req.payment_code,
            "amount": req.amount,
            "bank_account": campaign.account_number,
            "content": content,
            "qr_link": qr_link
        })

class CheckPaymentStatus(APIView):
    """API cho nút 'Tôi đã chuyển khoản'"""
    permission_classes = [IsAuthenticated]

    def post(self, request, payment_code):
        try:
            req = PaymentRequest.objects.get(payment_code=payment_code, user=request.user)
        except PaymentRequest.DoesNotExist:
            return Response({"status": "NOT_FOUND"}, status=404)

        if req.status == 'SUCCESS':
             return Response({"status": "SUCCESS", "message": "Thanh toán thành công"})

        # --- Rate Limit: Chống bấm liên tục ---
        cache_key = f"check_spam_{request.user.id}"
        if cache.get(cache_key):
             return Response({"status": "WAITING", "message": "Vui lòng đợi 30s..."}, status=429)

        # --- Force Sync: Quét ngay lập tức ---
        try:
            sync_campaign_data(req.target_campaign)
            # Set cache chặn trong 30s
            cache.set(cache_key, True, timeout=30)
        except Exception:
            return Response({"status": "ERROR"}, status=500)

        # Check lại DB sau khi sync
        req.refresh_from_db()
        if req.status == 'SUCCESS':
            return Response({"status": "SUCCESS"})
        
        return Response({"status": "PENDING", "message": "Chưa nhận được tiền"})