import os
import django
import re
from typing import List, Optional
from datetime import date
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel

# 1. Initialize Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

# 2. Import Django models after setup
from accounts.models import User
from students.models import StudentProfile
from teachers.models import TeacherProfile
from attendance.models import Attendance
from classes.models import ClassSection
from academics.models import Exam, Result
from fees.models import StudentFee

app = FastAPI(
    title="School Management System - API",
    description="High-performance FastAPI wrapper for Django ORM",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SCHEMAS ---
class LoginSchema(BaseModel):
    username: str
    password: str

class UserSchema(BaseModel):
    id: int
    username: str
    email: str
    role: str

class StudentSchema(BaseModel):
    id: int
    name: str
    username: str
    email: str
    admission_number: str
    class_name: str

class StudentCreateSchema(BaseModel):
    username: str
    email: str
    password: str
    name: str
    admission_number: str
    class_section: str

class TeacherCreateSchema(BaseModel):
    username: str
    email: str
    password: str
    name: str
    employee_id: str
    subject_specialization: Optional[str] = None

class TeacherSchema(BaseModel):
    id: int
    name: str
    employee_id: str
    subject_specialization: Optional[str]

class AttendanceSchema(BaseModel):
    student_name: str
    date: date
    status: str

# --- ENDPOINTS ---

@app.get("/", tags=["General"])
def read_root():
    return {"message": "School System is running on FastAPI with Django ORM!"}

@app.get("/api/v1/users", response_model=List[UserSchema], tags=["Accounts"])
def get_users():
    users = User.objects.all()
    return [UserSchema(id=u.id, username=u.username, email=u.email, role=u.role) for u in users]

@app.post("/api/v1/auth/login", tags=["Auth"])
def login(data: LoginSchema):
    from django.contrib.auth import authenticate
    user = authenticate(username=data.username, password=data.password)
    if user:
        return {
            "access": "mock_access_token_for_now",
            "refresh": "mock_refresh_token",
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role,
                "name": user.name or user.username
            }
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/v1/accounts/profile/", tags=["Accounts"])
def get_profile():
    # Since I don't have a real JWT implementation yet, 
    # and the frontend is just calling this after login,
    # we return a generic admin profile for now as a fallback. 
    # Real logic should identify current user.
    user = User.objects.filter(role='admin').first()
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "name": user.name or user.username
    }

@app.get("/api/v1/students", response_model=List[StudentSchema], tags=["Students"])
def get_students(class_id: Optional[int] = None):
    query = StudentProfile.objects.select_related('user', 'class_section__class_ref', 'class_section__section_ref')
    if class_id:
        query = query.filter(class_section_id=class_id)
    students = query.all()
    return [
        StudentSchema(
            id=s.id,
            name=s.user.name or s.user.username,
            username=s.user.username,
            email=s.user.email,
            admission_number=s.admission_number,
            class_name=f"{s.class_section.class_ref.name} - {s.class_section.section_ref.name}" if s.class_section else "N/A"
        ) for s in students
    ]

@app.post("/api/v1/students/admin/create-student/", tags=["Students"])
def admin_create_student(data: StudentCreateSchema):
    if User.objects.filter(username=data.username).exists():
        raise HTTPException(status_code=400, detail="Username already exists")
    
    user = User.objects.create_user(
        username=data.username,
        email=data.email,
        password=data.password,
        role='student',
        name=data.name
    )
    
    # Simple parsing logic for class-section (e.g., "10-A", "10A")
    cs_input = data.class_section.upper().replace(' ', '')
    if '-' in cs_input:
        class_name, section_name = cs_input.split('-', 1)
    else:
        match = re.search(r"(\d+)([A-Z]+)", cs_input)
        if match:
            class_name, section_name = match.groups()
        else:
            # Fallback: assume last char is section if length > 1
            if len(cs_input) > 1:
                class_name = cs_input[:-1]
                section_name = cs_input[-1]
            else:
                class_name = cs_input
                section_name = 'A'
    
    c_obj, _ = MainClass.objects.get_or_create(name=class_name)
    s_obj, _ = MainSection.objects.get_or_create(name=section_name)
    cs_obj, _ = ClassSection.objects.get_or_create(class_ref=c_obj, section_ref=s_obj)

    student = StudentProfile.objects.create(
        user=user,
        admission_number=data.admission_number,
        class_section=cs_obj
    )
    
    return {"message": "Student created successfully", "id": student.id}

@app.post("/api/v1/teachers/admin/create-teacher/", tags=["Teachers"])
def admin_create_teacher(data: TeacherCreateSchema):
    if User.objects.filter(username=data.username).exists():
        raise HTTPException(status_code=400, detail="Username already exists")
    
    user = User.objects.create_user(
        username=data.username,
        email=data.email,
        password=data.password,
        role='teacher',
        name=data.name
    )
    
    teacher = TeacherProfile.objects.create(
        user=user,
        employee_id=data.employee_id,
        subject_specialization=data.subject_specialization
    )
    
    return {"message": "Teacher created successfully", "id": teacher.id}

@app.get("/api/v1/teachers", response_model=List[TeacherSchema], tags=["Teachers"])
def get_teachers():
    teachers = TeacherProfile.objects.select_related('user').all()
    return [
        TeacherSchema(
            id=t.id,
            name=t.user.name or t.user.username,
            employee_id=t.employee_id,
            subject_specialization=t.subject_specialization
        ) for t in teachers
    ]

@app.get("/api/v1/attendance", response_model=List[AttendanceSchema], tags=["Attendance"])
def get_attendance(student_id: Optional[int] = Query(None)):
    query = Attendance.objects.select_related('student__user')
    if student_id:
        query = query.filter(student_id=student_id)
    records = query.all()
    return [
        AttendanceSchema(
            student_name=r.student.user.name or r.student.user.username,
            date=r.date,
            status=r.status
        ) for r in records
    ]


# --- Static File Serving (Frontend) ---

# This will serve the React frontend from the 'dist' folder
if os.path.exists("dist"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

@app.get("/{full_path:path}", tags=["General"])
async def serve_frontend(full_path: str):
    # Exclude API and Docs from being caught by frontend router
    if full_path.startswith("api/v1") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
        raise HTTPException(status_code=404)
        
    # Serve index.html for all other routes (SPA)
    if os.path.exists("dist/index.html"):
        return FileResponse("dist/index.html")
    
    return HTMLResponse("""
        <div style='text-align:center; padding-top:100px; font-family:sans-serif;'>
            <h1>School System API is Active! 🚀</h1>
            <p>Frontend build (<code>dist</code>) not found.</p>
            <p>To see the UI, please run <code>npm run build</code> first.</p>
            <p>Or use <a href='/docs'>Swagger API Docs</a>.</p>
        </div>
    """)

import uvicorn
import subprocess
import threading

def start_frontend():
    print("🚀 Starting Frontend (Vite) on http://localhost:5173 ...")
    try:
        # Use npx to ensure we find the local vite
        subprocess.Popen(["npx", "vite", "--port", "5173", "--host", "127.0.0.1"], shell=True)
    except Exception as e:
        print(f"❌ Error starting frontend: {e}")

if __name__ == "__main__":
    # 1. Start Frontend in background
    frontend_thread = threading.Thread(target=start_frontend, daemon=True)
    frontend_thread.start()
    
    # 2. Start Backend
    print("🚀 Starting Backend (FastAPI) on http://127.0.0.1:8000 ...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
