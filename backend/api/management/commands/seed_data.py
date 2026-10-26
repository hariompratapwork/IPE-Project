from django.core.management.base import BaseCommand
from api.models import (
    Campus,
    StudentProfile,
    RentalItem,
    Review,
    AdminService
)

class Command(BaseCommand):
    help = 'Seeds initial campus, items, and service data for RENTO'

    def handle(self, *args, **options):
        self.stdout.write("Seeding RENTO database...")

        # 1. Campuses
        campuses_data = [
            {'id': 'marwadi', 'name': 'Marwadi University', 'short_name': 'MU Rajkot', 'city': 'Rajkot', 'student_count': '12,000+'},
            {'id': 'iitb', 'name': 'IIT Bombay', 'short_name': 'IITB', 'city': 'Mumbai', 'student_count': '10,000+'},
            {'id': 'du-north', 'name': 'Delhi University (North Campus)', 'short_name': 'DU North', 'city': 'New Delhi', 'student_count': '45,000+'},
            {'id': 'bits-pilani', 'name': 'BITS Pilani', 'short_name': 'BITS', 'city': 'Pilani', 'student_count': '5,000+'},
            {'id': 'manipal', 'name': 'Manipal Academy of Higher Education', 'short_name': 'MAHE', 'city': 'Manipal', 'student_count': '28,000+'},
            {'id': 'vit-vellore', 'name': 'VIT Vellore', 'short_name': 'VIT', 'city': 'Vellore', 'student_count': '35,000+'},
        ]

        for c in campuses_data:
            Campus.objects.update_or_create(
                id=c['id'],
                defaults=c
            )
        self.stdout.write(self.style.SUCCESS(f"✓ Seeded {len(campuses_data)} Campuses"))

        # 2. Admin Services
        services_data = [
            {
                'id': 'srv-1',
                'title': 'Photography',
                'subtitle': 'Direct Admin Professional Shoot',
                'description': 'Capture your campus events, portraits, sports tournaments & portfolio shoots with high-end full frame cameras.',
                'starting_price': '₹499 / session',
                'icon_name': 'Camera',
                'image_url': '/photography-service.png',
                'deliverables': ['Edited High-Res Photos', 'RAW Files Access', 'Same-Day Digital Delivery']
            },
            {
                'id': 'srv-2',
                'title': 'Content Writing',
                'subtitle': 'Direct Admin Campus Writing',
                'description': 'Professional academic writing, research articles, assignment proofreading, SOPs, and resume building.',
                'starting_price': '₹199 / article',
                'icon_name': 'FileText',
                'image_url': '/content-writing-service.png',
                'deliverables': ['Plagiarism-Free Content', 'Grammarly Verified', 'Express 24h Turnaround']
            },
            {
                'id': 'srv-3',
                'title': 'Video Editor',
                'subtitle': 'Direct Admin Cinematic Editing',
                'description': 'Transform your raw footage into viral Instagram reels, vlog edits, project demo videos & fest after-movies.',
                'starting_price': '₹299 / reel',
                'icon_name': 'Video',
                'image_url': '/video-editing-service.jpg',
                'deliverables': ['4K Rendered Output', 'Trending Audio & Subtitles', '2 Free Revisions']
            },
            {
                'id': 'srv-4',
                'title': 'Graphic Designer',
                'subtitle': 'Direct Admin Visual Design',
                'description': 'Custom fest posters, presentation decks, logos, club banners, and UI mockups crafted directly by our admin designers.',
                'starting_price': '₹249 / design',
                'icon_name': 'Palette',
                'image_url': 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800',
                'deliverables': ['Vector Source Files (AI/PSD)', 'Print-Ready Formats', 'High Impact Visuals']
            }
        ]

        for s in services_data:
            AdminService.objects.update_or_create(
                id=s['id'],
                defaults=s
            )
        self.stdout.write(self.style.SUCCESS(f"✓ Seeded {len(services_data)} Admin Services"))

        # 3. Student Owners
        owners_data = [
            {
                'id': 'owner-1',
                'name': 'Aarav Sharma',
                'email': 'aarav.sharma@marwadi.ac.in',
                'avatar': 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
                'campus': 'Marwadi University',
                'hostel_or_dept': 'CSE Dept, 3rd Year',
                'rating': 4.9,
                'rentals_completed': 18,
                'verified_student': True,
                'join_year': '2023',
            },
            {
                'id': 'owner-2',
                'name': 'Siddharth Dave',
                'email': 'siddharth.d@marwadi.ac.in',
                'avatar': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
                'campus': 'Marwadi University',
                'hostel_or_dept': 'Computer Eng, 4th Year',
                'rating': 4.9,
                'rentals_completed': 52,
                'verified_student': True,
                'join_year': '2022',
            },
            {
                'id': 'owner-3',
                'name': 'Sneha Verma',
                'email': 'sneha.v@marwadi.ac.in',
                'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
                'campus': 'Marwadi University',
                'hostel_or_dept': 'Media & Design, 4th Year',
                'rating': 4.8,
                'rentals_completed': 31,
                'verified_student': True,
                'join_year': '2022',
            },
            {
                'id': 'owner-4',
                'name': 'Ketan Patel',
                'email': 'ketan.patel@marwadi.ac.in',
                'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
                'campus': 'Marwadi University',
                'hostel_or_dept': 'Mechanical Eng, 2nd Year',
                'rating': 5.0,
                'rentals_completed': 45,
                'verified_student': True,
                'join_year': '2024',
            },
            {
                'id': 'owner-5',
                'name': 'Nikhil Rane',
                'email': 'nikhil.r@marwadi.ac.in',
                'avatar': 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
                'campus': 'Marwadi University',
                'hostel_or_dept': 'IT Dept, 4th Year',
                'rating': 4.9,
                'rentals_completed': 42,
                'verified_student': True,
                'join_year': '2022',
            },
            {
                'id': 'owner-6',
                'name': 'Devraj Joshi',
                'email': 'devraj.j@marwadi.ac.in',
                'avatar': 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
                'campus': 'Marwadi University',
                'hostel_or_dept': 'BBA Dept, 3rd Year',
                'rating': 4.7,
                'rentals_completed': 14,
                'verified_student': True,
                'join_year': '2023',
            }
        ]

        owners = {}
        for o in owners_data:
            student, _ = StudentProfile.objects.update_or_create(
                id=o['id'],
                defaults=o
            )
            owners[o['id']] = student

        self.stdout.write(self.style.SUCCESS(f"✓ Seeded {len(owners_data)} Student Owners"))

        # 4. Rental Items
        items_data = [
            {
                'id': 'item-1',
                'title': 'MacBook Air',
                'category': 'Electronics',
                'price_per_day': 350.0,
                'security_deposit': 3000.0,
                'rating': 4.8,
                'review_count': 24,
                'location': 'Hostel Block B (0.2 km away)',
                'campus': 'Marwadi University',
                'image_url': '/laptop.png',
                'images': ['/laptop.png'],
                'condition': 'Like New',
                'is_popular': True,
                'available_now': True,
                'featured': True,
                'owner': owners['owner-1'],
                'description': 'Ultra-fast M2 MacBook Air perfect for coding sprints, video editing, or preparing major semester presentations. Includes original charger & sleeve.',
                'highlights': ['Apple M2 Processor', 'Pre-installed VS Code & Office', '18 hours battery life'],
                'included_items': ['MacBook Air', 'Charger', 'Sleeve'],
            },
            {
                'id': 'item-2',
                'title': 'Gaming Controller',
                'category': 'Gaming',
                'price_per_day': 80.0,
                'security_deposit': 800.0,
                'rating': 4.9,
                'review_count': 40,
                'location': 'Hostel Block C (0.25 km away)',
                'campus': 'Marwadi University',
                'image_url': '/game-controller.png',
                'images': ['/game-controller.png'],
                'condition': 'Like New',
                'is_popular': True,
                'available_now': True,
                'featured': True,
                'owner': owners['owner-2'],
                'description': 'Wireless Bluetooth controller for PC, PS5 & Android gaming. Tactile feedback & long battery life.',
                'highlights': ['Dual vibration motors', 'Bluetooth 5.0 wireless connection', 'Rechargeable battery'],
                'included_items': ['Gaming Controller', 'USB Type-C Cable'],
            },
            {
                'id': 'item-3',
                'title': 'Instax Mini 12',
                'category': 'Photography',
                'price_per_day': 200.0,
                'security_deposit': 1500.0,
                'rating': 4.8,
                'review_count': 19,
                'location': 'Architecture Block (0.4 km away)',
                'campus': 'Marwadi University',
                'image_url': '/instax-camera.png',
                'images': ['/instax-camera.png'],
                'condition': 'Excellent',
                'is_popular': True,
                'available_now': True,
                'featured': True,
                'owner': owners['owner-3'],
                'description': 'Instant film camera perfect for campus events, birthday parties, and road trip memories.',
                'highlights': ['Built-in selfie mirror', 'Automatic exposure control', 'Strap included'],
                'included_items': ['Instax Camera', 'Strap', '2x AA Batteries'],
            },
            {
                'id': 'item-4',
                'title': 'Scientific Calculator',
                'category': 'Study',
                'price_per_day': 40.0,
                'security_deposit': 400.0,
                'rating': 4.9,
                'review_count': 53,
                'location': 'Library Quad (0.1 km away)',
                'campus': 'Marwadi University',
                'image_url': '/calculator.png',
                'images': ['/calculator.png'],
                'condition': 'Like New',
                'is_popular': True,
                'available_now': True,
                'featured': False,
                'owner': owners['owner-4'],
                'description': 'Essential Casio scientific calculator for mid-terms, end-sems, and engineering math exams.',
                'highlights': ['552 Functions Display', 'Solar & Battery powered', 'Permitted in standard exams'],
                'included_items': ['Scientific Calculator', 'Slide Case'],
            },
            {
                'id': 'item-5',
                'title': 'Projector',
                'category': 'College Essentials',
                'price_per_day': 300.0,
                'security_deposit': 2500.0,
                'rating': 4.8,
                'review_count': 37,
                'location': 'Science Block (0.3 km away)',
                'campus': 'Marwadi University',
                'image_url': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000',
                'images': ['https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000'],
                'condition': 'Like New',
                'is_popular': True,
                'available_now': True,
                'featured': True,
                'owner': owners['owner-5'],
                'description': 'Full HD smart projector for movie nights or project demos in hostel rooms.',
                'highlights': ['1080p Resolution', '3000 Lumens', 'HDMI Cable included'],
                'included_items': ['Projector', 'Power Adapter', 'HDMI Cable'],
            },
            {
                'id': 'item-6',
                'title': 'Bluetooth Speaker',
                'category': 'Electronics',
                'price_per_day': 120.0,
                'security_deposit': 1200.0,
                'rating': 4.6,
                'review_count': 28,
                'location': 'Hostel Block D (0.3 km away)',
                'campus': 'Marwadi University',
                'image_url': '/speaker.png',
                'images': ['/speaker.png'],
                'condition': 'Excellent',
                'is_popular': True,
                'available_now': True,
                'featured': False,
                'owner': owners['owner-6'],
                'description': 'Zebronics RGB boombox Bluetooth speaker with deep bass & RGB LED lighting.',
                'highlights': ['RGB party lighting', 'Portable boombox handle', 'Clear deep bass'],
                'included_items': ['Bluetooth Speaker', 'Charging Cable'],
            }
        ]

        for item_entry in items_data:
            RentalItem.objects.update_or_create(
                id=item_entry['id'],
                defaults=item_entry
            )
        self.stdout.write(self.style.SUCCESS(f"✓ Seeded {len(items_data)} Rental Items"))

        self.stdout.write(self.style.SUCCESS("All RENTO mock data successfully seeded to SQLite!"))
