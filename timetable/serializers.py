from rest_framework import serializers
from .models import TimeTableEntry

class TimeTableEntrySerializer(serializers.ModelSerializer):
    teacher_name = serializers.ReadOnlyField(source='teacher.name')
    day_display = serializers.CharField(source='get_day_display', read_only=True)
    start_time_display = serializers.SerializerMethodField()
    end_time_display = serializers.SerializerMethodField()

    class Meta:
        model = TimeTableEntry
        fields = [
            'id', 'class_name', 'section', 'subject', 'teacher', 
            'teacher_name', 'day', 'day_display', 'shift',
            'period', 'period_number', 'start_time', 'end_time',
            'start_time_display', 'end_time_display', 'room'
        ]
        read_only_fields = ['start_time', 'end_time']

    def get_start_time_display(self, obj):
        if obj.start_time:
            return obj.start_time.strftime("%I:%M %p")
        return ""

    def get_end_time_display(self, obj):
        if obj.end_time:
            return obj.end_time.strftime("%I:%M %p")
        return ""
