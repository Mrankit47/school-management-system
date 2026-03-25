from rest_framework import views, permissions, status
from rest_framework.response import Response
from .models import ClassSection, MainClass, MainSection
from .serializers import (
    ClassSectionSerializer,
    MainClassSerializer,
    MainSectionSerializer,
)
from core.permissions import IsAdmin

class ClassSectionListView(views.APIView):
    """
    List all available class-section mappings. Useful for dropdowns.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sections = ClassSection.objects.all()
        serializer = ClassSectionSerializer(sections, many=True)
        return Response(serializer.data)


class MainClassListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        classes = MainClass.objects.all().order_by('id')
        serializer = MainClassSerializer(classes, many=True)
        return Response(serializer.data)


class MainSectionListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sections = MainSection.objects.all().order_by('id')
        serializer = MainSectionSerializer(sections, many=True)
        return Response(serializer.data)


class AdminMainClassCreateView(views.APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        name = request.data.get('name')
        if not name:
            return Response({"error": "name is required"}, status=status.HTTP_400_BAD_REQUEST)

        obj, created = MainClass.objects.get_or_create(name=name)
        return Response(
            {"message": "Class created" if created else "Class already exists", "id": obj.id},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class AdminMainSectionCreateView(views.APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        name = request.data.get('name')
        if not name:
            return Response({"error": "name is required"}, status=status.HTTP_400_BAD_REQUEST)

        obj, created = MainSection.objects.get_or_create(name=name)
        return Response(
            {"message": "Section created" if created else "Section already exists", "id": obj.id},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )
