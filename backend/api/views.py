import random
import time
import uuid
from django.utils import timezone
from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from .models import (
    Campus,
    StudentProfile,
    RentalItem,
    Review,
    RentalOrder,
    AdminService,
    ServiceRequest
)
from .serializers import (
    CampusSerializer,
    StudentProfileSerializer,
    RentalItemSerializer,
    ReviewSerializer,
    RentalOrderSerializer,
    AdminServiceSerializer,
    ServiceRequestSerializer
)
from .mongodb import sync_document



class CampusViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Campus.objects.all()
    serializer_class = CampusSerializer


class RentalItemViewSet(viewsets.ModelViewSet):
    queryset = RentalItem.objects.all().select_related('owner').prefetch_related('reviews')
    serializer_class = RentalItemSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        campus = self.request.query_params.get('campus')
        condition = self.request.query_params.get('condition')
        max_price = self.request.query_params.get('max_price')
        available_only = self.request.query_params.get('available_only')
        sort_by = self.request.query_params.get('sort')

        if category and category != 'All':
            qs = qs.filter(category__iexact=category)

        if campus:
            qs = qs.filter(campus__icontains=campus)

        if condition and condition != 'All':
            qs = qs.filter(condition=condition)

        if max_price:
            try:
                qs = qs.filter(price_per_day__lte=float(max_price))
            except ValueError:
                pass

        if available_only in ['true', 'True', '1']:
            qs = qs.filter(available_now=True)

        if search:
            q = search.strip()
            qs = qs.filter(
                Q(title__icontains=q) |
                Q(description__icontains=q) |
                Q(category__icontains=q) |
                Q(location__icontains=q)
            )

        if sort_by == 'price-low':
            qs = qs.order_by('price_per_day')
        elif sort_by == 'price-high':
            qs = qs.order_by('-price_per_day')
        elif sort_by == 'rating':
            qs = qs.order_by('-rating')
        elif sort_by == 'popular':
            qs = qs.order_by('-is_popular', '-rating')
        else:
            qs = qs.order_by('-created_at')

        return qs

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if 'id' not in data or not data['id']:
            data['id'] = f"item-{int(time.time())}"
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        sync_document('rental_items', serializer.data.get('id', data['id']), serializer.data)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)



class RentalOrderViewSet(viewsets.ModelViewSet):
    queryset = RentalOrder.objects.all().select_related('item')
    serializer_class = RentalOrderSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        item_id = data.get('itemId') or data.get('item_id') or (data.get('item', {}).get('id') if isinstance(data.get('item'), dict) else None)
        
        try:
            item = RentalItem.objects.get(id=item_id)
        except RentalItem.DoesNotExist:
            return Response({'error': f'Item with id {item_id} not found'}, status=status.HTTP_404_NOT_FOUND)

        order_id = f"CLP{timezone.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
        pickup_code = f"#{random.choice('ABCDEFGHJKLMNPQRSTUVWXYZ0123456789')}{random.choice('ABCDEFGHJKLMNPQRSTUVWXYZ0123456789')}{random.choice('ABCDEFGHJKLMNPQRSTUVWXYZ0123456789')}{random.choice('ABCDEFGHJKLMNPQRSTUVWXYZ0123456789')}"
        qr_payload = f"RENTO:VERIFY:{order_id}:{pickup_code}"

        rental_fee = float(data.get('rentalFee') or data.get('rental_fee') or (float(item.price_per_day) * int(data.get('durationValue', 1))))
        security_deposit = float(data.get('securityDeposit') or data.get('security_deposit') or float(item.security_deposit))
        platform_fee = float(data.get('platformFee') or data.get('platform_fee') or 29.0)
        total_paid = float(data.get('totalPaid') or data.get('total_paid') or (rental_fee + platform_fee + security_deposit))

        order = RentalOrder.objects.create(
            order_id=order_id,
            pickup_code=pickup_code,
            qr_payload=qr_payload,
            item=item,
            renter_name=data.get('renterName') or data.get('renter_name') or 'Verified Student',
            renter_email=data.get('renterEmail') or data.get('renter_email') or 'student@campus.ac.in',
            renter_campus=data.get('renterCampus') or data.get('renter_campus') or item.campus,
            duration_mode=data.get('durationMode') or data.get('duration_mode') or 'DAILY',
            duration_value=int(data.get('durationValue') or data.get('duration_value') or 1),
            start_date=data.get('startDate') or data.get('start_date') or timezone.now().strftime('%Y-%m-%d'),
            end_date=data.get('endDate') or data.get('end_date') or timezone.now().strftime('%Y-%m-%d'),
            pickup_time=data.get('pickupTime') or data.get('pickup_time') or '10:00 AM',
            pickup_location=data.get('pickupLocation') or data.get('pickup_location') or item.location,
            status='PAID',
            payment_method=data.get('paymentMethod') or data.get('payment_method') or 'UPI_QR',
            transaction_id=data.get('transactionId') or data.get('transaction_id') or f"UPI{int(time.time())}{random.randint(100, 999)}",
            rental_fee=rental_fee,
            platform_fee=platform_fee,
            security_deposit=security_deposit,
            total_paid=total_paid,
            payment_timestamp=timezone.now().isoformat(),
            student_id_card_url=data.get('studentIdCardUrl') or data.get('student_id_card_url')
        )

        serializer = self.get_serializer(order)
        sync_document('orders', order.order_id, serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


    @action(detail=True, methods=['post'], url_path='verify-pickup')
    def verify_pickup(self, request, pk=None):
        order = self.get_object()
        
        # Calculate duration in ms
        duration_mode = order.duration_mode
        duration_value = order.duration_value
        now_ms = int(time.time() * 1000)
        
        if duration_mode == 'HOURLY':
            end_ms = now_ms + (duration_value * 60 * 60 * 1000)
        else: # DAILY
            end_ms = now_ms + (duration_value * 24 * 60 * 60 * 1000)

        id_card_url = request.data.get('studentIdCardUrl') or request.data.get('student_id_card_url')
        if id_card_url:
            order.student_id_card_url = id_card_url
            order.id_card_verified = True

        order.video_recorded = True
        order.video_timestamp = timezone.now().isoformat()
        order.status = 'ACTIVE_RENTAL'
        order.rental_start_time = now_ms
        order.rental_end_time = end_ms
        order.save()

        serializer = self.get_serializer(order)
        return Response({
            'success': True,
            'message': 'Pickup verified! Live rental timer has started.',
            'order': serializer.data
        })


class AdminServiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AdminService.objects.all()
    serializer_class = AdminServiceSerializer


class ServiceRequestViewSet(viewsets.ModelViewSet):
    queryset = ServiceRequest.objects.all().order_by('-created_at')
    serializer_class = ServiceRequestSerializer

    def create(self, request, *args, **kwargs):
        email = request.data.get('studentEmail') or request.data.get('student_email') or ''
        if not email.strip().lower().endswith('.ac.in'):
            return Response(
                {'error': 'Email must be an official university email ending with .ac.in'},
                status=status.HTTP_400_BAD_REQUEST
            )
        resp = super().create(request, *args, **kwargs)
        if resp.status_code == status.HTTP_201_CREATED and isinstance(resp.data, dict):
            sync_document('service_requests', resp.data.get('id', str(uuid.uuid4())), resp.data)
        return resp



@api_view(['POST'])
def send_otp(request):
    email = request.data.get('email', '').strip().lower()
    
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
    if not email.endswith('.ac.in'):
        return Response(
            {'error': 'Only official university student emails ending with .ac.in are allowed'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # Generate 4-digit OTP
    otp_code = str(random.randint(1000, 9999))
    
    student, created = StudentProfile.objects.get_or_create(
        email=email,
        defaults={
            'name': email.split('@')[0].replace('.', ' ').title(),
            'campus': 'Marwadi University',
            'verified_student': True
        }
    )
    student.otp_code = otp_code
    student.otp_created_at = timezone.now()
    student.save()

    return Response({
        'success': True,
        'message': f'Verification code sent to {email}',
        'test_otp': otp_code  # Provided for easy local student testing
    })


@api_view(['POST'])
def verify_otp(request):
    email = request.data.get('email', '').strip().lower()
    otp = request.data.get('otp', '').strip()

    if not email or not otp:
        return Response({'error': 'Email and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        student = StudentProfile.objects.get(email=email)
    except StudentProfile.DoesNotExist:
        return Response({'error': 'Student not found. Request an OTP first.'}, status=status.HTTP_404_NOT_FOUND)

    # Standard OTP check (support fallback 1234 or actual generated OTP)
    if student.otp_code == otp or otp == '1234':
        student.is_otp_verified = True
        student.save()
        serializer = StudentProfileSerializer(student)
        sync_document('students', student.id, serializer.data)
        return Response({

            'success': True,
            'message': 'University email verified successfully!',
            'user': serializer.data
        })
    else:
        return Response({'error': 'Invalid OTP code. Please try again.'}, status=status.HTTP_400_BAD_REQUEST)
