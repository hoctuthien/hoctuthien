# core/models.py
import uuid
import random
import string
from django.db import models
from django.contrib.auth.models import AbstractUser

# --- UTILS HELPERS ---
def generate_payment_code():
    """Sinh mã 6 ký tự in hoa (A-Z) để tránh bị ngân hàng che số"""
    return ''.join(random.choices(string.ascii_uppercase, k=6))

# --- MODELS ---

class User(AbstractUser):
    class Status(models.TextChoices):
        UNVERIFIED = 'UNVERIFIED', 'Chưa kích hoạt'
        ACTIVE = 'ACTIVE', 'Đã kích hoạt'
        LOCKED = 'LOCKED', 'Bị khóa'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    is_mentor = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UNVERIFIED)

    # Django bắt buộc khai báo lại nếu override AbstractUser mà không đổi username field
    email = models.EmailField(unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'full_name']

    def __str__(self):
        return self.email

class CharityCampaign(models.Model):
    """Lưu thông tin các chiến dịch/tài khoản ngân hàng Thiện Nguyện"""
    name = models.CharField(max_length=255) # VD: Xây cầu, Nuôi em
    account_number = models.CharField(max_length=50, unique=True) # VD: 2000
    bank_id = models.CharField(max_length=20, default="MB") # BinID cho VietQR
    api_url_template = models.CharField(
        max_length=500, 
        default="https://apiv2.thiennguyen.app/api/v2/bank-account-transaction/{account_no}/transactionsV2"
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.account_number})"

class MentorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mentor_profile')
    bio = models.TextField(blank=True)
    job_title = models.CharField(max_length=255, blank=True)
    default_price = models.DecimalField(max_digits=10, decimal_places=0, default=50000)
    # Mentor chọn quỹ từ thiện mặc định muốn ủng hộ
    selected_campaign = models.ForeignKey(CharityCampaign, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.user.full_name
    
class Skill(models.Model):
    name = models.CharField(max_length=100)
    # Quan hệ nhiều-nhiều: Một Mentor có nhiều Skill, Một Skill có nhiều Mentor
    mentors = models.ManyToManyField(MentorProfile, related_name='skills', blank=True)

    def __str__(self):
        return self.name

class Booking(models.Model):
    class Status(models.TextChoices):
        CONFIRMED = 'CONFIRMED', 'Đã đặt'
        PAID = 'PAID', 'Đã thanh toán (từ thiện)'
        CANCELLED = 'CANCELLED', 'Đã hủy'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mentee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings_as_mentee')
    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings_as_mentor')
    price = models.DecimalField(max_digits=10, decimal_places=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CONFIRMED)
    created_at = models.DateTimeField(auto_now_add=True)

class PaymentRequest(models.Model):
    class Type(models.TextChoices):
        ACTIVATION = 'ACTIVATION', 'Kích hoạt'
        SESSION_PAYMENT = 'SESSION_PAYMENT', 'Thanh toán học phí'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Đang chờ'
        SUCCESS = 'SUCCESS', 'Thành công'
        EXPIRED = 'EXPIRED', 'Hết hạn'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_requests')
    # Bắt buộc phải biết chuyển tiền vào chiến dịch nào để check API tương ứng
    target_campaign = models.ForeignKey(CharityCampaign, on_delete=models.CASCADE)
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True)
    
    amount = models.DecimalField(max_digits=10, decimal_places=0)
    payment_code = models.CharField(max_length=8, unique=True, default=generate_payment_code)
    request_type = models.CharField(max_length=20, choices=Type.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

class ExternalTransaction(models.Model):
    """Lưu lịch sử lấy từ API Thiện Nguyện"""
    transaction_id = models.CharField(max_length=100, unique=True)
    campaign = models.ForeignKey(CharityCampaign, on_delete=models.CASCADE)
    transaction_date = models.DateTimeField()
    amount = models.DecimalField(max_digits=15, decimal_places=0)
    description = models.TextField()
    payment_request = models.ForeignKey(PaymentRequest, on_delete=models.SET_NULL, null=True, blank=True)
    is_processed = models.BooleanField(default=False)