import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from accounts.models import User

user = User.objects.filter(username="admin1").first()
if user:
    print(f"User found: {user.username}, Role: {user.role}, Email: {user.email}")
else:
    print("User 'admin1' NOT found.")

users = User.objects.all()
print("\nAll users:")
for u in users:
    print(f"- {u.username} ({u.role})")
