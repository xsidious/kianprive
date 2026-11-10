"""Generate a plain-language KIAN system overview PDF with flow diagrams."""
from __future__ import annotations

from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Flowable,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUT = Path(r"C:\Users\FindMeAnywhere\Desktop\KIAN_System_Overview_Orders_and_Intake.pdf")

NAVY = colors.HexColor("#143a54")
GOLD = colors.HexColor("#8a682e")
CREAM = colors.HexColor("#f8f4ee")
INK = colors.HexColor("#1f1a15")
MUTED = colors.HexColor("#5f5344")
LINE = colors.HexColor("#d4cfc6")
BOX_FILL = colors.HexColor("#fffaf2")
ARROW = colors.HexColor("#8a682e")


def styles():
    base = getSampleStyleSheet()
    return {
        "cover_title": ParagraphStyle(
            "cover_title",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=30,
            textColor=NAVY,
            alignment=TA_CENTER,
            spaceAfter=10,
        ),
        "cover_sub": ParagraphStyle(
            "cover_sub",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=11,
            leading=15,
            textColor=MUTED,
            alignment=TA_CENTER,
            spaceAfter=6,
        ),
        "h1": ParagraphStyle(
            "h1",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=19,
            textColor=NAVY,
            spaceBefore=14,
            spaceAfter=8,
        ),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=11.5,
            leading=15,
            textColor=GOLD,
            spaceBefore=10,
            spaceAfter=5,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=INK,
            alignment=TA_LEFT,
            spaceAfter=7,
        ),
        "caption": ParagraphStyle(
            "caption",
            parent=base["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=8.5,
            leading=11,
            textColor=MUTED,
            alignment=TA_CENTER,
            spaceBefore=4,
            spaceAfter=10,
        ),
        "cell": ParagraphStyle(
            "cell",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=11,
            textColor=INK,
        ),
        "cell_bold": ParagraphStyle(
            "cell_bold",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8.5,
            leading=11,
            textColor=NAVY,
        ),
    }


class FlowDiagram(Flowable):
    """Horizontal boxes with arrows — plain-language process map."""

    def __init__(self, steps: list[str], width: float, box_h: float = 42):
        super().__init__()
        self.steps = steps
        self.box_h = box_h
        self._width = width
        n = len(steps)
        gap = 18
        self.box_w = (width - gap * (n - 1)) / n
        self.height = box_h + 4

    def wrap(self, availWidth, availHeight):
        return self._width, self.height

    def draw(self):
        c = self.canv
        y = 2
        for i, label in enumerate(self.steps):
            x = i * (self.box_w + 18)
            c.setFillColor(BOX_FILL)
            c.setStrokeColor(NAVY)
            c.setLineWidth(1)
            c.roundRect(x, y, self.box_w, self.box_h, 4, fill=1, stroke=1)

            # wrap label into up to 3 lines
            words = label.split()
            lines: list[str] = []
            cur = ""
            for w in words:
                trial = f"{cur} {w}".strip()
                if c.stringWidth(trial, "Helvetica", 7.5) <= self.box_w - 10:
                    cur = trial
                else:
                    if cur:
                        lines.append(cur)
                    cur = w
            if cur:
                lines.append(cur)
            lines = lines[:3]

            c.setFillColor(INK)
            c.setFont("Helvetica", 7.5)
            total_h = len(lines) * 9
            ty = y + (self.box_h + total_h) / 2 - 7
            for line in lines:
                c.drawCentredString(x + self.box_w / 2, ty, line)
                ty -= 9

            if i < len(self.steps) - 1:
                ax0 = x + self.box_w + 2
                ax1 = x + self.box_w + 16
                mid = y + self.box_h / 2
                c.setStrokeColor(ARROW)
                c.setFillColor(ARROW)
                c.setLineWidth(1.4)
                c.line(ax0, mid, ax1 - 3, mid)
                path = c.beginPath()
                path.moveTo(ax1, mid)
                path.lineTo(ax1 - 5, mid + 3.5)
                path.lineTo(ax1 - 5, mid - 3.5)
                path.close()
                c.drawPath(path, fill=1, stroke=0)


class VerticalFlow(Flowable):
    """Stacked boxes with down arrows for longer explanations."""

    def __init__(self, steps: list[tuple[str, str]], width: float):
        super().__init__()
        self.steps = steps
        self._width = width
        self.row_h = 36
        self.gap = 16
        self.height = len(steps) * self.row_h + (len(steps) - 1) * self.gap

    def wrap(self, availWidth, availHeight):
        return self._width, self.height

    def draw(self):
        c = self.canv
        for i, (title, detail) in enumerate(self.steps):
            y = self.height - (i + 1) * self.row_h - i * self.gap
            c.setFillColor(BOX_FILL)
            c.setStrokeColor(NAVY)
            c.setLineWidth(1)
            c.roundRect(0, y, self._width, self.row_h, 4, fill=1, stroke=1)
            c.setFillColor(NAVY)
            c.setFont("Helvetica-Bold", 8.5)
            c.drawString(10, y + self.row_h - 14, title)
            c.setFillColor(MUTED)
            c.setFont("Helvetica", 7.5)
            c.drawString(10, y + 8, detail)

            if i < len(self.steps) - 1:
                mid_x = self._width / 2
                top = y - 2
                bot = y - self.gap + 2
                c.setStrokeColor(ARROW)
                c.setFillColor(ARROW)
                c.setLineWidth(1.3)
                c.line(mid_x, top, mid_x, bot + 4)
                path = c.beginPath()
                path.moveTo(mid_x, bot)
                path.lineTo(mid_x - 3.5, bot + 5)
                path.lineTo(mid_x + 3.5, bot + 5)
                path.close()
                c.drawPath(path, fill=1, stroke=0)


class SitesMap(Flowable):
    """Three site boxes with connection labels."""

    def __init__(self, width: float):
        super().__init__()
        self._width = width
        self.height = 118

    def wrap(self, availWidth, availHeight):
        return self._width, self.height

    def draw(self):
        c = self.canv
        boxes = [
            (0.0, "KIAN Privé", "Main hub", "Bookings · intakes · shop\npayments · staff portals"),
            (0.35, "Threefold", "Partner clinic site", "Local forms & booking\nsend patients into KIAN"),
            (0.70, "Wellness Tech", "Pharmacy / wholesale", "Receives paid Rx orders\nsends to RxHere / RxCore"),
        ]
        bw = self._width * 0.28
        for frac, title, role, blurb in boxes:
            x = self._width * frac
            c.setFillColor(CREAM)
            c.setStrokeColor(NAVY)
            c.roundRect(x, 38, bw, 76, 5, fill=1, stroke=1)
            c.setFillColor(NAVY)
            c.setFont("Helvetica-Bold", 9)
            c.drawCentredString(x + bw / 2, 98, title)
            c.setFillColor(GOLD)
            c.setFont("Helvetica", 7.5)
            c.drawCentredString(x + bw / 2, 86, role)
            c.setFillColor(INK)
            c.setFont("Helvetica", 7)
            for j, line in enumerate(blurb.split("\n")):
                c.drawCentredString(x + bw / 2, 70 - j * 10, line)

        # arrows under boxes
        c.setStrokeColor(ARROW)
        c.setFillColor(ARROW)
        c.setFont("Helvetica", 7)
        # Threefold -> KIAN
        c.line(self._width * 0.35, 28, self._width * 0.28, 28)
        c.drawCentredString(self._width * 0.315, 16, "intakes →")
        # KIAN -> WT
        c.line(self._width * 0.28, 28, self._width * 0.70, 28)
        c.drawString(self._width * 0.40, 16, "paid Rx orders →")


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(0.7 * inch, letter[1] - 0.5 * inch, letter[0] - 0.7 * inch, letter[1] - 0.5 * inch)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(0.7 * inch, letter[1] - 0.4 * inch, "KIAN Privé · How the system works")
    canvas.drawRightString(letter[0] - 0.7 * inch, letter[1] - 0.4 * inch, date.today().isoformat())
    canvas.line(0.7 * inch, 0.5 * inch, letter[0] - 0.7 * inch, 0.5 * inch)
    canvas.drawCentredString(letter[0] / 2, 0.35 * inch, f"Page {doc.page}")
    canvas.restoreState()


def simple_table(rows, col_widths, s):
    data = []
    for i, row in enumerate(rows):
        style = s["cell_bold"] if i == 0 else s["cell"]
        data.append([Paragraph(str(c), style) for c in row])
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), CREAM),
                ("GRID", (0, 0), (-1, -1), 0.4, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#fcfaf6")]),
            ]
        )
    )
    return t


def build():
    s = styles()
    story = []
    content_w = 7.1 * inch

    # Cover
    story.append(Spacer(1, 1.4 * inch))
    story.append(Paragraph("How KIAN Works", s["cover_title"]))
    story.append(Paragraph("A simple picture of booking, intakes, and orders", s["cover_sub"]))
    story.append(Spacer(1, 0.15 * inch))
    story.append(
        Paragraph(
            f"Plain-language overview · {date.today().strftime('%B %d, %Y')}",
            s["cover_sub"],
        )
    )
    story.append(Spacer(1, 0.45 * inch))
    story.append(
        Paragraph(
            "This short guide shows how patients book services, how clinic forms become therapy "
            "orders, and how paid prescriptions move to the pharmacy. Written for owners and staff — "
            "not engineers.",
            s["body"],
        )
    )
    story.append(PageBreak())

    # 1. Big picture
    story.append(Paragraph("1. The big picture", s["h1"]))
    story.append(
        Paragraph(
            "Think of three connected websites. <b>KIAN</b> is the main clinic hub. "
            "<b>Threefold</b> (and similar partner sites) send patients into KIAN. "
            "<b>Wellness Tech</b> handles pharmacy fulfillment after someone pays.",
            s["body"],
        )
    )
    story.append(SitesMap(content_w))
    story.append(Paragraph("Figure 1 — Three sites and how they connect", s["caption"]))

    story.append(
        Paragraph(
            "<b>In one sentence:</b> Patients book or fill a form → staff reviews → a therapy "
            "or product order is created → the patient pays on KIAN → Wellness Tech sends the "
            "prescription to the pharmacy.",
            s["body"],
        )
    )

    story.append(Paragraph("Who uses what", s["h2"]))
    story.append(
        simple_table(
            [
                ["Person", "What they do"],
                ["Patient / guest", "Browse the site, book, fill intake forms, pay, track status"],
                ["Approved member", "Same as above, plus see prices and shop freely"],
                ["Provider", "Review intakes, build therapy plans, send pay links"],
                ["Partner clinic", "Book clients, send intakes from their own site into KIAN"],
                ["Admin", "Oversee intakes, orders, products, and fulfillment"],
            ],
            [1.6 * inch, 5.5 * inch],
            s,
        )
    )

    # 2. Booking
    story.append(Paragraph("2. Where people book services", s["h1"]))
    story.append(
        Paragraph(
            "Most appointments start on KIAN’s <b>Book Online</b> page. Partners can also book "
            "from their portal. Some partner websites collect interest first, then hand the "
            "patient to KIAN for clinical follow-up and payment.",
            s["body"],
        )
    )
    story.append(
        FlowDiagram(
            ["Visit site / services", "Book Online or partner form", "Staff notified", "Appointment confirmed"],
            content_w,
        )
    )
    story.append(Paragraph("Figure 2 — Booking flow", s["caption"]))
    story.append(
        Paragraph(
            "Service menus (IVs, Icoone, labs, etc.) live under <b>Services</b>. "
            "Dollar amounts stay hidden until someone is signed in with an approved membership. "
            "Guests still see what is offered — just not the prices.",
            s["body"],
        )
    )

    # 3. Intake
    story.append(Paragraph("3. Intake forms (getting clinical info)", s["h1"]))
    story.append(
        Paragraph(
            "When a treatment needs medical review (peptides/GLP, Celexo, Icoone, wellness hub, "
            "or a partner clinic form), the patient fills an intake. That creates a chart in KIAN "
            "with a tracking code like <b>KP-XXXX-XXXX</b>.",
            s["body"],
        )
    )
    story.append(
        FlowDiagram(
            ["Patient fills form", "Saved in KIAN", "Staff / provider reviews", "Therapy plan sent"],
            content_w,
        )
    )
    story.append(Paragraph("Figure 3 — Intake → therapy plan", s["caption"]))

    story.append(Paragraph("Common intake doors", s["h2"]))
    story.append(
        simple_table(
            [
                ["Form", "Where it starts", "Notes"],
                ["Peptides / GLP", "KIAN intake page", "Often charges a review fee up front"],
                ["Celexo / Icoone", "KIAN intake pages", "No fee at submit"],
                ["Wellness Hub", "Privé Therapeutics site", "Lands in KIAN for clinical work"],
                ["Partner clinics", "Threefold / Facial Design / 4everglow", "Forwarded into KIAN"],
            ],
            [1.5 * inch, 2.4 * inch, 3.2 * inch],
            s,
        )
    )
    story.append(
        Paragraph(
            "Patients can check progress anytime at <b>Track Intake</b> with their email and "
            "reference code — no login required.",
            s["body"],
        )
    )

    story.append(PageBreak())

    # 4. Provider orders
    story.append(Paragraph("4. How provider orders are processed", s["h1"]))
    story.append(
        Paragraph(
            "This is the heart of the clinical commerce loop. A provider (or admin) builds a "
            "therapy proposal from the intake, the patient pays on KIAN, then the order is "
            "handed to Wellness Tech for pharmacy fulfillment.",
            s["body"],
        )
    )
    story.append(
        VerticalFlow(
            [
                ("1. Provider builds therapy", "Pick compounds / products from the clinical catalog"),
                ("2. Pay link goes to patient", "Email + member dashboard + /pay/… link"),
                ("3. Patient pays on KIAN", "Card charged with Authorize.net"),
                ("4. KIAN marks order paid", "Commissions and partner notifications fire"),
                ("5. Order sent to Wellness Tech", "Includes chart details needed for the pharmacy"),
                ("6. Pharmacy fulfills (RxHere)", "Status updates flow back toward KIAN / partners"),
            ],
            content_w,
        )
    )
    story.append(Paragraph("Figure 4 — Provider therapy order lifecycle", s["caption"]))

    story.append(
        Paragraph(
            "<b>Important:</b> The patient always pays on KIAN. Wellness Tech does not collect "
            "that card payment again — it receives a paid purchase order to fulfill.",
            s["body"],
        )
    )

    # 5. Retail shop
    story.append(Paragraph("5. Retail shop orders (simpler path)", s["h1"]))
    story.append(
        Paragraph(
            "Everyday products (skincare, Wild Cherry hair care, supplies) go through the shop "
            "cart. No clinical intake is required.",
            s["body"],
        )
    )
    story.append(
        FlowDiagram(
            ["Browse shop", "Add to cart", "Checkout + pay", "Fulfill / ship"],
            content_w,
        )
    )
    story.append(Paragraph("Figure 5 — Retail shop flow", s["caption"]))
    story.append(
        Paragraph(
            "Shop and therapy card payments use <b>Authorize.net</b>. Membership subscriptions "
            "use <b>Stripe</b>. Prices in the shop follow the same rule: visible after sign-in "
            "with an approved membership.",
            s["body"],
        )
    )

    # 6. Gates
    story.append(Paragraph("6. Current gates (why some things are hidden)", s["h1"]))
    story.append(
        simple_table(
            [
                ["Gate", "What it means in practice"],
                ["Member pricing", "Guests see “Sign in to view pricing”; approved members see dollars"],
                ["Peptides category", "Physician-ordered; members track shipments in My Orders"],
                ["WT practice tiers", "Wellness Tech wholesale prices unlock after clinic verification"],
                ["Email preferences", "Patients can opt out of marketing; transactional mail still sends"],
            ],
            [1.7 * inch, 5.4 * inch],
            s,
        )
    )

    # 7. Cheat sheet
    story.append(Paragraph("7. Quick cheat sheet", s["h1"]))
    story.append(
        simple_table(
            [
                ["Question", "Short answer"],
                ["Where do people book?", "KIAN Book Online, or a partner site that feeds into KIAN"],
                ["Where do clinical forms go?", "Always into KIAN’s intake inbox"],
                ["Who creates the Rx order?", "Provider / admin from the intake chart"],
                ["Where does the patient pay?", "Always on KIAN (pay link or shop checkout)"],
                ["Who fills the pharmacy order?", "Wellness Tech → RxHere / RxCore"],
                ["Can partners see status?", "Yes — KIAN notifies partner sites when therapy is owed or paid"],
            ],
            [2.2 * inch, 4.9 * inch],
            s,
        )
    )

    story.append(Spacer(1, 0.25 * inch))
    story.append(
        Paragraph(
            "If you only remember one diagram, remember Figure 4: "
            "<b>Intake → therapy plan → pay on KIAN → Wellness Tech → pharmacy</b>.",
            s["body"],
        )
    )

    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=letter,
        leftMargin=0.7 * inch,
        rightMargin=0.7 * inch,
        topMargin=0.7 * inch,
        bottomMargin=0.7 * inch,
        title="How KIAN Works",
        author="KIAN Privé",
    )
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    build()
