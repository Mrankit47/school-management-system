import random
import string
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from students.models import StudentProfile
from classes.models import ClassSection

def generate_random_data():
    """
    Populates the database with sample student data for testing.
    """
    sections = ClassSection.objects.all()
    if not sections.exists():
        print("Please create class sections first.")
        return

    for i in range(1, 21):
        username = f"student_{i}"
        email = f"student{i}@example.com"
        
        if not User.objects.filter(username=username).exists():
            user = User.objects.create_user(
                username=username,
                email=email,
                password="password123",
                name=f"Sample Student {i}",
                role='student'
            )
            StudentProfile.objects.create(
                user=user,
                admission_number=f"ADM-2024-{1000+i}",
                class_section=random.choice(sections)
            )
            print(f"Created {username}")

if __name__ == "__main__":
    generate_random_data()
