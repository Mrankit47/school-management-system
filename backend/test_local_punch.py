import requests
import sys

# CONFIGURATION FOR LOCAL TESTING
SERVER_URL = 'http://127.0.0.1:8000/api/attendance/biometric-punch/'
DEVICE_SECRET_KEY = 'y0ur_Sup3r_S3cr3t_B1om3tr1c_K3y_987'
TEST_RFID = 'TEST_RFID_123'
TEST_SCHOOL = 'DEFAULT'

print("=" * 60)
print("     MOCK BIOMETRIC PUNCH TESTING SCRIPT")
print("=" * 60)

# Simulate Punch Request
payload = {
    'rfid_code': TEST_RFID,
    'school_id': TEST_SCHOOL,
    'punch_time': '2026-06-01 15:30:00'
}

headers = {
    'X-Device-Token': DEVICE_SECRET_KEY,
    'Content-Type': 'application/json'
}

print(f"Sending Mock Punch to API: {SERVER_URL}")
print(f"Payload: {payload}")
print("-" * 60)

try:
    response = requests.post(SERVER_URL, json=payload, headers=headers, timeout=10)
    print(f"Response Status Code: {response.status_code}")
    
    if response.status_code == 201:
        print("[SUCCESS] Biometric punch processed successfully!")
        print(response.json())
    elif response.status_code == 404:
        print("[FAILED] Student/School not found!")
        print("Note: Pehle Step 1 follow karke database me test student create karein.")
        print(response.json())
    else:
        print(f"[FAILED] Error: {response.status_code}")
        print(response.text)

except requests.exceptions.ConnectionError:
    print("[ERROR] Could not connect to Django local server.")
    print("Kripya check karein ki aapka Django local server run ho rha h (python manage.py runserver).")
except Exception as e:
    print(f"[ERROR] An unexpected error occurred: {e}")

print("=" * 60)
