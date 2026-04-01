from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from .models import School
from .serializers import PublicSchoolSerializer, SchoolAdminSerializer

class PublicSchoolInfoView(APIView):
    """
    Public API to fetch branding and basic details of a specific school.
    No authentication required.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, school_id):
        school = get_object_or_404(School, school_id=school_id, is_active=True)
        serializer = PublicSchoolSerializer(school)
        return Response(serializer.data)

class IsSuperAdmin(permissions.BasePermission):
    """Custom permission to only allow superadmins."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)

from rest_framework.decorators import action

class SuperadminSchoolViewSet(viewsets.ModelViewSet):
    """
    Superadmin API for full CRUD on Schools.
    """
    permission_classes = [IsSuperAdmin]
    serializer_class = SchoolAdminSerializer

    def get_queryset(self):
        return School.objects.annotate(
            user_count=Count('user'),
            teacher_count=Count('user', filter=Q(user__role='teacher')),
            student_count=Count('user', filter=Q(user__role='student'))
        )

    @action(detail=True, methods=['get'])
    def admins(self, request, pk=None):
        school = self.get_object()
        admins = school.user_set.filter(role='admin').values('name', 'email', 'username', 'is_active')
        return Response(admins)

