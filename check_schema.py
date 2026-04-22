import os
from django.db import connection

tables = [
    'classes_classsection',
    'classes_mainclass',
    'classes_mainsection',
    'subjects_subject',
    'holidays_holiday',
    'timetable_timetableentry'
]

with open('schema_results.txt', 'w') as f:
    with connection.cursor() as cursor:
        for table in tables:
            cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name='{table}'")
            cols = [row[0] for row in cursor.fetchall()]
            has_school = 'school_id' in cols
            f.write(f"{table} has school_id: {has_school}\n")
