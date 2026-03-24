import os
import sys
import django
from pathlib import Path

# Important: root must be in path for config.settings to work
# apps/ must be in path for students.models to work
CURRENT_DIR = Path(__file__).resolve().parent
BASE_DIR = CURRENT_DIR.parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / 'apps'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

try:
    from students.models import StudentProfile
    print("Success: StudentProfile imported!")
except ImportError:
    import traceback
    traceback.print_exc()
except Exception:
    import traceback
    traceback.print_exc()
