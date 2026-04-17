"""Service for bulk ID card generation on A4 pages in 2x5 grid."""
import os
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from django.conf import settings

# CR80 Standard Size
CARD_W = 85.60 * mm
CARD_H = 53.98 * mm

# A4 is 210 x 297 mm
PAGE_W, PAGE_H = A4

# Grid config
COLS = 2
ROWS = 5
CARDS_PER_PAGE = COLS * ROWS

# Gutters (spacing between cards)
GUTTER_X = 5 * mm
GUTTER_Y = 3 * mm

# Margins to center the grid
# Total Width = (COLS * CARD_W) + ((COLS-1) * GUTTER_X)
# Total Height = (ROWS * CARD_H) + ((ROWS-1) * GUTTER_Y)
TOTAL_W = (COLS * CARD_W) + ((COLS - 1) * GUTTER_X)
TOTAL_H = (ROWS * CARD_H) + ((ROWS - 1) * GUTTER_Y)

MARGIN_X = (PAGE_W - TOTAL_W) / 2
MARGIN_Y = (PAGE_H - TOTAL_H) / 2

def _draw_photo(canv, image_path, x, y, w, h):
    """Draws photo with object-fit: cover logic."""
    try:
        if not image_path or not os.path.exists(image_path):
            return
        ir = ImageReader(image_path)
        iw, ih = ir.getSize()
        scale = max(w / float(iw), h / float(ih))
        tw, th = iw * scale, ih * scale
        cx = x + (w - tw) / 2
        cy = y + (h - th) / 2
        
        canv.saveState()
        p = canv.beginPath()
        p.rect(x, y, w, h)
        canv.clipPath(p, stroke=0, fill=0)
        canv.drawImage(ir, cx, cy, width=tw, height=th, mask='auto')
        canv.restoreState()
    except Exception:
        pass

def draw_single_card(c, x, y, user_data, school_info):
    """Draws a single ID card at given (x, y) coordinates."""
    # Colors (Oceanic / Professional theme)
    navy = (0.10, 0.24, 0.48)
    gold = (0.99, 0.84, 0.28)
    body_bg = (0.98, 0.98, 0.97)
    
    # Card Background (instead of border, we use a subtle background fill or just the inner rects)
    # The user asked for NO border, but we still need a base if we want rounded corners for the design.
    # We'll draw the rounded rect with stroke=0
    c.setStrokeColorRGB(*navy)
    c.setLineWidth(0.8)
    c.roundRect(x, y, CARD_W, CARD_H, 2.5 * mm, stroke=0, fill=0)
    
    # Header Band
    header_h = 10 * mm
    c.setFillColorRGB(*gold)
    c.rect(x + 0.5*mm, y + CARD_H - header_h - 0.5*mm, CARD_W - 1*mm, header_h, stroke=0, fill=1)
    
    # School Name
    school_name = (school_info.get('name') or 'SCHOOL NAME')[:40]
    c.setFillColorRGB(0, 0, 0)
    c.setFont('Helvetica-Bold', 9)
    # Center text in header
    tw = c.stringWidth(school_name, 'Helvetica-Bold', 9)
    c.drawString(x + (CARD_W - tw) / 2, y + CARD_H - 6.5 * mm, school_name)
    
    # Body Area
    c.setFillColorRGB(*body_bg)
    c.rect(x + 0.5*mm, y + 0.5*mm, CARD_W - 1*mm, CARD_H - header_h - 1*mm, stroke=0, fill=1)
    
    # Photo Block
    photo_w = 20 * mm
    photo_h = 24 * mm
    px = x + CARD_W - photo_w - 3 * mm
    py = y + 4 * mm
    
    photo_path = user_data.get('photo_path')
    if photo_path:
        _draw_photo(c, photo_path, px, py, photo_w, photo_h)
    
    c.setStrokeColorRGB(0.8, 0.8, 0.8)
    c.setLineWidth(0.4)
    c.rect(px, py, photo_w, photo_h, stroke=1, fill=0)
    
    # User Details
    dx = x + 4 * mm
    dy = y + CARD_H - header_h - 5 * mm
    line_h = 3.5 * mm
    
    c.setFillColorRGB(0.1, 0.1, 0.1)
    c.setFont('Helvetica-Bold', 7.5)
    c.drawString(dx, dy, user_data.get('name', 'Name')[:25])
    dy -= line_h
    
    c.setFont('Helvetica', 6.5)
    c.setFillColorRGB(0.3, 0.3, 0.3)
    
    # Detail rows
    details = user_data.get('details', [])
    for label, value in details[:5]:
        c.setFont('Helvetica-Bold', 6)
        c.drawString(dx, dy, f"{label}:")
        c.setFont('Helvetica', 6)
        c.drawString(dx + 16*mm, dy, str(value)[:20])
        dy -= 3 * mm
    
    # Footer (School Address)
    addr = (school_info.get('address') or '')[:60]
    if addr:
        c.setFont('Helvetica', 5)
        c.setFillColorRGB(0.5, 0.5, 0.5)
        aw = c.stringWidth(addr, 'Helvetica', 5)
        c.drawString(x + (CARD_W - aw) / 2, y + 1.5 * mm, addr)

def generate_bulk_pdf(users_data, school_info):
    """Generates multi-page A4 PDF with 10 cards per page."""
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    
    total_users = len(users_data)
    for i, user in enumerate(users_data):
        # Calculate position on current page
        page_idx = i % CARDS_PER_PAGE
        col = page_idx % COLS
        row = page_idx // COLS # 0 to 4
        
        # In PDF coordinates, (0,0) is bottom-left
        # Grid layout: 
        # Row 0 is at top, Row 4 is at bottom
        # Y coordinate for row 'r' = PAGE_H - MARGIN_Y - ((r + 1) * CARD_H)
        x = MARGIN_X + (col * (CARD_W + GUTTER_X))
        y = PAGE_H - MARGIN_Y - (row * (CARD_H + GUTTER_Y)) - CARD_H
        
        draw_single_card(c, x, y, user, school_info)
        
        # If last card of the page and not the last card overall, showPage
        if (page_idx == CARDS_PER_PAGE - 1) and (i < total_users - 1):
            c.showPage()
            
    c.showPage()
    c.save()
    return buf.getvalue()
