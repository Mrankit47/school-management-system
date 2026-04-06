import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from accounts.models import User
from students.models import StudentProfile

username = "shiv"
password = "123456"

user = User.objects.filter(username=username).first()

if user:
    print(f"User found: {user.username}")
    print(f"Role: {user.role}")
    print(f"Is active: {user.is_active}")
    print(f"Password matches: {user.check_password(password)}")
    print(f"User School: {user.school.name if user.school else 'None'}")
    print(f"User School ID: {user.school.school_id if user.school else 'None'}")
    
    if user.role == 'student':
        profile = StudentProfile.objects.filter(user=user).first()
        if profile:
            print(f"StudentProfile found for: {profile.user.username}")
            print(f"Admission Number: {profile.admission_number}")
        else:
            print("StudentProfile record NOT found for this user.")
else:
    print(f"User '{username}' NOT found.")
    
# Also list all schools to see if DEFAULT exists
from tenants.models import School
print("\nAll Schools:")
for s in School.objects.all():
    print(f"- {s.name} (ID: {s.school_id})")
