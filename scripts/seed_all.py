import os
import django

import sys
from pathlib import Path

# Add the project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from classes.models import MainClass, MainSection, ClassSection
from accounts.models import User
from students.models import StudentProfile
from teachers.models import TeacherProfile

def seed():
    # 1. Classes & Sections
    class_names = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2']
    sections = ['A', 'B', 'C']

    for name in class_names:
        mc, _ = MainClass.objects.get_or_create(name=name)
        for sec_name in sections:
            ms, _ = MainSection.objects.get_or_create(name=sec_name)
            ClassSection.objects.get_or_create(class_ref=mc, section_ref=ms)

    print("Classes and Sections created.")

    # 2. Admin
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@school.com', 'admin123', role='admin', name='Super Admin')
        print("Admin created. (admin/admin123)")

    # 3. Teacher
    if not User.objects.filter(username='teacher1').exists():
        u = User.objects.create_user('teacher1', 'teacher1@school.com', 'teacher123', role='teacher', name='Ravi Kumar')
        TeacherProfile.objects.create(user=u, employee_id='T001', subject_specialization='Mathematics')
        print("Teacher created. (teacher1/teacher123)")

    # 4. Student
    if not User.objects.filter(username='student1').exists():
        u = User.objects.create_user('student1', 'student1@school.com', 'student123', role='student', name='Amit Sharma')
        cs = ClassSection.objects.first()
        StudentProfile.objects.create(user=u, admission_number='S001', class_section=cs)
        print("Student created. (student1/student123)")

if __name__ == "__main__":
    seed()
