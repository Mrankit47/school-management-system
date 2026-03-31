import csv
from decimal import Decimal
from io import BytesIO

from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status, views
from rest_framework.response import Response

from core.permissions import IsStudent, IsAdmin
from students.models import StudentProfile
from .models import FeeStructure, StudentFee, Payment
from .serializers import (
    FeeStructureSerializer,
    StudentFeeSerializer,
    StudentFeeListSerializer,
    PaymentSerializer,
)
from .pdf_receipt import build_payment_receipt_pdf


class MyFeesView(views.APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        fees = (
            StudentFee.objects.filter(student__user=request.user)
            .select_related('student__user', 'student__class_section__class_ref', 'student__class_section__section_ref', 'fee_structure')
            .prefetch_related('payments')
        )
        return Response(StudentFeeSerializer(fees, many=True).data)


class FeeStructureListCreateView(views.APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        qs = FeeStructure.objects.select_related('class_ref').all().order_by('class_ref__name')
        return Response(FeeStructureSerializer(qs, many=True).data)

    def post(self, request):
        ser = FeeStructureSerializer(data=request.data)
        if ser.is_valid():
            ser.save()
            return Response(ser.data, status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


class FeeStructureDetailView(views.APIView):
    permission_classes = [IsAdmin]

    def get(self, request, pk: int):
        obj = FeeStructure.objects.select_related('class_ref').filter(pk=pk).first()
        if not obj:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(FeeStructureSerializer(obj).data)

    def patch(self, request, pk: int):
        obj = FeeStructure.objects.filter(pk=pk).first()
        if not obj:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        ser = FeeStructureSerializer(obj, data=request.data, partial=True)
        if ser.is_valid():
            ser.save()
            for sf in obj.student_fees.all():
                sf.due_date = obj.due_date
                sf.save(update_fields=['due_date'])
            return Response(ser.data)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk: int):
        obj = FeeStructure.objects.filter(pk=pk).first()
        if not obj:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        if obj.student_fees.exists():
            return Response(
                {"error": "Cannot delete fee structure with existing student fee records"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminStudentFeeListView(views.APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        qs = StudentFee.objects.select_related(
            'student__user',
            'student__class_section__class_ref',
            'student__class_section__section_ref',
            'fee_structure',
        ).prefetch_related('payments')

        class_id = request.query_params.get('class_id')
        section_id = request.query_params.get('class_section_id')
        student_id = request.query_params.get('student_id')
        overdue_only = request.query_params.get('overdue_only')

        if class_id:
            qs = qs.filter(student__class_section__class_ref_id=class_id)
        if section_id:
            qs = qs.filter(student__class_section_id=section_id)
        if student_id:
            qs = qs.filter(student_id=student_id)

        qs = qs.order_by('-id')
        if request.query_params.get('full') in ('1', 'true', 'yes'):
            data = StudentFeeSerializer(qs, many=True).data
        else:
            data = StudentFeeListSerializer(qs, many=True).data
        if overdue_only and overdue_only.lower() in ('1', 'true', 'yes'):
            data = [row for row in data if row.get('overdue') and row.get('status') != 'paid']
        return Response(data)


class AdminStudentFeeDetailView(views.APIView):
    permission_classes = [IsAdmin]

    def get(self, request, pk: int):
        sf = (
            StudentFee.objects.select_related(
                'student__user',
                'student__class_section__class_ref',
                'student__class_section__section_ref',
                'fee_structure',
            )
            .prefetch_related('payments')
            .filter(pk=pk)
            .first()
        )
        if not sf:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(StudentFeeSerializer(sf).data)


class AdminStudentFeeCreateView(views.APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        student_id = request.data.get('student_id')
        if not student_id:
            return Response({"error": "student_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        student = StudentProfile.objects.select_related('class_section__class_ref').filter(id=student_id).first()
        if not student or not student.class_section:
            return Response({"error": "Student or class not found"}, status=status.HTTP_400_BAD_REQUEST)
        structure = FeeStructure.objects.filter(class_ref_id=student.class_section.class_ref_id).first()
        if not structure:
            return Response(
                {"error": "No fee structure defined for this class"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        sf, created = StudentFee.objects.get_or_create(
            student=student,
            fee_structure=structure,
            defaults={'due_date': structure.due_date},
        )
        if not created and sf.due_date != structure.due_date:
            sf.due_date = structure.due_date
            sf.save(update_fields=['due_date'])
        return Response(StudentFeeSerializer(sf).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class AdminSyncClassFeesView(views.APIView):
    """Create StudentFee rows for all students in a MainClass if missing."""

    permission_classes = [IsAdmin]

    def post(self, request):
        class_id = request.data.get('class_id')
        if not class_id:
            return Response({"error": "class_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        structure = FeeStructure.objects.filter(class_ref_id=class_id).first()
        if not structure:
            return Response({"error": "Fee structure not found for class"}, status=status.HTTP_400_BAD_REQUEST)
        students = StudentProfile.objects.filter(class_section__class_ref_id=class_id)
        created = 0
        for s in students:
            _, was_created = StudentFee.objects.get_or_create(
                student=s,
                fee_structure=structure,
                defaults={'due_date': structure.due_date},
            )
            if was_created:
                created += 1
        return Response({"message": "Sync complete", "created": created, "students_checked": students.count()})


class AdminPaymentCreateView(views.APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        student_fee_id = request.data.get('student_fee_id')
        amount = request.data.get('amount')
        payment_date = request.data.get('payment_date')
        payment_mode = request.data.get('payment_mode', 'Cash')
        transaction_id = request.data.get('transaction_id', '')

        if not student_fee_id or amount is None or not payment_date:
            return Response(
                {"error": "student_fee_id, amount, and payment_date are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        sf = StudentFee.objects.select_related('fee_structure').filter(id=student_fee_id).first()
        if not sf:
            return Response({"error": "Student fee record not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            amount_dec = Decimal(str(amount))
        except Exception:
            return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

        if amount_dec <= 0:
            return Response({"error": "Amount must be positive"}, status=status.HTTP_400_BAD_REQUEST)

        balance = sf.due_amount
        if amount_dec > balance + Decimal('0.009'):
            return Response(
                {"error": f"Amount exceeds due balance (₹{balance})"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pay = Payment.objects.create(
            student_fee=sf,
            amount=amount_dec,
            payment_date=payment_date,
            payment_mode=payment_mode,
            transaction_id=transaction_id or '',
        )
        sf.refresh_from_db()
        return Response(
            {
                'payment': PaymentSerializer(pay).data,
                'student_fee': StudentFeeSerializer(sf).data,
            },
            status=status.HTTP_201_CREATED,
        )


class AdminReceiptPDFView(views.APIView):
    permission_classes = [IsAdmin]

    def get(self, request, payment_id: int):
        pay = (
            Payment.objects.select_related(
                'student_fee__student__user',
                'student_fee__student__class_section__class_ref',
                'student_fee__student__class_section__section_ref',
            )
            .filter(id=payment_id)
            .first()
        )
        if not pay:
            return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)
        pdf_bytes = build_payment_receipt_pdf(pay)
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="fee_receipt_{payment_id}.pdf"'
        return response


class StudentReceiptPDFView(views.APIView):
    permission_classes = [IsStudent]

    def get(self, request, payment_id: int):
        pay = (
            Payment.objects.select_related(
                'student_fee__student__user',
                'student_fee__student__class_section__class_ref',
                'student_fee__student__class_section__section_ref',
            )
            .filter(id=payment_id, student_fee__student__user=request.user)
            .first()
        )
        if not pay:
            return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)
        pdf_bytes = build_payment_receipt_pdf(pay)
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="fee_receipt_{payment_id}.pdf"'
        return response


class AdminFeesDashboardView(views.APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        today = timezone.now().date()
        records = list(
            StudentFee.objects.select_related('fee_structure').all()
        )
        total_scheduled = sum((r.fee_structure.total_fees for r in records), Decimal('0'))
        total_paid = sum((r.amount_paid for r in records), Decimal('0'))
        total_outstanding = sum((r.due_amount for r in records), Decimal('0'))
        overdue_count = sum(
            1 for r in records if r.status != 'paid' and r.due_date < today
        )
        return Response(
            {
                'student_fee_records': len(records),
                'total_fees_scheduled': str(total_scheduled),
                'total_paid': str(total_paid),
                'total_due': str(total_outstanding),
                'overdue_records': overdue_count,
            }
        )


class AdminFeesExportCSVView(views.APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        qs = StudentFee.objects.select_related(
            'student__user',
            'student__class_section__class_ref',
            'student__class_section__section_ref',
            'fee_structure',
        ).order_by('id')

        class_id = request.query_params.get('class_id')
        if class_id:
            qs = qs.filter(student__class_section__class_ref_id=class_id)

        buf = BytesIO()
        w = csv.writer(buf)
        w.writerow(
            [
                'ID',
                'Student',
                'Admission',
                'Class',
                'Total Fees',
                'Paid',
                'Due',
                'Status',
                'Due Date',
                'Overdue',
            ]
        )
        today = timezone.now().date()
        for r in qs:
            cs = r.student.class_section
            cls = f"{cs.class_ref.name}-{cs.section_ref.name}" if cs else ''
            overdue = r.status != 'paid' and r.due_date < today
            w.writerow(
                [
                    r.id,
                    r.student.user.name or r.student.user.username,
                    r.student.admission_number,
                    cls,
                    r.fee_structure.total_fees,
                    r.amount_paid,
                    r.due_amount,
                    r.status,
                    r.due_date,
                    overdue,
                ]
            )
        data = buf.getvalue()
        buf.close()
        resp = HttpResponse(data, content_type='text/csv')
        resp['Content-Disposition'] = 'attachment; filename="student_fees.csv"'
        return resp


class AdminPaymentReminderView(views.APIView):
    """UI-only hook: no email integration yet."""

    permission_classes = [IsAdmin]

    def post(self, request):
        student_fee_id = request.data.get('student_fee_id')
        if not student_fee_id:
            return Response({"error": "student_fee_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        sf = StudentFee.objects.select_related('student__user').filter(id=student_fee_id).first()
        if not sf:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        # Placeholder for SMS/email
        return Response(
            {
                "message": "Reminder queued (demo — connect SMS/email in production)",
                "student": sf.student.user.name or sf.student.user.username,
                "due_amount": str(sf.due_amount),
            }
        )
