import os
import django
import sys
from pathlib import Path

# Add the project root to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User

def fix_credentials():
    print("🔧 Fixing user credentials...")
    
    # 1. Create/Update admin1
    admin1, created = User.objects.get_or_create(username='admin1', defaults={
        'email': 'admin1@school.com',
        'role': 'admin',
        'name': 'Admin One'
    })
    admin1.set_password('admin123')
    admin1.role = 'admin'
    admin1.save()
    if created:
        print("✅ Created new user: admin1 / admin123 (role: admin)")
    else:
        print("✅ Updated user: admin1 / admin123 (role: admin)")

    # 2. Fix 'admin' user
    admin, created = User.objects.get_or_create(username='admin', defaults={
        'email': 'admin@school.com',
        'role': 'admin',
        'name': 'Super Admin'
    })
    admin.set_password('admin123')
    admin.role = 'admin'
    admin.save()
    if created:
        print("✅ Created new user: admin / admin123 (role: admin)")
    else:
        print("✅ Updated user: admin / admin123 (role: admin)")

    # 3. Ensure teacher1 and student1
    teacher1, created = User.objects.get_or_create(username='teacher1', defaults={
        'email': 'teacher1@school.com',
        'role': 'teacher',
        'name': 'Teacher One'
    })
    teacher1.set_password('teacher123')
    teacher1.role = 'teacher'
    teacher1.save()
    
    student1, created = User.objects.get_or_create(username='student1', defaults={
        'email': 'student1@school.com',
        'role': 'student',
        'name': 'Student One'
    })
    student1.set_password('student123')
    student1.role = 'student'
    student1.save()

    print("\n🚀 All credentials fixed!")

if __name__ == "__main__":
    fix_credentials()
