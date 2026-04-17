import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.apps import apps
from django.db import connection

print("--- Project Database Health Check ---")
all_good = True
for app_config in apps.get_app_configs():
    if app_config.models_module:
        for model in app_config.get_models():
            table_name = model._meta.db_table
            exists = table_name in connection.introspection.table_names()
            if not exists:
                print(f"[ERROR] Table missing for model: {app_config.label}.{model.__name__} (Table: {table_name})")
                all_good = False

if all_good:
    print("SUCCESS: All models have corresponding database tables.")
else:
    print("FAILURE: Some models are missing tables. Run migrations.")
