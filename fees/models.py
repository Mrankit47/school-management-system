from django.db import models

class FeeStructure(models.Model):
    class_ref = models.ForeignKey('classes.MainClass', on_delete=models.CASCADE, related_name='fee_structures')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.class_ref.name} - {self.amount}"

class StudentFee(models.Model):
    STATUS_CHOICES = (
        ('paid', 'Paid'),
        ('pending', 'Pending'),
        ('partial', 'Partial'),
    )

    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='fees')
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.CASCADE)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    due_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    last_payment_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.student.user.username} - {self.status}"
