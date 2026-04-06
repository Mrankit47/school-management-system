from django.db.models import Q

from .models import ClassSection


def teacher_teaches_class_section(teacher_profile, class_section) -> bool:
    """True if teacher is class teacher for this section or teaches any subject for its class (MainClass)."""
    if not teacher_profile or not class_section:
        return False
    if class_section.class_teacher_id == teacher_profile.id:
        return True
    from subjects.models import TeacherAssignment, Subject

    if TeacherAssignment.objects.filter(
        teacher_id=teacher_profile.id,
        class_ref_id=class_section.class_ref_id,
    ).exists():
        return True
    return Subject.objects.filter(
        class_ref_id=class_section.class_ref_id,
        teachers__id=teacher_profile.id,
        status='Active',
    ).exists()


def teacher_accessible_class_sections_queryset(teacher_profile, school):
    """ClassSection rows this teacher may use (attendance, students list, etc.)."""
    from subjects.models import TeacherAssignment, Subject

    class_ids = set(
        TeacherAssignment.objects.filter(teacher=teacher_profile).values_list('class_ref_id', flat=True)
    )
    class_ids.update(
        Subject.objects.filter(teachers=teacher_profile, status='Active').values_list('class_ref_id', flat=True)
    )

    q = Q(class_teacher=teacher_profile)
    if class_ids:
        q |= Q(class_ref_id__in=class_ids)

    qs = ClassSection.objects.select_related('class_ref', 'section_ref', 'class_teacher__user').filter(q)
    if school is not None:
        qs = qs.filter(school=school)
    return qs.order_by('class_ref__name', 'section_ref__name').distinct()


def teacher_user_ids_for_student_class_section(class_section) -> set:
    """User IDs of teachers linked to this section's class (class teacher + subject assignments)."""
    if not class_section:
        return set()
    from subjects.models import TeacherAssignment, Subject

    ids = set()
    if class_section.class_teacher_id and class_section.class_teacher:
        ids.add(class_section.class_teacher.user_id)
    for ta in TeacherAssignment.objects.filter(class_ref_id=class_section.class_ref_id).select_related(
        'teacher__user',
    ):
        ids.add(ta.teacher.user_id)
    for subj in Subject.objects.filter(class_ref_id=class_section.class_ref_id, status='Active').prefetch_related(
        'teachers',
    ):
        for t in subj.teachers.all():
            ids.add(t.user_id)
    return ids
