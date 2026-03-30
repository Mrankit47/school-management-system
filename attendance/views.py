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
from timetable.models import Timetable
from .pdf_report import build_student_attendance_report_pdf
from django.http import HttpResponse

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
            timetable_qs = Timetable.objects.filter(class_section=student_profile.class_section).all()
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

            day_name = day_names[cur.weekday()]
            timetable_entries = timetable_by_day.get(day_name) or []
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
