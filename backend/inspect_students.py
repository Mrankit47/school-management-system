import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from students.models import StudentProfile
from tenants.models import School

def inspect_students():
    print("--- SCHOOLS ---")
    schools = School.objects.all()
    for s in schools:
        print(f"School ID: {s.id} | Name: {s.name} | Unique school_id: {s.school_id}")

    print("\n--- STUDENTS WITH RFID ---")
    students_with_rfid = StudentProfile.objects.filter(rfid_code__isnull=False)
    print(f"Total students with RFID: {students_with_rfid.count()}")
    for s in students_with_rfid:
        print(f"Student: {s.user.username} | RFID: {s.rfid_code} | School: {s.school.name} (school_id: {s.school.school_id})")

    print("\n--- FIRST 10 ALL STUDENTS ---")
    all_students = StudentProfile.objects.all()[:10]
    for s in all_students:
        print(f"Student ID: {s.id} | Name: {s.user.username} | RFID: {s.rfid_code} | School: {s.school.name if s.school else 'None'} (school_id: {s.school.school_id if s.school else 'None'})")

if __name__ == '__main__':
    inspect_students()
