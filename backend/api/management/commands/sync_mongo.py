from django.core.management.base import BaseCommand
from api.models import Campus, StudentProfile, RentalItem, Review, RentalOrder, AdminService, ServiceRequest
from api.mongodb import get_mongo_db, get_collection
import json

class Command(BaseCommand):
    help = 'Sync all SQLite database records into MongoDB collections'

    def handle(self, *args, **options):
        db = get_mongo_db()
        if db is None:
            self.stdout.write(self.style.ERROR('Could not connect to MongoDB. Check your MONGO_URI in .env or settings.'))
            return

        self.stdout.write(self.style.SUCCESS(f'Connected to MongoDB database: "{db.name}"'))

        # 1. Campuses
        col_campuses = db['campuses']
        campuses = Campus.objects.all()
        for c in campuses:
            doc = {
                '_id': c.id,
                'id': c.id,
                'name': c.name,
                'shortName': c.short_name,
                'city': c.city,
                'studentCount': c.student_count
            }
            col_campuses.replace_one({'_id': c.id}, doc, upsert=True)
        self.stdout.write(self.style.SUCCESS(f'✓ Synced {campuses.count()} Campuses to MongoDB'))

        # 2. Students
        col_students = db['students']
        students = StudentProfile.objects.all()
        for s in students:
            doc = {
                '_id': s.id,
                'id': s.id,
                'email': s.email,
                'name': s.name,
                'avatar': s.avatar,
                'campus': s.campus,
                'hostelOrDept': s.hostel_or_dept,
                'rating': s.rating,
                'rentalsCompleted': s.rentals_completed,
                'verifiedStudent': s.verified_student,
                'joinYear': s.join_year,
            }
            col_students.replace_one({'_id': s.id}, doc, upsert=True)
        self.stdout.write(self.style.SUCCESS(f'✓ Synced {students.count()} Students to MongoDB'))

        # 3. Rental Items
        col_items = db['rental_items']
        items = RentalItem.objects.all()
        for item in items:
            doc = {
                '_id': item.id,
                'id': item.id,
                'title': item.title,
                'category': item.category,
                'pricePerDay': float(item.price_per_day),
                'pricePerHour': float(item.price_per_hour),
                'securityDeposit': float(item.security_deposit),
                'minRentalHours': item.min_rental_hours,
                'campus': item.campus,
                'imageUrl': item.image_url,
                'images': item.images if isinstance(item.images, list) else [],
                'condition': item.condition,
                'isPopular': item.is_popular,
                'availableNow': item.available_now,
                'featured': item.featured,
                'ownerId': item.owner.id if item.owner else None,
                'description': item.description,
                'highlights': item.highlights if isinstance(item.highlights, list) else [],
                'includedItems': item.included_items if isinstance(item.included_items, list) else [],
            }
            col_items.replace_one({'_id': item.id}, doc, upsert=True)
        self.stdout.write(self.style.SUCCESS(f'✓ Synced {items.count()} Rental Items to MongoDB'))

        # 4. Admin Services
        col_services = db['admin_services']
        services = AdminService.objects.all()
        for s in services:
            doc = {
                '_id': s.id,
                'id': s.id,
                'title': s.title,
                'subtitle': s.subtitle,
                'description': s.description,
                'startingPrice': s.starting_price,
                'imageUrl': s.image_url,
                'deliverables': s.deliverables if isinstance(s.deliverables, list) else [],
                'iconName': s.icon_name
            }
            col_services.replace_one({'_id': s.id}, doc, upsert=True)
        self.stdout.write(self.style.SUCCESS(f'✓ Synced {services.count()} Admin Services to MongoDB'))

        # 5. Orders
        col_orders = db['orders']
        orders = RentalOrder.objects.all()
        for o in orders:
            doc = {
                '_id': o.id,
                'id': o.id,
                'itemId': o.item.id if o.item else None,
                'renterName': o.renter_name,
                'renterEmail': o.renter_email,
                'renterCampus': o.renter_campus,
                'status': o.status,
                'totalAmount': float(o.total_amount),
                'pickupCode': o.pickup_code,
            }
            col_orders.replace_one({'_id': o.id}, doc, upsert=True)
        self.stdout.write(self.style.SUCCESS(f'✓ Synced {orders.count()} Orders to MongoDB'))

        self.stdout.write(self.style.SUCCESS('🎉 All database collections are successfully synced with MongoDB!'))
