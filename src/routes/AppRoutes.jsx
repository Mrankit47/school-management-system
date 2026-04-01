import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import LandingPage from '../pages/LandingPage';
import ProtectedRoute from './ProtectedRoute';

// Student
import StudentDashboard from '../pages/student/Dashboard';
import Notifications from '../pages/student/Notifications';
import StudentProfile from '../pages/student/Profile';
import StudentResults from '../pages/student/Results';
import StudentAssignments from '../pages/student/Assignments';
import StudentTimetable from '../pages/student/Timetable';
import StudentFees from '../pages/student/Fees';
import StudentAttendance from '../pages/student/Attendance';
import StudentHolidays from '../pages/student/Holidays';
import StudentMessaging from '../pages/student/Messaging';

// Teacher
import TeacherDashboard from '../pages/teacher/Dashboard';
import TeacherProfile from '../pages/teacher/Profile';
import TeacherStudents from '../pages/teacher/Students';
import MarkAttendance from '../pages/teacher/MarkAttendance';
import UploadResult from '../pages/teacher/UploadResult';
import TeacherAssignment from '../pages/teacher/Assignment';
import TeacherMessaging from '../pages/teacher/Messaging';
import TeacherHolidays from '../pages/teacher/Holidays';

// Admin
import AddStudent from '../pages/admin/AddStudent';
import AdminDashboard from '../pages/admin/Dashboard';
import AddTeacher from '../pages/admin/AddTeacher';
import AdminProfile from '../pages/admin/Profile';
import ManageStudents from '../pages/admin/ManageStudents';
import ManageTeachers from '../pages/admin/ManageTeachers';
import AdminClasses from '../pages/admin/Classes';
import AdminSubjects from '../pages/admin/Subjects';
import AssignTeacher from '../pages/admin/AssignTeacher';
import AdminExams from '../pages/admin/Exams';
import AdminFees from '../pages/admin/Fees';
import AdminHolidays from '../pages/admin/Holidays';
import AdminReports from '../pages/admin/Reports';
import SubjectDetails from '../pages/admin/SubjectDetails';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            
            {/* Student */}
            <Route path="/student/*" element={<ProtectedRoute allowedRoles={['student']}>
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="results" element={<StudentResults />} />
                <Route path="results/exam" element={<StudentResults />} />
                <Route path="results/mst" element={<StudentResults />} />
                <Route path="assignments" element={<StudentAssignments />} />
                <Route path="timetable" element={<StudentTimetable />} />
                <Route path="attendance" element={<StudentAttendance />} />
                <Route path="fees" element={<StudentFees />} />
                <Route path="holidays" element={<StudentHolidays />} />
                <Route path="messaging" element={<StudentMessaging />} />
              </Routes>
            </ProtectedRoute>} />

            {/* Teacher */}
            <Route path="/teacher/*" element={<ProtectedRoute allowedRoles={['teacher']}>
              <Routes>
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="profile" element={<TeacherProfile />} />
                <Route path="students" element={<TeacherStudents />} />
                <Route path="attendance" element={<MarkAttendance />} />
                <Route path="upload-result" element={<UploadResult />} />
                <Route path="assignment" element={<TeacherAssignment />} />
                <Route path="messaging" element={<TeacherMessaging />} />
                <Route path="holidays" element={<TeacherHolidays />} />
              </Routes>
            </ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}>
              <Routes>
                <Route path="add-student" element={<AddStudent />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="add-teacher" element={<AddTeacher />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="manage-students" element={<ManageStudents />} />
                <Route path="manage-teachers" element={<ManageTeachers />} />
                <Route path="classes" element={<AdminClasses />} />
                <Route path="assign-teacher" element={<AssignTeacher />} />
                <Route path="subjects" element={<AdminSubjects />} />
                <Route path="subjects/:subjectId" element={<SubjectDetails />} />
                <Route path="exams" element={<AdminExams />} />
                <Route path="fees" element={<AdminFees />} />
                <Route path="holidays" element={<AdminHolidays />} />
                <Route path="reports" element={<AdminReports />} />
              </Routes>
            </ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
