from rest_framework import viewsets, permissions
from .models import TimeTableEntry
from .serializers import TimeTableEntrySerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow only admins to edit, 
    but others to read based on their roles.
    """
    def has_permission(self, request, view):
        if request.user.is_authenticated:
            if request.method in permissions.SAFE_METHODS:
                return True
            return request.user.role == 'admin'
        return False

class TimeTableViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Time Table entries.
    Admin: Full CRUD (requires class_name and section params).
    Teacher: Read-only access to their assigned classes.
    Student: Read-only access to their class schedule.
    """
    queryset = TimeTableEntry.objects.all().select_related('teacher')
    serializer_class = TimeTableEntrySerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        school = getattr(user, 'school', None)
        queryset = TimeTableEntry.objects.all().select_related('teacher')

        # Enforce tenant boundary unless superuser
        if not user.is_superuser and school:
            queryset = queryset.filter(school=school)

        if user.role == 'admin':
            class_name = self.request.query_params.get('class_name')
            section = self.request.query_params.get('section')
            if class_name and section:
                return queryset.filter(class_name=class_name, section=section)
            # Admin must specify a class/section to see the timetable
            return queryset.none()
        
        if user.role == 'teacher':
            return queryset.filter(teacher=user).order_by('day', 'period')
        
        if user.role == 'student':
            student = getattr(user, 'student_profile', None)
            if student and student.class_section:
                return queryset.filter(
                    class_name=student.class_section.class_ref.name,
                    section=student.class_section.section_ref.name
                )
            return queryset.none()
        
        
        return queryset.none()

    def perform_create(self, serializer):
        from django.core.exceptions import ValidationError as DjangoValidationError
        from rest_framework.exceptions import ValidationError as DRFValidationError
        user = self.request.user
        try:
            if not getattr(user, 'is_superuser', False):
                serializer.save(school=getattr(user, 'school', None))
            else:
                serializer.save()
        except DjangoValidationError as e:
            errors = e.message_dict.copy() if hasattr(e, 'message_dict') else {'non_field_errors': getattr(e, 'messages', str(e))}
            if '__all__' in errors:
                errors['non_field_errors'] = errors.pop('__all__')
            raise DRFValidationError(errors)

    def perform_update(self, serializer):
        from django.core.exceptions import ValidationError as DjangoValidationError
        from rest_framework.exceptions import ValidationError as DRFValidationError
        try:
            serializer.save()
        except DjangoValidationError as e:
            errors = e.message_dict.copy() if hasattr(e, 'message_dict') else {'non_field_errors': getattr(e, 'messages', str(e))}
            if '__all__' in errors:
                errors['non_field_errors'] = errors.pop('__all__')
            raise DRFValidationError(errors)
