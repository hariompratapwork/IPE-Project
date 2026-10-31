from django.contrib import admin
from .models import (
    Campus,
    StudentProfile,
    RentalItem,
    Review,
    RentalOrder,
    AdminService,
    ServiceRequest
)

@admin.register(Campus)
class CampusAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'short_name', 'city', 'student_count')
    search_fields = ('name', 'short_name', 'city')


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'campus', 'verified_student', 'rating', 'rentals_completed')
    search_fields = ('name', 'email', 'campus')
    list_filter = ('verified_student', 'campus')


@admin.register(RentalItem)
class RentalItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'category', 'price_per_day', 'security_deposit', 'campus', 'available_now', 'rating')
    list_filter = ('category', 'campus', 'available_now', 'condition')
    search_fields = ('title', 'description', 'location')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user_name', 'item', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('user_name', 'comment')


@admin.register(RentalOrder)
class RentalOrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_id', 'pickup_code', 'item', 'renter_name', 
        'status', 'rental_fee', 'security_deposit', 'total_paid',
        'renter_paid_confirmed', 'owner_payment_confirmed',
        'commission_amount', 'commission_status', 'deposit_status', 'created_at'
    )
    list_filter = ('status', 'commission_status', 'deposit_status', 'duration_mode')
    search_fields = ('order_id', 'pickup_code', 'renter_name', 'renter_email', 'owner_upi_id')
    actions = ['mark_commission_settled']

    @admin.action(description="Mark selected commission records as SETTLED")
    def mark_commission_settled(self, request, queryset):
        from django.utils import timezone
        queryset.update(commission_status='SETTLED', commission_settled_at=timezone.now())


@admin.register(AdminService)
class AdminServiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'starting_price', 'icon_name')
    search_fields = ('title', 'subtitle')


@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'service_type', 'student_name', 'student_email', 'campus', 'status', 'created_at')
    list_filter = ('service_type', 'status', 'campus')
    search_fields = ('student_name', 'student_email', 'details')
