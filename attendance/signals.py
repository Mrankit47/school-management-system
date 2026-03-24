from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Attendance
from communication.models import Notification

@receiver(post_save, sender=Attendance)
def notify_student_on_attendance(sender, instance, created, **kwargs):
    """
    Auto-create a notification for the student whenever attendance is marked or updated.
    """
    student_user = instance.student.user
    status = instance.get_status_display()
    
    title = f"Attendance Marked: {status}"
    message = f"Your attendance for {instance.date} has been marked as {status}."
    
    # We create a targeted notification for this specific student user
    Notification.objects.create(
        user=student_user,
        title=title,
        message=message
    )
