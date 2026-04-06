from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.views import TokenObtainPairView
from accounts.serializers import CustomTokenObtainPairSerializer
from accounts.views import AdminDashboardStatsView


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

urlpatterns = [
    path('api/tenants/', include('tenants.urls')),
    path('admin/', admin.site.urls),
    
    # Auth
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Modular Apps URLs
    path('api/accounts/', include('accounts.urls')),
    path('api/students/', include('students.urls')),
    path('api/teachers/', include('teachers.urls')),
    path('api/classes/', include('classes.urls')),
    path('api/attendance/', include('attendance.urls')),
    path('api/academics/', include('academics.urls')),
    path('api/assignments/', include('assignments.urls')),
    path('api/communication/', include('communication.urls')),
    path('api/fees/', include('fees.urls')),
    path('api/timetable/', include('timetable.urls')),
    path('api/subjects/', include('subjects.urls')),
    path('api/holidays/', include('holidays.urls')),
    path('api/syllabus/', include('syllabus.urls')),

    # Admin Dashboard stats (used by the React admin dashboard cards)
    path('api/admin/dashboard/stats', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
]

# Serve uploaded files in dev mode.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
