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

// Teacher
import TeacherDashboard from '../pages/teacher/Dashboard';
import TeacherProfile from '../pages/teacher/Profile';
import TeacherStudents from '../pages/teacher/Students';
import MarkAttendance from '../pages/teacher/MarkAttendance';
import UploadResult from '../pages/teacher/UploadResult';
import TeacherAssignment from '../pages/teacher/Assignment';
import TeacherMessaging from '../pages/teacher/Messaging';

// Admin
import AdminDashboard from '../pages/admin/Dashboard';
import AdminProfile from '../pages/admin/Profile';
import ManageStudents from '../pages/admin/ManageStudents';
import ManageTeachers from '../pages/admin/ManageTeachers';
import AdminClasses from '../pages/admin/Classes';
import AssignTeacher from '../pages/admin/AssignTeacher';
import AdminExams from '../pages/admin/Exams';
import AdminFees from '../pages/admin/Fees';
import AdminHolidays from '../pages/admin/Holidays';
import AdminReports from '../pages/admin/Reports';

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
                <Route path="assignments" element={<StudentAssignments />} />
                <Route path="timetable" element={<StudentTimetable />} />
                <Route path="attendance" element={<StudentAttendance />} />
                <Route path="fees" element={<StudentFees />} />
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
              </Routes>
            </ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="manage-students" element={<ManageStudents />} />
                <Route path="manage-teachers" element={<ManageTeachers />} />
                <Route path="classes" element={<AdminClasses />} />
                <Route path="assign-teacher" element={<AssignTeacher />} />
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
