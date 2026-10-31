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
            item = RentalItem.objects.select_related('owner').get(id=item_id)
        except RentalItem.DoesNotExist:
            return Response({'error': f'Item with id {item_id} not found'}, status=status.HTTP_404_NOT_FOUND)

        order_id = f"CLP{timezone.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
        pickup_code = f"#{random.choice('ABCDEFGHJKLMNPQRSTUVWXYZ0123456789')}{random.choice('ABCDEFGHJKLMNPQRSTUVWXYZ0123456789')}{random.choice('ABCDEFGHJKLMNPQRSTUVWXYZ0123456789')}{random.choice('ABCDEFGHJKLMNPQRSTUVWXYZ0123456789')}"
        qr_payload = f"RENTO:VERIFY:{order_id}:{pickup_code}"

        rental_fee = float(data.get('rentalFee') or data.get('rental_fee') or (float(item.price_per_day) * int(data.get('durationValue', 1))))
        security_deposit = float(data.get('securityDeposit') or data.get('security_deposit') or float(item.security_deposit))
        
        # Commission strictly calculated on rental fee only, excluding refundable security deposit
        commission_rate = float(data.get('commissionRate') or 5.0)
        commission_amount = round((rental_fee * commission_rate) / 100.0, 2)
        
        # Total payable directly to the gadget owner
        total_payable_to_owner = rental_fee + security_deposit

        # Owner UPI details
        owner_upi_id = data.get('ownerUpiId') or item.owner_upi_id or (item.owner.upi_id if hasattr(item, 'owner') and item.owner else '')
        if not owner_upi_id and hasattr(item, 'owner') and item.owner:
            owner_slug = item.owner.name.lower().replace(' ', '').replace('.', '')
            owner_upi_id = f"{owner_slug}@upi"
        
        owner_upi_qr_url = data.get('ownerUpiQrUrl') or item.owner_upi_qr_url or (item.owner.upi_qr_url if hasattr(item, 'owner') and item.owner else '')

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
            status='AWAITING_PAYMENT',
            owner_upi_id=owner_upi_id,
            owner_upi_qr_url=owner_upi_qr_url,
            payment_method=data.get('paymentMethod') or data.get('payment_method') or 'UPI_QR',
            transaction_id=data.get('transactionId') or data.get('transaction_id') or f"UPI{int(time.time())}{random.randint(100, 999)}",
            rental_fee=rental_fee,
            platform_fee=0.0,
            security_deposit=security_deposit,
            total_paid=total_payable_to_owner,
            payment_timestamp='',
            renter_paid_confirmed=False,
            owner_payment_confirmed=False,
            commission_rate=commission_rate,
            commission_amount=commission_amount,
            commission_status='UNPAID',
            deposit_status='DEPOSIT_NOT_CONFIRMED',
            student_id_card_url=data.get('studentIdCardUrl') or data.get('student_id_card_url')
        )

        serializer = self.get_serializer(order)
        sync_document('orders', order.order_id, serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='renter-paid')
    def renter_paid(self, request, pk=None):
        """Renter taps 'I have Paid' and uploads proof / enters UPI ref number"""
        order = self.get_object()
        order.payment_proof_url = request.data.get('paymentProofUrl') or request.data.get('payment_proof_url') or order.payment_proof_url
        order.upi_reference_no = request.data.get('upiReferenceNo') or request.data.get('upi_reference_no') or order.upi_reference_no
        order.renter_paid_confirmed = True
        order.renter_paid_at = timezone.now()
        order.payment_timestamp = timezone.now().isoformat()
        order.owner_payment_rejected = False
        order.status = 'PAYMENT_PROOF_SUBMITTED'
        order.save()
        serializer = self.get_serializer(order)
        sync_document('orders', order.order_id, serializer.data)
        return Response({
            'success': True,
            'message': "Payment proof submitted. Awaiting owner confirmation.",
            'order': serializer.data
        })

    @action(detail=True, methods=['post'], url_path='owner-confirm-payment')
    def owner_confirm_payment(self, request, pk=None):
        """Owner verifies payment in their UPI app and confirms receipt"""
        order = self.get_object()
        order.owner_payment_confirmed = True
        order.owner_payment_confirmed_at = timezone.now()
        order.owner_payment_rejected = False
        order.status = 'PAYMENT_CONFIRMED_BY_OWNER'
        order.save()
        serializer = self.get_serializer(order)
        sync_document('orders', order.order_id, serializer.data)
        return Response({
            'success': True,
            'message': "Owner confirmed payment received. Ready for gadget pickup!",
            'order': serializer.data
        })

    @action(detail=True, methods=['post'], url_path='owner-reject-payment')
    def owner_reject_payment(self, request, pk=None):
        """Owner reports that payment was NOT received"""
        order = self.get_object()
        order.owner_payment_rejected = True
        order.owner_payment_rejected_at = timezone.now()
        order.payment_dispute_reason = request.data.get('reason', 'Owner checked UPI bank records and did not receive payment.')
        order.status = 'PAYMENT_DISPUTED'
        order.save()
        serializer = self.get_serializer(order)
        sync_document('orders', order.order_id, serializer.data)
        return Response({
            'success': True,
            'message': "Payment disputed by owner. Renter notified to review or report.",
            'order': serializer.data
        })

    @action(detail=True, methods=['post'], url_path='confirm-handover')
    def confirm_handover(self, request, pk=None):
        """Both owner and renter confirm deposit handed over directly, review checklist & gadget pickup"""
        order = self.get_object()
        role = request.data.get('role', 'RENTER').upper()
        now = timezone.now()

        checklist = request.data.get('checklist', {})
        if checklist:
            existing = order.pickup_checklist or {}
            existing.update(checklist)
            order.pickup_checklist = existing

        photos = request.data.get('photos', [])
        if photos:
            existing_p = order.pickup_photos or []
            existing_p.extend([p for p in photos if p not in existing_p])
            order.pickup_photos = existing_p

        if role == 'RENTER':
            order.renter_handover_confirmed = True
            order.renter_handover_at = now
        else:
            order.owner_handover_confirmed = True
            order.owner_handover_at = now

        # Timer starts ONLY when BOTH owner and renter have confirmed physical handover
        if order.renter_handover_confirmed and order.owner_handover_confirmed:
            order.deposit_status = 'DEPOSIT_HELD_BY_OWNER'
            order.status = 'RENTAL_IN_PROGRESS'
            
            # Start timer if not already running
            if not order.rental_start_time:
                duration_mode = order.duration_mode
                duration_value = order.duration_value
                now_ms = int(time.time() * 1000)
                end_ms = now_ms + (duration_value * 3600 * 1000 if duration_mode == 'HOURLY' else duration_value * 24 * 3600 * 1000)
                order.rental_start_time = now_ms
                order.rental_end_time = end_ms

        order.save()
        serializer = self.get_serializer(order)
        sync_document('orders', order.order_id, serializer.data)
        return Response({
            'success': True,
            'message': f"Pickup handover confirmed by {role.lower()}.",
            'order': serializer.data
        })

    @action(detail=True, methods=['post'], url_path='return-gadget')
    def return_gadget(self, request, pk=None):
        """At return, both users inspect gadget condition and confirm physical return"""
        order = self.get_object()
        role = request.data.get('role', 'RENTER').upper()
        now = timezone.now()

        checklist = request.data.get('checklist', {})
        if checklist:
            existing = order.return_checklist or {}
            existing.update(checklist)
            order.return_checklist = existing

        photos = request.data.get('photos', [])
        if photos:
            existing_p = order.return_photos or []
            existing_p.extend([p for p in photos if p not in existing_p])
            order.return_photos = existing_p

        if role == 'RENTER':
            order.renter_return_confirmed = True
            order.renter_return_at = now
        else:
            order.owner_return_confirmed = True
            order.owner_return_at = now

        # When both confirm physical return
        if order.renter_return_confirmed and order.owner_return_confirmed:
            order.actual_return_time = now
            order.status = 'DEPOSIT_REFUND_PENDING_CONFIRMATION'
        else:
            order.status = 'RETURN_PENDING_CONFIRMATION'

        order.save()
        serializer = self.get_serializer(order)
        sync_document('orders', order.order_id, serializer.data)
        return Response({
            'success': True,
            'message': f"Gadget return confirmed by {role.lower()}.",
            'order': serializer.data
        })

    @action(detail=True, methods=['post'], url_path='return-deposit-owner')
    def return_deposit_owner(self, request, pk=None):
        """Owner returns security deposit directly to renter and taps 'I have Refunded the Deposit'"""
        order = self.get_object()
        order.owner_deposit_returned = True
        order.owner_deposit_returned_at = timezone.now()
        order.deposit_status = 'REFUND_PENDING_CONFIRMATION'
        order.status = 'DEPOSIT_REFUND_PENDING_CONFIRMATION'
        order.save()
        serializer = self.get_serializer(order)
        sync_document('orders', order.order_id, serializer.data)
        return Response({
            'success': True,
            'message': "Owner marked deposit as refunded. Waiting for renter confirmation.",
            'order': serializer.data
        })

    @action(detail=True, methods=['post'], url_path='confirm-deposit-renter')
    def confirm_deposit_renter(self, request, pk=None):
        """Renter taps 'Confirm Deposit Received' directly from owner"""
        order = self.get_object()
        order.renter_deposit_received = True
        order.renter_deposit_received_at = timezone.now()

        if order.owner_deposit_returned:
            order.deposit_status = 'REFUND_COMPLETED'
            order.status = 'DEPOSIT_REFUND_COMPLETED'
        else:
            order.deposit_status = 'REFUND_PENDING_CONFIRMATION'
            order.status = 'DEPOSIT_REFUND_PENDING_CONFIRMATION'

        order.save()
        serializer = self.get_serializer(order)
        sync_document('orders', order.order_id, serializer.data)
        return Response({
            'success': True,
            'message': "Deposit refund confirmed completed by both parties!",
            'order': serializer.data
        })

    @action(detail=True, methods=['post'], url_path='report-problem')
    def report_problem(self, request, pk=None):
        """Dispute or disagreement reported on deposit or item handover"""
        order = self.get_object()
        reason = request.data.get('reason', 'Disagreement reported on deposit or item condition.')
        disputed_by = request.data.get('disputedBy', 'Student')

        order.deposit_status = 'DISPUTED'
        order.status = 'DISPUTED'
        order.dispute_reason = reason
        order.disputed_by = disputed_by
        order.disputed_at = timezone.now()
        order.save()

        serializer = self.get_serializer(order)
        sync_document('orders', order.order_id, serializer.data)
        return Response({
            'success': True,
            'message': "Dispute recorded. Our campus community moderator will intervene.",
            'order': serializer.data
        })

    @action(detail=True, methods=['post'], url_path='settle-commission')
    def settle_commission(self, request, pk=None):
        """Admin manual commission settlement update"""
        order = self.get_object()
        order.commission_status = 'SETTLED'
        order.commission_settled_at = timezone.now()
        order.save()

        serializer = self.get_serializer(order)
        sync_document('orders', order.order_id, serializer.data)
        return Response({
            'success': True,
            'message': "Commission marked as settled.",
            'order': serializer.data
        })


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
