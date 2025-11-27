from django.urls import path
from .views import CreateActivationPayment, CheckPaymentStatus

urlpatterns = [
    path('payment/activation/', CreateActivationPayment.as_view()),
    path('payment/check/<str:payment_code>/', CheckPaymentStatus.as_view()),
]