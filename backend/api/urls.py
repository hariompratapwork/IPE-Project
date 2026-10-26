from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CampusViewSet,
    RentalItemViewSet,
    RentalOrderViewSet,
    AdminServiceViewSet,
    ServiceRequestViewSet,
    send_otp,
    verify_otp
)

router = DefaultRouter()
router.register(r'campuses', CampusViewSet, basename='campus')
router.register(r'items', RentalItemViewSet, basename='item')
router.register(r'orders', RentalOrderViewSet, basename='order')
router.register(r'services', AdminServiceViewSet, basename='service')
router.register(r'service-requests', ServiceRequestViewSet, basename='service-request')

urlpatterns = [
    path('auth/send-otp/', send_otp, name='send_otp'),
    path('auth/verify-otp/', verify_otp, name='verify_otp'),
    path('', include(router.urls)),
]
