from collections import defaultdict
from datetime import date
from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.db.models import Q
from rest_framework import permissions, status, views
from rest_framework.response import Response

from core.permissions import IsAdmin, IsStudent, IsTeacher
from .models import Exam, ExamSchedule, Result
from .serializers import ExamScheduleSerializer, ExamSerializer, ResultSerializer
from .pdf_marksheet import build_student_marksheet_pdf, _pct_to_grade
from django.conf import settings
from django.http import HttpResponse


class ExamListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Exam.objects.select_related('class_section__class_ref', 'class_section__section_ref').all()
        if request.user.role == 'student':
            student_profile = request.user.student_profile
            qs = qs.filter(class_section=student_profile.class_section)
        class_section = request.query_params.get('class_section')
        if class_section:
            qs = qs.filter(class_section_id=class_section)
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        qs = qs.order_by('-start_date', '-id')
        return Response(ExamSerializer(qs, many=True).data)

    def post(self, request):
        if request.user.role not in ('admin', 'teacher'):
            return Response({'error': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        serializer = ExamSerializer(data=request.data)
        if serializer.is_valid():
            exam = serializer.save()
            return Response(ExamSerializer(exam).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExamDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, exam_id: int):
        if request.user.role not in ('admin', 'teacher'):
            return Response({'error': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        exam = Exam.objects.filter(id=exam_id).first()
        if not exam:
            return Response({'error': 'Exam not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ExamSerializer(exam, data=request.data, partial=True)
        if serializer.is_valid():
            exam = serializer.save()
            return Response(ExamSerializer(exam).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, exam_id: int):
        if request.user.role != 'admin':
            return Response({'error': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        exam = Exam.objects.filter(id=exam_id).first()
        if not exam:
            return Response({'error': 'Exam not found'}, status=status.HTTP_404_NOT_FOUND)
        exam.delete()
        return Response({'message': 'Exam deleted successfully'})


def _time_overlap(start_a, end_a, start_b, end_b):
    return start_a < end_b and start_b < end_a


class ExamScheduleListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, exam_id: int):
        exam = Exam.objects.filter(id=exam_id).first()
        if not exam:
            return Response({'error': 'Exam not found'}, status=status.HTTP_404_NOT_FOUND)
        rows = ExamSchedule.objects.filter(exam_id=exam_id).order_by('exam_date', 'start_time')
        return Response(ExamScheduleSerializer(rows, many=True).data)

    def post(self, request, exam_id: int):
        if request.user.role not in ('admin', 'teacher'):
            return Response({'error': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        exam = Exam.objects.select_related('class_section').filter(id=exam_id).first()
        if not exam:
            return Response({'error': 'Exam not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ExamScheduleSerializer(data={**request.data, 'exam': exam_id})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        validated = serializer.validated_data

        exam_date = validated['exam_date']
        start_time = validated['start_time']
        end_time = validated['end_time']
        if end_time <= start_time:
            return Response({'error': 'end_time must be after start_time'}, status=status.HTTP_400_BAD_REQUEST)

        # Validation: no clash for same class on same date
        clashes = (
            ExamSchedule.objects.select_related('exam')
            .filter(
                exam__class_section_id=exam.class_section_id,
                exam_date=exam_date,
            )
            .exclude(exam_id=exam.id)
        )
        for c in clashes:
            if _time_overlap(start_time, end_time, c.start_time, c.end_time):
                return Response(
                    {'error': f'Time clash with another exam schedule ({c.exam.name} - {c.subject})'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        row = serializer.save()
        return Response(ExamScheduleSerializer(row).data, status=status.HTTP_201_CREATED)


class ExamScheduleDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, schedule_id: int):
        if request.user.role not in ('admin', 'teacher'):
            return Response({'error': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        row = ExamSchedule.objects.select_related('exam').filter(id=schedule_id).first()
        if not row:
            return Response({'error': 'Schedule not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ExamScheduleSerializer(row, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        row = serializer.save()

        if row.end_time <= row.start_time:
            return Response({'error': 'end_time must be after start_time'}, status=status.HTTP_400_BAD_REQUEST)

        clashes = (
            ExamSchedule.objects.select_related('exam')
            .filter(
                exam__class_section_id=row.exam.class_section_id,
                exam_date=row.exam_date,
            )
            .exclude(id=row.id)
            .exclude(exam_id=row.exam_id)
        )
        for c in clashes:
            if _time_overlap(row.start_time, row.end_time, c.start_time, c.end_time):
                return Response(
                    {'error': f'Time clash with another exam schedule ({c.exam.name} - {c.subject})'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        return Response(ExamScheduleSerializer(row).data)

    def delete(self, request, schedule_id: int):
        if request.user.role not in ('admin', 'teacher'):
            return Response({'error': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        row = ExamSchedule.objects.filter(id=schedule_id).first()
        if not row:
            return Response({'error': 'Schedule not found'}, status=status.HTTP_404_NOT_FOUND)
        row.delete()
        return Response({'message': 'Schedule deleted'})


class ResultUploadView(views.APIView):
    permission_classes = [IsTeacher | IsAdmin]

    def post(self, request):
        payload = request.data
        if isinstance(payload, dict) and isinstance(payload.get('results'), list):
            exam_id = payload.get('exam')
            student_id = payload.get('student')
            results = payload.get('results', [])

            if not exam_id or not student_id:
                return Response({"error": "exam and student are required"}, status=status.HTTP_400_BAD_REQUEST)
            if not results:
                return Response({"error": "results list is required"}, status=status.HTTP_400_BAD_REQUEST)

            errors = []
            parsed_rows = []

            for idx, r in enumerate(results):
                subject = (r.get('subject') or '').strip()
                marks_raw = r.get('marks')
                max_marks_raw = r.get('max_marks')
                absent = bool(r.get('absent'))

                if not subject:
                    errors.append({"index": idx, "error": "subject is required"})
                    continue

                try:
                    max_marks = Decimal(str(max_marks_raw))
                except (InvalidOperation, TypeError, ValueError):
                    errors.append({"index": idx, "subject": subject, "error": "max_marks must be a number"})
                    continue
                if max_marks < 0:
                    errors.append({"index": idx, "subject": subject, "error": "max_marks cannot be negative"})
                    continue

                marks = None
                if not absent:
                    try:
                        marks = Decimal(str(marks_raw))
                    except (InvalidOperation, TypeError, ValueError):
                        errors.append({"index": idx, "subject": subject, "error": "marks must be a number"})
                        continue
                    if marks < 0:
                        errors.append({"index": idx, "subject": subject, "error": "marks cannot be negative"})
                        continue
                    if marks > max_marks:
                        errors.append({"index": idx, "subject": subject, "error": "marks cannot be greater than max_marks"})
                        continue

                parsed_rows.append((subject, marks, max_marks, absent))

            if errors:
                return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                for subject, marks, max_marks, absent in parsed_rows:
                    Result.objects.update_or_create(
                        student_id=student_id,
                        exam_id=exam_id,
                        subject=subject,
                        defaults={"marks": marks, "max_marks": max_marks, "absent": absent},
                    )

            return Response({"message": "Results uploaded successfully"}, status=status.HTTP_201_CREATED)

        serializer = ResultSerializer(data=payload)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExamResultDashboardView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, exam_id: int):
        student_id = request.query_params.get('student_id')
        exam = Exam.objects.filter(id=exam_id).first()
        if not exam:
            return Response({'error': 'Exam not found'}, status=status.HTTP_404_NOT_FOUND)

        qs = Result.objects.select_related('student__user', 'exam').filter(exam_id=exam_id)
        if request.user.role == 'student':
            qs = qs.filter(student__user=request.user)
        elif student_id:
            qs = qs.filter(student_id=student_id)

        grouped = defaultdict(list)
        for r in qs:
            grouped[r.student_id].append(r)

        rows = []
        for sid, marks_rows in grouped.items():
            student_name = marks_rows[0].student.user.name or marks_rows[0].student.user.username
            total_obtained = Decimal('0')
            total_max = Decimal('0')
            absent_count = 0
            subject_rows = []
            for m in marks_rows:
                obtained = Decimal('0') if m.marks is None else m.marks
                total_obtained += obtained
                total_max += m.max_marks
                if m.absent:
                    absent_count += 1
                subject_rows.append(ResultSerializer(m).data)

            pct = float((total_obtained / total_max) * 100) if total_max > 0 else 0.0
            grade = 'F'
            if pct >= 90:
                grade = 'A+'
            elif pct >= 80:
                grade = 'A'
            elif pct >= 70:
                grade = 'B'
            elif pct >= 60:
                grade = 'C'
            elif pct >= 50:
                grade = 'D'
            status_text = 'Pass' if total_obtained >= exam.passing_marks else 'Fail'

            rows.append({
                'student_id': sid,
                'student_name': student_name,
                'total_marks': str(total_max),
                'obtained_marks': str(total_obtained),
                'percentage': round(pct, 2),
                'grade': grade,
                'status': status_text,
                'absent_subjects': absent_count,
                'subjects': subject_rows,
            })
        return Response(rows)


class PublishResultView(views.APIView):
    permission_classes = [IsAdmin | IsTeacher]

    def post(self, request, exam_id: int):
        exam = Exam.objects.filter(id=exam_id).first()
        if not exam:
            return Response({'error': 'Exam not found'}, status=status.HTTP_404_NOT_FOUND)
        publish = request.data.get('publish')
        if publish is None:
            publish = True
        exam.result_published = bool(publish)
        exam.save(update_fields=['result_published'])
        return Response({'message': 'Result publish status updated', 'result_published': exam.result_published})


class MyResultsView(views.APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        # Student can only view results when exam is published.
        results = (
            Result.objects.select_related('exam')
            .filter(student__user=request.user, exam__result_published=True)
            .order_by('-exam__start_date', 'subject')
        )
        serializer = ResultSerializer(results, many=True)
        return Response(serializer.data)


class MyResultMarksheetPDFView(views.APIView):
    """
    Student-only marksheet PDF for a given exam.
    """

    permission_classes = [IsStudent]

    def get(self, request, exam_id: int):
        exam = Exam.objects.filter(id=exam_id).first()
        if not exam:
            return Response({'error': 'Exam not found'}, status=status.HTTP_404_NOT_FOUND)

        student_results = (
            Result.objects.select_related('exam')
            .filter(student__user=request.user, exam_id=exam_id, exam__result_published=True)
            .order_by('subject')
        )

        if not student_results.exists():
            return Response({'error': 'Results not found or not published'}, status=status.HTTP_404_NOT_FOUND)

        profile = getattr(request.user, 'student_profile', None)
        if not profile:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

        total_max = 0.0
        total_obt = 0.0

        subject_rows = []
        passing_marks = float(exam.passing_marks or 0)

        for r in student_results:
            max_marks = float(r.max_marks) if r.max_marks is not None else 0.0
            marks = float(r.marks) if (r.marks is not None and not r.absent) else 0.0

            total_max += max_marks
            total_obt += marks

            if r.absent or r.marks is None:
                grade = 'ABS'
                result_text = 'Absent'
            else:
                pct = (marks / max_marks * 100.0) if max_marks > 0 else 0.0
                grade = _pct_to_grade(pct)
                result_text = 'Pass' if marks >= passing_marks else 'Fail'

            subject_rows.append(
                {
                    'subject': r.subject,
                    'max_marks': max_marks,
                    'marks': marks,
                    'grade': grade,
                    'result': result_text,
                }
            )

        percentage = (total_obt / total_max * 100.0) if total_max > 0 else 0.0
        overall_grade = _pct_to_grade(percentage)
        final_result = 'Pass' if total_obt >= passing_marks else 'Fail'

        start_date = exam.start_date
        end_date = exam.end_date or exam.start_date
        if start_date and end_date:
            academic_year = f"{start_date.year}-{str(end_date.year)[-2:]}"
        else:
            academic_year = '—'

        class_label = 'N/A'
        if profile.class_section_id:
            cs = profile.class_section
            class_label = f"{cs.class_ref.name}-{cs.section_ref.name}"

        school_name = getattr(settings, 'SCHOOL_NAME', 'School Management System')
        declaration_date = str(exam.start_date) if exam.start_date else '—'

        pdf_bytes = build_student_marksheet_pdf(
            school_name=school_name,
            student_name=request.user.name or request.user.username,
            roll_number=str(profile.admission_number or ''),
            class_label=class_label,
            academic_year=academic_year,
            exam_type=exam.exam_type,
            declaration_date=declaration_date,
            total_obtained=total_obt,
            total_max=total_max,
            percentage=percentage,
            overall_grade=overall_grade,
            final_result=final_result,
            subject_rows=subject_rows,
            class_teacher_name='—',
            remarks='—',
        )

        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="marksheet_exam_{exam_id}.pdf"'
        return response
