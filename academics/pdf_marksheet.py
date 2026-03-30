from __future__ import annotations

from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


def _safe_float(v) -> float:
    try:
        return float(v)
    except Exception:
        return 0.0


def _pct_to_grade(pct: float) -> str:
    # Match the grade ladder used elsewhere in the project (A+/A/B/C/D/F).
    if pct >= 90:
        return 'A+'
    if pct >= 80:
        return 'A'
    if pct >= 70:
        return 'B'
    if pct >= 60:
        return 'C'
    if pct >= 50:
        return 'D'
    return 'F'


def build_student_marksheet_pdf(
    *,
    school_name: str,
    student_name: str,
    roll_number: str,
    class_label: str,
    academic_year: str,
    exam_type: str,
    declaration_date: str,
    total_obtained: float,
    total_max: float,
    percentage: float,
    overall_grade: str,
    final_result: str,
    subject_rows: list[dict],
    class_teacher_name: str,
    remarks: str,
) -> bytes:
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4

    x = 50
    y = height - 50

    # Header
    c.setFont('Helvetica-Bold', 16)
    c.drawString(x, y, school_name)
    y -= 18
    c.setFont('Helvetica-Bold', 13)
    c.drawString(x, y, 'Student Marksheet')
    y -= 26

    # Student info
    c.setFont('Helvetica', 10)
    c.drawString(x, y, f'Student Name: {student_name}')
    y -= 14
    c.drawString(x, y, f'Roll Number: {roll_number}')
    y -= 14
    c.drawString(x, y, f'Class / Section: {class_label}')
    y -= 14
    c.drawString(x, y, f'Academic Year: {academic_year}')
    y -= 14

    y -= 8
    c.setFont('Helvetica-Bold', 11)
    c.drawString(x, y, 'Exam Details')
    y -= 14
    c.setFont('Helvetica', 10)
    c.drawString(x, y, f'Exam Type: {exam_type}')
    y -= 14
    c.drawString(x, y, f'Declaration Date: {declaration_date}')
    y -= 18

    # Summary
    c.setFont('Helvetica-Bold', 11)
    c.drawString(x, y, 'Result Summary')
    y -= 14
    c.setFont('Helvetica', 10)
    c.drawString(x, y, f'Total Marks: {total_obtained:.2f} / {total_max:.2f}')
    y -= 14
    c.drawString(x, y, f'Percentage: {percentage:.2f}%')
    y -= 14
    c.drawString(x, y, f'Overall Grade: {overall_grade}')
    y -= 14
    c.drawString(x, y, f'Final Result: {final_result}')
    y -= 20

    # Subject table (simple text table)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(x, y, 'Subject-wise Marks')
    y -= 16

    c.setFont('Helvetica-Bold', 9)
    c.drawString(x, y, 'Subject')
    c.drawString(x + 250, y, 'Max')
    c.drawString(x + 330, y, 'Obt.')
    c.drawString(x + 410, y, 'Grade')
    c.drawString(x + 490, y, 'Result')
    y -= 12

    c.setFont('Helvetica', 9)
    for row in subject_rows:
        subject = str(row.get('subject', ''))[:28]
        max_marks = row.get('max_marks')
        obtained = row.get('marks')
        grade = row.get('grade') or '—'
        result = row.get('result') or '—'

        c.drawString(x, y, subject)
        c.drawString(x + 250, y, str(max_marks))
        c.drawString(x + 330, y, str(obtained if obtained is not None else '0'))
        c.drawString(x + 410, y, str(grade))
        c.drawString(x + 490, y, str(result)[:6])
        y -= 12
        if y < 120:
            c.showPage()
            y = height - 50
            c.setFont('Helvetica', 9)

    y -= 10
    # Teacher remarks
    c.setFont('Helvetica-Bold', 11)
    c.drawString(x, y, 'Teacher Remarks')
    y -= 14
    c.setFont('Helvetica', 10)
    c.drawString(x, y, f'Class Teacher: {class_teacher_name}')
    y -= 14
    c.drawString(x, y, f'Remarks: {remarks}')
    y -= 26

    # Signatures
    c.setFont('Helvetica', 10)
    c.drawString(x, y, 'Class Teacher Signature: ______________________')
    y -= 18
    c.drawString(x, y, 'Authorized Signature: __________________________')

    c.showPage()
    c.save()

    data = buf.getvalue()
    buf.close()
    return data

