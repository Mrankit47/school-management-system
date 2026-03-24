from rest_framework import serializers
from .models import MainClass, MainSection, ClassSection

class MainClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = MainClass
        fields = '__all__'

class MainSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MainSection
        fields = '__all__'

class ClassSectionSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='class_ref.name', read_only=True)
    section_name = serializers.CharField(source='section_ref.name', read_only=True)

    class Meta:
        model = ClassSection
        fields = ['id', 'class_name', 'section_name', 'class_teacher']
