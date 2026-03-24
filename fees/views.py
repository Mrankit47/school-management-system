from rest_framework import status, views, permissions
from rest_framework.response import Response
from .models import StudentFee
from .serializers import StudentFeeSerializer
from core.permissions import IsStudent, IsAdmin

class MyFeesView(views.APIView):
    """
    Student sees their own fee status.
    """
    permission_classes = [IsStudent]

    def get(self, request):
        fees = StudentFee.objects.filter(student__user=request.user)
        serializer = StudentFeeSerializer(fees, many=True)
        return Response(serializer.data)

class AdminFeeUpdateView(views.APIView):
    """
    Admin can mark fees as paid.
    """
    permission_classes = [IsAdmin]

    def post(self, request, fee_id):
        try:
            fee = StudentFee.objects.get(id=fee_id)
            fee.status = 'paid'
            fee.amount_paid = fee.fee_structure.amount
            fee.save()
            return Response({"message": "Fee updated successfully"})
        except StudentFee.DoesNotExist:
            return Response({"error": "Fee record not found"}, status=status.HTTP_404_NOT_FOUND)
