# School Management System

## Modules
- **Admin**: User creation, class management, scheduling.
- **Teacher**: Student lists, attendance marking, result uploading.
- **Student**: Profile, individual attendance, exam results, fees.

## Backend Setup
1. `pip install -r requirements.txt`
2. `python manage.py migrate`
3. `python scripts/create_admin.py`
4. `python manage.py runserver`

## Frontend Setup
1. `npm install`
2. `npm run dev`
