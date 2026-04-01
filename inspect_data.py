import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def inspect_data():
    with connection.cursor() as cursor:
        try:
            cursor.execute("SELECT * FROM tenants_school")
            rows = cursor.fetchall()
            print(f"Data in tenants_school ({len(rows)} rows):")
            for row in rows:
                print(row)
        except Exception as e:
            print(f"Error inspecting data: {e}")

if __name__ == '__main__':
    inspect_data()
