"""Teacher ID card PDF — photo only if file exists on profile."""
from __future__ import annotations

from io import BytesIO

from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

from .models import TeacherProfile


def build_teacher_id_card_pdf(
    teacher: TeacherProfile,
    *,
    school_name: str,
    role_label: str,
) -> bytes:
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

    name = (teacher.user.name or teacher.user.username or 'Teacher')[:40]
    eid = (teacher.employee_id or '—')[:16]
    spec = (teacher.subject_specialization or '—')[:36]
    role = (role_label or 'Teacher')[:40]

    text_left = margin + 3 * mm
    photo_w, photo_h = 22 * mm, 28 * mm
    photo_x = w_pt - margin - 3 * mm - photo_w
    photo_y = margin + 5 * mm

    has_photo = bool(teacher.photo and teacher.photo.name)
    if has_photo:
        try:
            path = teacher.photo.path
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
    c.drawString(text_left, y, 'TEACHER ID CARD')
    y -= 4 * mm

    c.setFont('Helvetica-Bold', 8)
    c.drawString(text_left, y, 'Name:')
    c.setFont('Helvetica', 8)
    c.drawString(text_left + 18 * mm, y, name)
    y -= 3.5 * mm

    c.setFont('Helvetica-Bold', 8)
    c.drawString(text_left, y, 'Employee ID:')
    c.setFont('Helvetica', 8)
    c.drawString(text_left + 22 * mm, y, eid)
    y -= 3.5 * mm

    c.setFont('Helvetica-Bold', 8)
    c.drawString(text_left, y, 'Role:')
    c.setFont('Helvetica', 8)
    c.drawString(text_left + 18 * mm, y, role)
    y -= 3.5 * mm

    c.setFont('Helvetica-Bold', 8)
    c.drawString(text_left, y, 'Specialization:')
    c.setFont('Helvetica', 8)
    c.drawString(text_left + 28 * mm, y, spec)

    c.showPage()
    c.save()
    return buf.getvalue()
