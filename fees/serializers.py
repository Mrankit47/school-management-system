from rest_framework import serializers
from .models import FeeStructure, StudentFee

class FeeStructureSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeStructure
        fields = '__all__'

class StudentFeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentFee
        fields = '__all__'
