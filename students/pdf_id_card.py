"""Single-page student ID card PDF (photo only if file exists on profile)."""
from __future__ import annotations

from io import BytesIO

from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

from .models import StudentProfile


def build_student_id_card_pdf(student: StudentProfile, *, school_name: str) -> bytes:
    """Portrait ID layout; includes photo area only when student.photo is set and readable."""
    w_pt, h_pt = 90 * mm, 55 * mm
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=(w_pt, h_pt))

    margin = 4 * mm
    c.setStrokeColorRGB(0.15, 0.35, 0.65)
    c.setLineWidth(1.2)
    c.roundRect(margin, margin, w_pt - 2 * margin, h_pt - 2 * margin, 6, stroke=1, fill=0)

    y = h_pt - margin - 5 * mm
    c.setFillColorRGB(0.1, 0.2, 0.45)
    c.setFont('Helvetica-Bold', 11)
    title = (school_name or 'School')[:48]
    c.drawCentredString(w_pt / 2, y, title)
    y -= 5 * mm

    name = (student.user.name or student.user.username or 'Student')[:40]
    admission = (student.admission_number or '—')[:24]
    if student.class_section_id:
        cls_label = f"{student.class_section.class_ref.name} - {student.class_section.section_ref.name}"
    else:
        cls_label = 'N/A'
    cls_label = cls_label[:32]

    text_left = margin + 3 * mm
    photo_w, photo_h = 22 * mm, 28 * mm
    photo_x = w_pt - margin - 3 * mm - photo_w
    photo_y = margin + 5 * mm

    has_photo = bool(student.photo and student.photo.name)
    if has_photo:
        try:
            path = student.photo.path
            c.drawImage(
                ImageReader(path),
                photo_x,
                photo_y,
                width=photo_w,
                height=photo_h,
                preserveAspectRatio=True,
                mask='auto',
            )
        except Exception:
            has_photo = False

    c.setFont('Helvetica-Bold', 9)
    c.setFillColorRGB(0.05, 0.05, 0.05)
    c.drawString(text_left, y, 'STUDENT ID CARD')
    y -= 4 * mm

    c.setFont('Helvetica-Bold', 8)
    c.drawString(text_left, y, 'Name:')
    c.setFont('Helvetica', 8)
    c.drawString(text_left + 18 * mm, y, name)
    y -= 3.5 * mm

    c.setFont('Helvetica-Bold', 8)
    c.drawString(text_left, y, 'Admission:')
    c.setFont('Helvetica', 8)
    c.drawString(text_left + 18 * mm, y, admission)
    y -= 3.5 * mm

    c.setFont('Helvetica-Bold', 8)
    c.drawString(text_left, y, 'Class:')
    c.setFont('Helvetica', 8)
    c.drawString(text_left + 18 * mm, y, cls_label)
    y -= 3.5 * mm

    if student.dob:
        c.setFont('Helvetica-Bold', 8)
        c.drawString(text_left, y, 'DOB:')
        c.setFont('Helvetica', 8)
        c.drawString(text_left + 18 * mm, y, str(student.dob))

    c.showPage()
    c.save()
    return buf.getvalue()
