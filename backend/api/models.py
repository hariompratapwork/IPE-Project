from django.db import models
from django.utils import timezone
import uuid

class Campus(models.Model):
    id = models.CharField(max_length=50, primary_key=True)  # e.g. 'marwadi', 'iitb'
    name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    student_count = models.CharField(max_length=50, default='10,000+')

    class Meta:
        verbose_name_plural = "Campuses"

    def __str__(self):
        return f"{self.name} ({self.short_name})"


class StudentProfile(models.Model):
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150)
    avatar = models.TextField(blank=True, default='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200')
    campus = models.CharField(max_length=200, default='Marwadi University')
    hostel_or_dept = models.CharField(max_length=150, blank=True, default='Engineering Dept')
    rating = models.FloatField(default=5.0)
    rentals_completed = models.IntegerField(default=0)
    verified_student = models.BooleanField(default=True)
    join_year = models.CharField(max_length=10, default='2024')
    student_id_card_url = models.TextField(blank=True, null=True)
    
    # Owner UPI Payment Settings
    upi_id = models.CharField(max_length=100, blank=True, null=True, default='')
    upi_qr_url = models.TextField(blank=True, null=True, default='')

    # OTP Authentication
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)
    is_otp_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.email})"


class RentalItem(models.Model):
    CATEGORY_CHOICES = [
        ('Electronics', 'Electronics'),
        ('Study', 'Study'),
        ('Gaming', 'Gaming'),
        ('Travel', 'Travel'),
        ('Sports', 'Sports'),
        ('Photography', 'Photography'),
        ('College Essentials', 'College Essentials'),
    ]

    CONDITION_CHOICES = [
        ('Like New', 'Like New'),
        ('Excellent', 'Excellent'),
        ('Good', 'Good'),
        ('Fair', 'Fair'),
    ]

    id = models.CharField(max_length=50, primary_key=True)  # e.g. 'item-1'
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2)
    rating = models.FloatField(default=5.0)
    review_count = models.IntegerField(default=0)
    location = models.CharField(max_length=200)
    campus = models.CharField(max_length=200, default='Marwadi University')
    image_url = models.TextField()
    images = models.JSONField(default=list, blank=True)
    condition = models.CharField(max_length=50, choices=CONDITION_CHOICES, default='Like New')
    is_popular = models.BooleanField(default=False)
    available_now = models.BooleanField(default=True)
    featured = models.BooleanField(default=False)
    
    # Direct Owner UPI Payment details
    owner_upi_id = models.CharField(max_length=100, blank=True, null=True, default='')
    owner_upi_qr_url = models.TextField(blank=True, null=True, default='')

    owner = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='items')
    description = models.TextField(blank=True)
    highlights = models.JSONField(default=list, blank=True)
    included_items = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - ₹{self.price_per_day}/day"


class Review(models.Model):
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    item = models.ForeignKey(RentalItem, on_delete=models.CASCADE, related_name='reviews')
    user_name = models.CharField(max_length=150)
    user_avatar = models.TextField(blank=True)
    rating = models.FloatField(default=5.0)
    date = models.CharField(max_length=50, default='Recent')
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.item.title} by {self.user_name} ({self.rating}★)"


class RentalOrder(models.Model):
    ORDER_STATUS_CHOICES = [
        ('AWAITING_PAYMENT', 'Awaiting Payment'),
        ('PAYMENT_PROOF_SUBMITTED', 'Payment Proof Submitted'),
        ('PAYMENT_CONFIRMED_BY_OWNER', 'Payment Confirmed by Owner'),
        ('PAYMENT_DISPUTED', 'Payment Disputed'),
        ('READY_FOR_PICKUP', 'Ready for Pickup'),
        ('RENTAL_IN_PROGRESS', 'Rental In Progress'),
        ('RENTAL_OVERDUE', 'Rental Overdue'),
        ('RETURN_PENDING_CONFIRMATION', 'Return Pending Confirmation'),
        ('DEPOSIT_REFUND_PENDING_CONFIRMATION', 'Deposit Refund Pending Confirmation'),
        ('DEPOSIT_REFUND_COMPLETED', 'Deposit Refund Completed'),
        # Legacy status compatibility:
        ('REQUESTED', 'REQUESTED'),
        ('ACCEPTED', 'ACCEPTED'),
        ('PAID', 'PAID'),
        ('ACTIVE_RENTAL', 'ACTIVE_RENTAL'),
        ('RETURNED', 'RETURNED'),
        ('COMPLETED', 'COMPLETED'),
        ('DISPUTED', 'DISPUTED'),
    ]

    order_id = models.CharField(max_length=100, unique=True, primary_key=True)  # e.g. CLP20240922-4587
    pickup_code = models.CharField(max_length=20)  # e.g. #7A3F
    qr_payload = models.TextField()
    item = models.ForeignKey(RentalItem, on_delete=models.CASCADE, related_name='orders')
    
    renter_name = models.CharField(max_length=150)
    renter_email = models.EmailField()
    renter_campus = models.CharField(max_length=200)
    duration_mode = models.CharField(max_length=20, default='DAILY')  # 'HOURLY' or 'DAILY'
    duration_value = models.IntegerField(default=1)
    start_date = models.CharField(max_length=50)
    end_date = models.CharField(max_length=50)
    pickup_time = models.CharField(max_length=50, blank=True)
    pickup_location = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=50, choices=ORDER_STATUS_CHOICES, default='AWAITING_PAYMENT')

    # Direct Owner UPI Details
    owner_upi_id = models.CharField(max_length=100, blank=True, default='')
    owner_upi_qr_url = models.TextField(blank=True, default='')

    # Payment details (direct to owner)
    payment_method = models.CharField(max_length=50, default='UPI_QR')
    transaction_id = models.CharField(max_length=100)
    rental_fee = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2)
    total_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_timestamp = models.CharField(max_length=100, blank=True)

    # UPI Payment Proof & Dual Confirmations
    payment_proof_url = models.TextField(blank=True, null=True)
    upi_reference_no = models.CharField(max_length=100, blank=True, null=True)
    renter_paid_confirmed = models.BooleanField(default=False)
    renter_paid_at = models.DateTimeField(null=True, blank=True)
    owner_payment_confirmed = models.BooleanField(default=False)
    owner_payment_confirmed_at = models.DateTimeField(null=True, blank=True)
    owner_payment_rejected = models.BooleanField(default=False)
    owner_payment_rejected_at = models.DateTimeField(null=True, blank=True)
    payment_dispute_reason = models.TextField(blank=True, null=True)

    # Commission Management (Calculated strictly on rental_fee only, excluding refundable deposit)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=5.0)  # e.g. 5%
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    commission_status = models.CharField(
        max_length=30, 
        choices=[('UNPAID', 'UNPAID'), ('SETTLED', 'SETTLED')], 
        default='UNPAID'
    )
    commission_settled_at = models.DateTimeField(null=True, blank=True)

    # Refundable Security Deposit Lifecycle
    DEPOSIT_STATUS_CHOICES = [
        ('DEPOSIT_NOT_CONFIRMED', 'Deposit Not Confirmed'),
        ('DEPOSIT_HELD_BY_OWNER', 'Deposit Held by Owner'),
        ('REFUND_PENDING_CONFIRMATION', 'Deposit Refund Pending Confirmation'),
        ('REFUND_COMPLETED', 'Deposit Refund Completed'),
        ('DISPUTED', 'Disputed / Problem Reported'),
    ]
    deposit_status = models.CharField(max_length=50, choices=DEPOSIT_STATUS_CHOICES, default='DEPOSIT_NOT_CONFIRMED')
    renter_handover_confirmed = models.BooleanField(default=False)
    renter_handover_at = models.DateTimeField(null=True, blank=True)
    owner_handover_confirmed = models.BooleanField(default=False)
    owner_handover_at = models.DateTimeField(null=True, blank=True)
    owner_deposit_returned = models.BooleanField(default=False)
    owner_deposit_returned_at = models.DateTimeField(null=True, blank=True)
    renter_deposit_received = models.BooleanField(default=False)
    renter_deposit_received_at = models.DateTimeField(null=True, blank=True)

    # Gadget Condition Checklists and Inspection Photos
    pickup_checklist = models.JSONField(default=dict, blank=True)
    return_checklist = models.JSONField(default=dict, blank=True)
    pickup_photos = models.JSONField(default=list, blank=True)
    return_photos = models.JSONField(default=list, blank=True)
    renter_return_confirmed = models.BooleanField(default=False)
    renter_return_at = models.DateTimeField(null=True, blank=True)
    owner_return_confirmed = models.BooleanField(default=False)
    owner_return_at = models.DateTimeField(null=True, blank=True)
    actual_return_time = models.DateTimeField(null=True, blank=True)

    # Problem / Disagreement reporting
    dispute_reason = models.TextField(blank=True, null=True)
    disputed_by = models.CharField(max_length=100, blank=True, null=True)
    disputed_at = models.DateTimeField(null=True, blank=True)

    # Verification and Live Timer
    video_recorded = models.BooleanField(default=False)
    video_timestamp = models.CharField(max_length=100, blank=True, null=True)
    student_id_card_url = models.TextField(blank=True, null=True)
    id_card_verified = models.BooleanField(default=False)
    rental_start_time = models.BigIntegerField(null=True, blank=True)  # Unix timestamp in milliseconds
    rental_end_time = models.BigIntegerField(null=True, blank=True)    # Unix timestamp in milliseconds
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.order_id} - {self.item.title} ({self.status})"


class AdminService(models.Model):
    id = models.CharField(max_length=50, primary_key=True)  # e.g. 'srv-1'
    title = models.CharField(max_length=100)
    subtitle = models.CharField(max_length=200)
    description = models.TextField()
    starting_price = models.CharField(max_length=100)
    icon_name = models.CharField(max_length=50)
    image_url = models.TextField()
    deliverables = models.JSONField(default=list)

    def __str__(self):
        return f"{self.title} ({self.starting_price})"


class ServiceRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'PENDING'),
        ('ACCEPTED', 'ACCEPTED'),
        ('IN_PROGRESS', 'IN_PROGRESS'),
        ('COMPLETED', 'COMPLETED'),
    ]

    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    service_type = models.CharField(max_length=100)
    student_name = models.CharField(max_length=150)
    student_email = models.EmailField()  # Must end with .ac.in
    campus = models.CharField(max_length=200)
    details = models.TextField()
    deadline = models.CharField(max_length=100)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.service_type} for {self.student_name} ({self.status})"
