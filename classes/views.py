from rest_framework import views, permissions
from rest_framework.response import Response
from .models import ClassSection
from .serializers import ClassSectionSerializer

class ClassSectionListView(views.APIView):
    """
    List all available class-section mappings. Useful for dropdowns.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sections = ClassSection.objects.all()
        serializer = ClassSectionSerializer(sections, many=True)
        return Response(serializer.data)
