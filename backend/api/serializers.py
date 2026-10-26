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

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'email', 'name', 'avatar', 'campus', 
            'hostelOrDept', 'hostel_or_dept',
            'rating', 'rentalsCompleted', 'rentals_completed',
            'verifiedStudent', 'verified_student',
            'joinYear', 'join_year',
            'student_id_card_url'
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
            'paymentMethod', 'payment_method',
            'transactionId', 'transaction_id',
            'rentalFee', 'rental_fee',
            'platformFee', 'platform_fee',
            'securityDeposit', 'security_deposit',
            'totalPaid', 'total_paid',
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
            'totalPaid': float(instance.total_paid)
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
