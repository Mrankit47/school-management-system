import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from students.models import StudentProfile
from teachers.models import TeacherProfile
from tenants.models import School
from accounts.utils import get_unique_username

def test_multi_tenant_identity():
    # 1. Setup schools
    school_a, _ = School.objects.get_or_create(school_id="SCH_A", defaults={"name": "School A"})
    school_b, _ = School.objects.get_or_create(school_id="SCH_B", defaults={"name": "School B"})

    print(f"Testing with School A and School B...")

    # 2. Test duplicate usernames in same school
    base_username = "testuser_verif"
    u1_name = get_unique_username(base_username)
    u1, _ = User.objects.get_or_create(username=u1_name, defaults={"email": "u1v@test.com", "school": school_a})
    print(f"Created u1: {u1.username}")

    u2_name = get_unique_username(base_username)
    u2 = User.objects.create_user(username=u2_name, email="u2v@test.com", school=school_a)
    print(f"Created u2: {u2.username} (Should be suffixed)")

    assert u2.username == f"{base_username}_1"

    # 3. Test same admission number across schools
    adm_no = "TEST_ADM_VERIF_001"
    
    # Student in School A
    s1_user, _ = User.objects.get_or_create(username="s1v", defaults={"email": "s1v@test.com", "school": school_a})
    s1, _ = StudentProfile.objects.get_or_create(user=s1_user, defaults={"school": school_a, "admission_number": adm_no})
    print(f"Created Student 1 in School A with Adm: {adm_no}")

    # Student in School B with SAME Adm No
    s2_user, _ = User.objects.get_or_create(username="s2v", defaults={"email": "s2v@test.com", "school": school_b})
    s2 = StudentProfile.objects.create(user=s2_user, school=school_b, admission_number=adm_no)
    print(f"Created Student 2 in School B with Adm: {adm_no} (Should succeed)")

    # 4. Test same employee id across schools
    emp_id = "TEST_EMP_VERIF_001"
    t1_user, _ = User.objects.get_or_create(username="t1v", defaults={"email": "t1v@test.com", "school": school_a})
    t1, _ = TeacherProfile.objects.get_or_create(user=t1_user, defaults={"school": school_a, "employee_id": emp_id})
    print(f"Created Teacher 1 in School A with Emp: {emp_id}")

    t2_user, _ = User.objects.get_or_create(username="t2v", defaults={"email": "t2v@test.com", "school": school_b})
    t2 = TeacherProfile.objects.create(user=t2_user, school=school_b, employee_id=emp_id)
    print(f"Created Teacher 2 in School B with Emp: {emp_id} (Should succeed)")

    # 5. Cleanup
    u1.delete()
    u2.delete()
    s1_user.delete()
    s2_user.delete()
    t1_user.delete()
    t2_user.delete()
    print("Verification successful!")

if __name__ == "__main__":
    try:
        test_multi_tenant_identity()
    except Exception as e:
        print(f"Verification failed: {e}")
        import traceback
        traceback.print_exc()
