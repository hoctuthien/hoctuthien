from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, CharityCampaign, MentorProfile, Booking, PaymentRequest, ExternalTransaction, Skill

# 1. Tùy chỉnh hiển thị User
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Thêm các trường tùy chỉnh vào form xem chi tiết
    fieldsets = UserAdmin.fieldsets + (
        ('Thông tin bổ sung', {'fields': ('is_mentor', 'phone_number', 'status')}),
    )
    # Các cột hiển thị ở danh sách
    list_display = ['username', 'email', 'full_name', 'is_mentor', 'status']
    list_filter = ['is_mentor', 'status']
    search_fields = ['email', 'full_name', 'username']

# 2. Quản lý Chiến dịch từ thiện
@admin.register(CharityCampaign)
class CharityCampaignAdmin(admin.ModelAdmin):
    list_display = ['name', 'account_number', 'bank_id', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'account_number']

# 3. Hồ sơ Mentor
@admin.register(MentorProfile)
class MentorProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'job_title', 'default_price', 'selected_campaign']
    search_fields = ['user__email', 'user__full_name']

# 4. Kỹ năng / Lĩnh vực
@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name']

# 5. Đặt lịch (Booking)
@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['mentee', 'mentor', 'price', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['mentee__email', 'mentor__email']

# 6. Yêu cầu thanh toán (Quan trọng nhất để check code)
@admin.register(PaymentRequest)
class PaymentRequestAdmin(admin.ModelAdmin):
    list_display = ['payment_code', 'user', 'amount', 'status', 'request_type', 'target_campaign']
    list_filter = ['status', 'request_type']
    search_fields = ['payment_code', 'user__email']
    readonly_fields = ['payment_code', 'created_at'] # Không cho sửa mã code và ngày tạo

# 7. Giao dịch từ API ngân hàng
@admin.register(ExternalTransaction)
class ExternalTransactionAdmin(admin.ModelAdmin):
    list_display = ['transaction_id', 'amount', 'transaction_date', 'is_processed', 'campaign']
    list_filter = ['is_processed', 'campaign']
    search_fields = ['transaction_id', 'description']
    ordering = ['-transaction_date'] # Sắp xếp mới nhất lên đầu