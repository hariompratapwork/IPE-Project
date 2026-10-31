from rest_framework import serializers
from .models import (
    Campus,
    StudentProfile,
    RentalItem,
    Review,
    RentalOrder,
    AdminService,
    ServiceRequest,
)

class CampusSerializer(serializers.ModelSerializer):
    studentCount = serializers.CharField(source='student_count', required=False)
    shortName = serializers.CharField(source='short_name', required=False)

    class Meta:
        model = Campus
        fields = ['id', 'name', 'shortName', 'short_name', 'city', 'studentCount', 'student_count']


class StudentProfileSerializer(serializers.ModelSerializer):
    hostelOrDept = serializers.CharField(source='hostel_or_dept', required=False)
    rentalsCompleted = serializers.IntegerField(source='rentals_completed', required=False)
    verifiedStudent = serializers.BooleanField(source='verified_student', required=False)
    joinYear = serializers.CharField(source='join_year', required=False)
    upiId = serializers.CharField(source='upi_id', required=False, allow_blank=True, allow_null=True)
    upiQrUrl = serializers.CharField(source='upi_qr_url', required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'email', 'name', 'avatar', 'campus', 
            'hostelOrDept', 'hostel_or_dept',
            'rating', 'rentalsCompleted', 'rentals_completed',
            'verifiedStudent', 'verified_student',
            'joinYear', 'join_year',
            'student_id_card_url',
            'upiId', 'upi_id',
            'upiQrUrl', 'upi_qr_url'
        ]


class ReviewSerializer(serializers.ModelSerializer):
    userName = serializers.CharField(source='user_name', required=False)
    userAvatar = serializers.CharField(source='user_avatar', required=False)

    class Meta:
        model = Review
        fields = ['id', 'userName', 'user_name', 'userAvatar', 'user_avatar', 'rating', 'date', 'comment']


class RentalItemSerializer(serializers.ModelSerializer):
    owner = StudentProfileSerializer(read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    pricePerDay = serializers.FloatField(source='price_per_day', required=False)
    securityDeposit = serializers.FloatField(source='security_deposit', required=False)
    reviewCount = serializers.IntegerField(source='review_count', required=False)
    imageUrl = serializers.CharField(source='image_url', required=False)
    isPopular = serializers.BooleanField(source='is_popular', required=False)
    availableNow = serializers.BooleanField(source='available_now', required=False)
    includedItems = serializers.ListField(source='included_items', required=False)
    ownerUpiId = serializers.CharField(source='owner_upi_id', required=False, allow_blank=True, allow_null=True)
    ownerUpiQrUrl = serializers.CharField(source='owner_upi_qr_url', required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = RentalItem
        fields = [
            'id', 'title', 'category', 
            'pricePerDay', 'price_per_day',
            'securityDeposit', 'security_deposit',
            'rating', 'reviewCount', 'review_count',
            'location', 'campus', 
            'imageUrl', 'image_url', 'images',
            'condition', 'isPopular', 'is_popular',
            'availableNow', 'available_now', 'featured',
            'ownerUpiId', 'owner_upi_id',
            'ownerUpiQrUrl', 'owner_upi_qr_url',
            'owner', 'description', 'highlights',
            'includedItems', 'included_items', 'reviews'
        ]

    def create(self, validated_data):
        # Allow creating items with a default or existing owner
        request = self.context.get('request')
        owner = None
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            owner, _ = StudentProfile.objects.get_or_create(
                email=request.user.email,
                defaults={'name': request.user.username}
            )
        if not owner:
            owner = StudentProfile.objects.first()
            if not owner:
                owner = StudentProfile.objects.create(
                    id='owner-default',
                    email='student@marwadi.ac.in',
                    name='Campus Student',
                    campus='Marwadi University'
                )
        validated_data['owner'] = owner
        return super().create(validated_data)


class RentalOrderSerializer(serializers.ModelSerializer):
    item = RentalItemSerializer(read_only=True)
    itemId = serializers.CharField(write_only=True, required=False)
    
    # CamelCase aliases for frontend matching
    orderId = serializers.CharField(source='order_id', required=False)
    pickupCode = serializers.CharField(source='pickup_code', required=False)
    qrPayload = serializers.CharField(source='qr_payload', required=False)
    renterName = serializers.CharField(source='renter_name', required=False)
    renterEmail = serializers.EmailField(source='renter_email', required=False)
    renterCampus = serializers.CharField(source='renter_campus', required=False)
    durationMode = serializers.CharField(source='duration_mode', required=False)
    durationValue = serializers.IntegerField(source='duration_value', required=False)
    startDate = serializers.CharField(source='start_date', required=False)
    endDate = serializers.CharField(source='end_date', required=False)
    pickupTime = serializers.CharField(source='pickup_time', required=False)
    pickupLocation = serializers.CharField(source='pickup_location', required=False)
    paymentMethod = serializers.CharField(source='payment_method', required=False)
    transactionId = serializers.CharField(source='transaction_id', required=False)
    rentalFee = serializers.FloatField(source='rental_fee', required=False)
    platformFee = serializers.FloatField(source='platform_fee', required=False)
    securityDeposit = serializers.FloatField(source='security_deposit', required=False)
    totalPaid = serializers.FloatField(source='total_paid', required=False)
    videoRecorded = serializers.BooleanField(source='video_recorded', required=False)
    videoTimestamp = serializers.CharField(source='video_timestamp', required=False)
    studentIdCardUrl = serializers.CharField(source='student_id_card_url', required=False)
    idCardVerified = serializers.BooleanField(source='id_card_verified', required=False)
    rentalStartTime = serializers.IntegerField(source='rental_start_time', required=False)
    rentalEndTime = serializers.IntegerField(source='rental_end_time', required=False)

    # Owner Direct UPI
    ownerUpiId = serializers.CharField(source='owner_upi_id', required=False, allow_blank=True)
    ownerUpiQrUrl = serializers.CharField(source='owner_upi_qr_url', required=False, allow_blank=True)

    # Confirmations & Payment Proof
    paymentProofUrl = serializers.CharField(source='payment_proof_url', required=False, allow_blank=True, allow_null=True)
    upiReferenceNo = serializers.CharField(source='upi_reference_no', required=False, allow_blank=True, allow_null=True)
    renterPaidConfirmed = serializers.BooleanField(source='renter_paid_confirmed', required=False)
    renterPaidAt = serializers.DateTimeField(source='renter_paid_at', required=False, allow_null=True)
    ownerPaymentConfirmed = serializers.BooleanField(source='owner_payment_confirmed', required=False)
    ownerPaymentConfirmedAt = serializers.DateTimeField(source='owner_payment_confirmed_at', required=False, allow_null=True)
    ownerPaymentRejected = serializers.BooleanField(source='owner_payment_rejected', required=False)
    ownerPaymentRejectedAt = serializers.DateTimeField(source='owner_payment_rejected_at', required=False, allow_null=True)
    paymentDisputeReason = serializers.CharField(source='payment_dispute_reason', required=False, allow_blank=True, allow_null=True)

    # Commission Tracking (on rental fee only)
    commissionRate = serializers.FloatField(source='commission_rate', required=False)
    commissionAmount = serializers.FloatField(source='commission_amount', required=False)
    commissionStatus = serializers.CharField(source='commission_status', required=False)
    commissionSettledAt = serializers.DateTimeField(source='commission_settled_at', required=False, allow_null=True)

    # Security Deposit Lifecycle & Handover Checklists
    depositStatus = serializers.CharField(source='deposit_status', required=False)
    renterHandoverConfirmed = serializers.BooleanField(source='renter_handover_confirmed', required=False)
    renterHandoverAt = serializers.DateTimeField(source='renter_handover_at', required=False, allow_null=True)
    ownerHandoverConfirmed = serializers.BooleanField(source='owner_handover_confirmed', required=False)
    ownerHandoverAt = serializers.DateTimeField(source='owner_handover_at', required=False, allow_null=True)
    ownerDepositReturned = serializers.BooleanField(source='owner_deposit_returned', required=False)
    ownerDepositReturnedAt = serializers.DateTimeField(source='owner_deposit_returned_at', required=False, allow_null=True)
    renterDepositReceived = serializers.BooleanField(source='renter_deposit_received', required=False)
    renterDepositReceivedAt = serializers.DateTimeField(source='renter_deposit_received_at', required=False, allow_null=True)

    # Gadget Condition Checklists & Inspection Photos
    pickupChecklist = serializers.JSONField(source='pickup_checklist', required=False)
    returnChecklist = serializers.JSONField(source='return_checklist', required=False)
    pickupPhotos = serializers.JSONField(source='pickup_photos', required=False)
    returnPhotos = serializers.JSONField(source='return_photos', required=False)
    renterReturnConfirmed = serializers.BooleanField(source='renter_return_confirmed', required=False)
    renterReturnAt = serializers.DateTimeField(source='renter_return_at', required=False, allow_null=True)
    ownerReturnConfirmed = serializers.BooleanField(source='owner_return_confirmed', required=False)
    ownerReturnAt = serializers.DateTimeField(source='owner_return_at', required=False, allow_null=True)
    actualReturnTime = serializers.DateTimeField(source='actual_return_time', required=False, allow_null=True)

    # Disagreements
    disputeReason = serializers.CharField(source='dispute_reason', required=False, allow_blank=True, allow_null=True)
    disputedBy = serializers.CharField(source='disputed_by', required=False, allow_blank=True, allow_null=True)
    disputedAt = serializers.DateTimeField(source='disputed_at', required=False, allow_null=True)

    class Meta:
        model = RentalOrder
        fields = [
            'orderId', 'order_id',
            'pickupCode', 'pickup_code',
            'qrPayload', 'qr_payload',
            'item', 'itemId',
            'renterName', 'renter_name',
            'renterEmail', 'renter_email',
            'renterCampus', 'renter_campus',
            'durationMode', 'duration_mode',
            'durationValue', 'duration_value',
            'startDate', 'start_date',
            'endDate', 'end_date',
            'pickupTime', 'pickup_time',
            'pickupLocation', 'pickup_location',
            'status',
            'ownerUpiId', 'owner_upi_id',
            'ownerUpiQrUrl', 'owner_upi_qr_url',
            'paymentMethod', 'payment_method',
            'transactionId', 'transaction_id',
            'rentalFee', 'rental_fee',
            'platformFee', 'platform_fee',
            'securityDeposit', 'security_deposit',
            'totalPaid', 'total_paid',
            'paymentProofUrl', 'payment_proof_url',
            'upiReferenceNo', 'upi_reference_no',
            'renterPaidConfirmed', 'renter_paid_confirmed',
            'renterPaidAt', 'renter_paid_at',
            'ownerPaymentConfirmed', 'owner_payment_confirmed',
            'ownerPaymentConfirmedAt', 'owner_payment_confirmed_at',
            'ownerPaymentRejected', 'owner_payment_rejected',
            'ownerPaymentRejectedAt', 'owner_payment_rejected_at',
            'paymentDisputeReason', 'payment_dispute_reason',
            'commissionRate', 'commission_rate',
            'commissionAmount', 'commission_amount',
            'commissionStatus', 'commission_status',
            'commissionSettledAt', 'commission_settled_at',
            'depositStatus', 'deposit_status',
            'renterHandoverConfirmed', 'renter_handover_confirmed',
            'renterHandoverAt', 'renter_handover_at',
            'ownerHandoverConfirmed', 'owner_handover_confirmed',
            'ownerHandoverAt', 'owner_handover_at',
            'ownerDepositReturned', 'owner_deposit_returned',
            'ownerDepositReturnedAt', 'owner_deposit_returned_at',
            'renterDepositReceived', 'renter_deposit_received',
            'renterDepositReceivedAt', 'renter_deposit_received_at',
            'pickupChecklist', 'pickup_checklist',
            'returnChecklist', 'return_checklist',
            'pickupPhotos', 'pickup_photos',
            'returnPhotos', 'return_photos',
            'renterReturnConfirmed', 'renter_return_confirmed',
            'renterReturnAt', 'renter_return_at',
            'ownerReturnConfirmed', 'owner_return_confirmed',
            'ownerReturnAt', 'owner_return_at',
            'actualReturnTime', 'actual_return_time',
            'disputeReason', 'dispute_reason',
            'disputedBy', 'disputed_by',
            'disputedAt', 'disputed_at',
            'videoRecorded', 'video_recorded',
            'videoTimestamp', 'video_timestamp',
            'studentIdCardUrl', 'student_id_card_url',
            'idCardVerified', 'id_card_verified',
            'rentalStartTime', 'rental_start_time',
            'rentalEndTime', 'rental_end_time',
            'created_at'
        ]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Format payment nested object for frontend
        ret['payment'] = {
            'method': instance.payment_method,
            'transactionId': instance.transaction_id,
            'timestamp': instance.payment_timestamp or str(instance.created_at),
            'rentalFee': float(instance.rental_fee),
            'platformFee': float(instance.platform_fee),
            'securityDeposit': float(instance.security_deposit),
            'totalPaid': float(instance.total_paid),
            'ownerUpiId': instance.owner_upi_id,
            'ownerUpiQrUrl': instance.owner_upi_qr_url,
            'paymentProofUrl': instance.payment_proof_url,
            'upiReferenceNo': instance.upi_reference_no,
            'renterPaidConfirmed': instance.renter_paid_confirmed,
            'renterPaidAt': instance.renter_paid_at.isoformat() if instance.renter_paid_at else None,
            'ownerPaymentConfirmed': instance.owner_payment_confirmed,
            'ownerPaymentConfirmedAt': instance.owner_payment_confirmed_at.isoformat() if instance.owner_payment_confirmed_at else None,
            'ownerPaymentRejected': instance.owner_payment_rejected,
            'paymentDisputeReason': instance.payment_dispute_reason,
            'commissionRate': float(instance.commission_rate),
            'commissionAmount': float(instance.commission_amount),
            'commissionStatus': instance.commission_status,
            'depositStatus': instance.deposit_status,
        }
        return ret


class AdminServiceSerializer(serializers.ModelSerializer):
    startingPrice = serializers.CharField(source='starting_price', required=False)
    iconName = serializers.CharField(source='icon_name', required=False)
    imageUrl = serializers.CharField(source='image_url', required=False)

    class Meta:
        model = AdminService
        fields = [
            'id', 'title', 'subtitle', 'description', 
            'startingPrice', 'starting_price',
            'iconName', 'icon_name',
            'imageUrl', 'image_url',
            'deliverables'
        ]


class ServiceRequestSerializer(serializers.ModelSerializer):
    serviceType = serializers.CharField(source='service_type', required=False)
    studentName = serializers.CharField(source='student_name', required=False)
    studentEmail = serializers.EmailField(source='student_email', required=False)

    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'serviceType', 'service_type',
            'studentName', 'student_name',
            'studentEmail', 'student_email',
            'campus', 'details', 'deadline', 'status', 'created_at'
        ]

    def to_internal_value(self, data):
        mapped_data = data.copy()
        if 'serviceType' in data and 'service_type' not in mapped_data:
            mapped_data['service_type'] = data['serviceType']
        if 'studentName' in data and 'student_name' not in mapped_data:
            mapped_data['student_name'] = data['studentName']
        if 'studentEmail' in data and 'student_email' not in mapped_data:
            mapped_data['student_email'] = data['studentEmail']
        return super().to_internal_value(mapped_data)

    def validate_student_email(self, value):
        if not value.strip().lower().endswith('.ac.in'):
            raise serializers.ValidationError("Student email must end with .ac.in (university domain).")
        return value.strip().lower()
