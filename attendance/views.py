from collections import defaultdict
import calendar
from datetime import date as date_type
from datetime import timedelta

from django.db.models import Q
from rest_framework import status, views, permissions
from rest_framework.response import Response
from .models import Attendance
from .serializers import AttendanceSerializer
from core.permissions import IsTeacher, IsStudent
from holidays.models import Holiday
from timetable.models import TimeTableEntry
from .pdf_report import build_student_attendance_report_pdf
from django.http import HttpResponse
from classes.models import ClassSection
from students.models import StudentProfile

class AttendanceMarkView(views.APIView):
    """
    Teacher can POST attendance for individual students.
    """
    permission_classes = [IsTeacher]

    def post(self, request):
        serializer = AttendanceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(marked_by=request.user.teacher_profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TeacherClassAttendanceSummaryView(views.APIView):
    """
    Teacher-only class attendance snapshot for dashboard/attendance screens.

    Query params:
      - class_section_id (required)
      - date (optional, YYYY-MM-DD, defaults to today)
    """

    permission_classes = [IsTeacher]

    def get(self, request):
        class_section_id = request.query_params.get('class_section_id')
        date_raw = request.query_params.get('date')
        if not class_section_id:
            return Response({'error': 'class_section_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            class_section_id = int(class_section_id)
        except Exception:
            return Response({'error': 'Invalid class_section_id'}, status=status.HTTP_400_BAD_REQUEST)

        target_date = date_type.today()
        if date_raw:
            try:
                target_date = date_type.fromisoformat(date_raw)
            except Exception:
                return Response({'error': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)

        class_section = (
            ClassSection.objects.select_related('class_ref', 'section_ref', 'class_teacher__user')
            .filter(id=class_section_id)
            .first()
        )
        if not class_section:
            return Response({'error': 'Class section not found'}, status=status.HTTP_404_NOT_FOUND)

        # Teacher should only access sections assigned to them as class teacher.
        if class_section.class_teacher_id != request.user.teacher_profile.id:
            return Response({'error': 'Not allowed for this class section'}, status=status.HTTP_403_FORBIDDEN)

        students = list(
            StudentProfile.objects.select_related('user')
            .filter(class_section_id=class_section_id)
            .order_by('id')
        )
        student_ids = [s.id for s in students]
        if not student_ids:
            return Response(
                {
                    'class_section_id': class_section.id,
                    'class_display': f'{class_section.class_ref.name} - {class_section.section_ref.name}',
                    'date': target_date.isoformat(),
                    'summary': {
                        'present': 0,
                        'absent': 0,
                        'late': 0,
                        'marked': 0,
                        'total_students': 0,
                        'attendance_percentage': 0.0,
                    },
                    'students': [],
                }
            )

        today_records = Attendance.objects.filter(student_id__in=student_ids, date=target_date)
        today_map = {r.student_id: r for r in today_records}

        # Last 30 day window for low-attendance warning per student.
        window_start = target_date - timedelta(days=29)
        recent_records = Attendance.objects.filter(student_id__in=student_ids, date__gte=window_start, date__lte=target_date)

        recent_by_student = defaultdict(list)
        for r in recent_records:
            recent_by_student[r.student_id].append(r)

        rows = []
        present = 0
        absent = 0
        late = 0
        marked = 0

        for s in students:
            rec = today_map.get(s.id)
            status_value = rec.status if rec else None
            if status_value:
                marked += 1
                if status_value == 'present':
                    present += 1
                elif status_value == 'absent':
                    absent += 1
                elif status_value == 'late':
                    late += 1

            recent_list = recent_by_student.get(s.id, [])
            recent_present = sum(1 for rr in recent_list if rr.status in ('present', 'late'))
            recent_marked = sum(1 for rr in recent_list if rr.status in ('present', 'late', 'absent'))
            recent_pct = (recent_present / recent_marked * 100.0) if recent_marked else 0.0

            rows.append(
                {
                    'id': s.id,
                    'name': s.user.name or s.user.username,
                    'admission_number': s.admission_number,
                    'status': status_value,
                    'status_marked_via': rec.marked_via if rec else None,
                    'recent_attendance_percentage': round(recent_pct, 2),
                    'low_attendance': recent_marked > 0 and recent_pct < 75.0,
                }
            )

        class_attendance_pct = (sum(1 for r in rows if r.get('status') in ('present', 'late')) / marked * 100.0) if marked else 0.0

        return Response(
            {
                'class_section_id': class_section.id,
                'class_display': f'{class_section.class_ref.name} - {class_section.section_ref.name}',
                'date': target_date.isoformat(),
                'summary': {
                    'present': present,
                    'absent': absent,
                    'late': late,
                    'marked': marked,
                    'total_students': len(students),
                    'attendance_percentage': round(class_attendance_pct, 2),
                },
                'students': rows,
            }
        )

class MyAttendanceView(views.APIView):
    """
    Student can see their own attendance history.
    """
    permission_classes = [IsStudent]

    def get(self, request):
        records = Attendance.objects.filter(student__user=request.user).order_by('-date')
        serializer = AttendanceSerializer(records, many=True)
        return Response(serializer.data)


class MyAttendanceReportPDFView(views.APIView):
    """
    Student-only PDF report:
      - ?period=monthly&month=3&year=2026
      - ?period=yearly&year=2026
    """

    permission_classes = [IsStudent]

    def get(self, request):
        period = (request.query_params.get('period') or 'monthly').lower()
        year = request.query_params.get('year')
        month = request.query_params.get('month')

        try:
            year = int(year) if year is not None else date_type.today().year
        except Exception:
            return Response({'error': 'Invalid year'}, status=status.HTTP_400_BAD_REQUEST)

        if period not in ('monthly', 'yearly'):
            return Response({'error': 'Invalid period'}, status=status.HTTP_400_BAD_REQUEST)

        if period == 'monthly':
            try:
                month = int(month) if month is not None else date_type.today().month
            except Exception:
                return Response({'error': 'Invalid month'}, status=status.HTTP_400_BAD_REQUEST)
            month = max(1, min(12, month))
            month_start = date_type(year, month, 1)
            last_day = calendar.monthrange(year, month)[1]
            month_end = date_type(year, month, last_day)
            start_date, end_date = month_start, month_end
            period_label = f'{month}/{year}'
        else:
            start_date = date_type(year, 1, 1)
            end_date = date_type(year, 12, 31)
            period_label = f'{year}'

        student_profile = getattr(request.user, 'student_profile', None)
        if not student_profile:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

        # Attendance records in range (student-only).
        records_qs = (
            Attendance.objects.filter(student__user=request.user)
            .filter(date__gte=start_date, date__lte=end_date)
            .select_related('marked_by')
            .order_by('date')
        )

        attendance_by_date = {r.date: r for r in records_qs}
        present_days = sum(1 for r in records_qs if r.status in ('present', 'late'))
        absent_days = sum(1 for r in records_qs if r.status == 'absent')
        total_marked_days = present_days + absent_days
        attendance_percentage = (present_days / total_marked_days * 100.0) if total_marked_days else 0.0

        summary = {
            'attendance_percentage': attendance_percentage,
            'present_days': present_days,
            'absent_days': absent_days,
            'total_marked_days': total_marked_days,
        }

        # Timetable for subject-wise attendance.
        # Timetable uses class_section. If student doesn't have class_section, we'll keep subject-wise empty.
        timetable_by_day = defaultdict(list)
        if student_profile.class_section_id:
            class_name = student_profile.class_section.class_ref.name
            section = student_profile.class_section.section_ref.name
            timetable_qs = TimeTableEntry.objects.filter(
                class_name=class_name, 
                section=section
            ).all()
            for t in timetable_qs:
                timetable_by_day[t.day].append(t)

        # Holidays in range (skip subject sessions on holidays).
        holiday_by_date = set()
        holidays_qs = Holiday.objects.filter(start_date__lte=end_date).filter(
            Q(end_date__isnull=True, start_date__gte=start_date) | Q(end_date__isnull=False, end_date__gte=start_date)
        )
        for h in holidays_qs:
            h_start = max(h.start_date, start_date)
            h_end = min(h.end_date or h.start_date, end_date)
            d = h_start
            while d <= h_end:
                holiday_by_date.add(d)
                d = d + timedelta(days=1)

        subject_total = defaultdict(int)
        subject_present = defaultdict(int)

        # Count subject-wise per scheduled timetable entry for each attendance-marked date.
        day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

        total_days = (end_date - start_date).days
        for i in range(total_days + 1):
            cur = start_date + timedelta(days=i)
            if cur in holiday_by_date:
                continue
            rec = attendance_by_date.get(cur)
            if not rec:
                continue

            day_num = cur.weekday() + 1  # Monday=1, ..., Sunday=7
            timetable_entries = timetable_by_day.get(day_num) or []
            if not timetable_entries:
                continue

            for t in timetable_entries:
                subject_total[t.subject] += 1
                if rec.status in ('present', 'late'):
                    subject_present[t.subject] += 1

        subject_rows = []
        for subject, total in subject_total.items():
            present_count = subject_present.get(subject, 0)
            percent = (present_count / total * 100.0) if total else 0.0
            subject_rows.append(
                {
                    'subject_name': subject,
                    'present_classes': present_count,
                    'total_classes': total,
                    'percentage': percent,
                }
            )
        subject_rows.sort(key=lambda x: x.get('subject_name', ''))

        # Daily rows for monthly reports (monthly only, keeps yearly PDF smaller).
        daily_rows = []
        if period == 'monthly':
            for r in records_qs:
                daily_rows.append(
                    {
                        'date': r.date.isoformat(),
                        'status': r.status,
                        'marked_via': r.marked_via,
                    }
                )

        student_name = request.user.name or request.user.username
        class_label = 'N/A'
        if student_profile.class_section_id:
            cs = student_profile.class_section
            try:
                class_label = f'{cs.class_ref.name}-{cs.section_ref.name}'
            except Exception:
                class_label = str(cs)

        pdf_bytes = build_student_attendance_report_pdf(
            student_name=student_name,
            class_label=class_label,
            period_label=period_label,
            attendance_records=records_qs,
            summary=summary,
            subject_rows=subject_rows,
            daily_rows=daily_rows,
        )

        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="attendance_report_{period_label.replace("/", "_")}.pdf"'
        return response
