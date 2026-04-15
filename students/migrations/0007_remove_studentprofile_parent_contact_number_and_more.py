# Migration 0007: Add new columns and copy data from old columns.
# Old columns are NOT dropped here — that happens in 0008.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0006_studentprofile_photo'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name='studentprofile',
                    name='father_name',
                    field=models.CharField(blank=True, max_length=255, null=True),
                ),
                migrations.AddField(
                    model_name='studentprofile',
                    name='mother_name',
                    field=models.CharField(blank=True, max_length=255, null=True),
                ),
                migrations.AddField(
                    model_name='studentprofile',
                    name='father_contact',
                    field=models.CharField(blank=True, max_length=15, null=True),
                ),
                migrations.AddField(
                    model_name='studentprofile',
                    name='mother_contact',
                    field=models.CharField(blank=True, max_length=15, null=True),
                ),
                migrations.AddField(
                    model_name='studentprofile',
                    name='bus_no',
                    field=models.CharField(blank=True, max_length=50, null=True),
                ),
            ],
            database_operations=[
                migrations.RunSQL(
                    sql="""
                        DO $$
                        BEGIN
                            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students_studentprofile' AND column_name='father_name') THEN
                                ALTER TABLE students_studentprofile ADD COLUMN father_name VARCHAR(255) NULL;
                            END IF;
                            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students_studentprofile' AND column_name='mother_name') THEN
                                ALTER TABLE students_studentprofile ADD COLUMN mother_name VARCHAR(255) NULL;
                            END IF;
                            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students_studentprofile' AND column_name='father_contact') THEN
                                ALTER TABLE students_studentprofile ADD COLUMN father_contact VARCHAR(15) NULL;
                            END IF;
                            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students_studentprofile' AND column_name='mother_contact') THEN
                                ALTER TABLE students_studentprofile ADD COLUMN mother_contact VARCHAR(15) NULL;
                            END IF;
                            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students_studentprofile' AND column_name='bus_no') THEN
                                ALTER TABLE students_studentprofile ADD COLUMN bus_no VARCHAR(50) NULL;
                            END IF;
                        END $$;
                    """,
                    reverse_sql=migrations.RunSQL.noop,
                ),
                # Copy old data to new fields
                migrations.RunSQL(
                    sql="""
                        DO $$
                        BEGIN
                            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students_studentprofile' AND column_name='parent_guardian_name') THEN
                                UPDATE students_studentprofile
                                SET father_name = parent_guardian_name
                                WHERE (father_name IS NULL OR father_name = '')
                                AND parent_guardian_name IS NOT NULL AND parent_guardian_name != '';
                            END IF;
                            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students_studentprofile' AND column_name='parent_contact_number') THEN
                                UPDATE students_studentprofile
                                SET father_contact = parent_contact_number
                                WHERE (father_contact IS NULL OR father_contact = '')
                                AND parent_contact_number IS NOT NULL AND parent_contact_number != '';
                            END IF;
                        END $$;
                    """,
                    reverse_sql=migrations.RunSQL.noop,
                ),
            ],
        ),
    ]
