# Sync subjects models with DB safely (school FK may already be absent).

from django.db import migrations


def sync_subjects_db(apps, schema_editor):
    connection = schema_editor.connection
    tables = (
        'subjects_subjectassignment',
        'subjects_subjectnote',
        'subjects_teacherassignment',
    )
    with connection.cursor() as cursor:
        if connection.vendor == 'postgresql':
            for table in tables:
                cursor.execute(f'ALTER TABLE {table} DROP COLUMN IF EXISTS school_id')
        elif connection.vendor == 'sqlite':
            for table in tables:
                try:
                    cursor.execute(f'ALTER TABLE {table} DROP COLUMN school_id')
                except Exception:
                    pass


class Migration(migrations.Migration):

    dependencies = [
        ('classes', '0003_classsection_school_mainclass_school_and_more'),
        ('subjects', '0001_initial'),
        ('teachers', '0006_teacherprofile_photo'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.RemoveField(model_name='subjectassignment', name='school'),
                migrations.RemoveField(model_name='subjectnote', name='school'),
                migrations.RemoveField(model_name='teacherassignment', name='school'),
                migrations.AlterUniqueTogether(
                    name='teacherassignment',
                    unique_together={('teacher', 'class_ref', 'subject')},
                ),
                migrations.AlterUniqueTogether(
                    name='subject',
                    unique_together={('class_ref', 'name')},
                ),
            ],
            database_operations=[
                migrations.RunPython(sync_subjects_db, migrations.RunPython.noop),
            ],
        ),
    ]
