import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from tenants.models import School
from accounts.models import User

schools = School.objects.all()
print(f"Total Schools: {len(schools)}")
for s in schools:
    print(f"- ID: {s.id}, Name: {s.name}, School ID: {s.school_id}")

shiv = User.objects.filter(username="shiv").first()
if shiv:
    print(f"\nUser 'shiv' info:")
    print(f"ID: {shiv.id}")
    print(f"Role: {shiv.role}")
    print(f"School ID in DB: {shiv.school_id if shiv.school else 'None'}")
    if shiv.school:
        print(f"School Name: {shiv.school.name}")
else:
    print("\nUser 'shiv' NOT found.")
