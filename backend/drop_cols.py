from django.db import connection

try:
    with connection.cursor() as cursor:
        cursor.execute('ALTER TABLE classes_classsection DROP COLUMN IF EXISTS school_id CASCADE;')
        cursor.execute('ALTER TABLE classes_mainclass DROP COLUMN IF EXISTS school_id CASCADE;')
    print("Successfully dropped rogue columns.")
except Exception as e:
    print(f"Error dropping columns: {e}")
