from django.urls import path
from .views import MyFeesView, AdminFeeUpdateView

urlpatterns = [
    path('my/', MyFeesView.as_view(), name='my-fees'),
    path('admin/pay/<int:fee_id>/', AdminFeeUpdateView.as_view(), name='admin-pay-fee'),
]
