"""Target architecture PDF: Wellness Hub as the central operating system."""
from __future__ import annotations

from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Flowable, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

OUT = Path(r"C:\Users\FindMeAnywhere\Desktop\Wellness_Hub_Central_Architecture_Plan.pdf")

NAVY = colors.HexColor("#143a54")
GOLD = colors.HexColor("#8a682e")
CREAM = colors.HexColor("#f8f4ee")
INK = colors.HexColor("#1f1a15")
MUTED = colors.HexColor("#5f5344")
LINE = colors.HexColor("#d4cfc6")
BOX = colors.HexColor("#fffaf2")
HUB = colors.HexColor("#1a4d6d")
GREEN = colors.HexColor("#2e6b4f")
ARROW = GOLD


def styles():
    base = getSampleStyleSheet()
    return {
        "cover": ParagraphStyle(
            "cover", parent=base["Title"], fontName="Helvetica-Bold", fontSize=22, leading=28,
            textColor=NAVY, alignment=TA_CENTER, spaceAfter=8,
        ),
        "sub": ParagraphStyle(
            "sub", parent=base["Normal"], fontName="Helvetica", fontSize=11, leading=15,
            textColor=MUTED, alignment=TA_CENTER, spaceAfter=6,
        ),
        "h1": ParagraphStyle(
            "h1", parent=base["Heading1"], fontName="Helvetica-Bold", fontSize=14, leading=18,
            textColor=NAVY, spaceBefore=12, spaceAfter=7,
        ),
        "h2": ParagraphStyle(
            "h2", parent=base["Heading2"], fontName="Helvetica-Bold", fontSize=11, leading=14,
            textColor=GOLD, spaceBefore=9, spaceAfter=5,
        ),
        "body": ParagraphStyle(
            "body", parent=base["Normal"], fontName="Helvetica", fontSize=9.5, leading=13,
            textColor=INK, alignment=TA_LEFT, spaceAfter=6,
        ),
        "caption": ParagraphStyle(
            "caption", parent=base["Normal"], fontName="Helvetica-Oblique", fontSize=8,
            leading=10, textColor=MUTED, alignment=TA_CENTER, spaceBefore=3, spaceAfter=8,
        ),
        "cell": ParagraphStyle(
            "cell", parent=base["Normal"], fontName="Helvetica", fontSize=8, leading=10.5, textColor=INK,
        ),
        "cell_b": ParagraphStyle(
            "cell_b", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=8, leading=10.5, textColor=NAVY,
        ),
        "callout": ParagraphStyle(
            "callout", parent=base["Normal"], fontName="Helvetica", fontSize=9.5, leading=13,
            textColor=INK, alignment=TA_LEFT, spaceAfter=8, leftIndent=4, rightIndent=4,
        ),
    }


class HubDiagram(Flowable):
    """Partner sites → Wellness Hub → Pharmacy."""

    def __init__(self, width: float):
        super().__init__()
        self._w = width
        self.height = 210

    def wrap(self, aw, ah):
        return self._w, self.height

    def draw(self):
        c = self.canv
        # Partner row
        partners = [
            "KIAN Privé",
            "Threefold\nStrength",
            "4everglow",
            "Facial Design",
            "Other\npartner sites",
        ]
        n = len(partners)
        gap = 8
        bw = (self._w - gap * (n - 1)) / n
        y_top = self.height - 52
        for i, name in enumerate(partners):
            x = i * (bw + gap)
            c.setFillColor(BOX)
            c.setStrokeColor(NAVY)
            c.roundRect(x, y_top, bw, 44, 4, fill=1, stroke=1)
            c.setFillColor(INK)
            c.setFont("Helvetica", 7)
            lines = name.split("\n")
            for j, line in enumerate(lines):
                c.drawCentredString(x + bw / 2, y_top + 28 - j * 10, line)

        # Arrows down to hub
        c.setStrokeColor(ARROW)
        c.setFillColor(ARROW)
        hub_y = 88
        hub_h = 56
        for i in range(n):
            x = i * (bw + gap) + bw / 2
            c.line(x, y_top - 2, self._w / 2, hub_y + hub_h + 2)

        # Hub box
        c.setFillColor(HUB)
        c.setStrokeColor(HUB)
        c.roundRect(self._w * 0.18, hub_y, self._w * 0.64, hub_h, 6, fill=1, stroke=1)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 11)
        c.drawCentredString(self._w / 2, hub_y + 34, "WELLNESS HUB  (central system)")
        c.setFont("Helvetica", 7.5)
        c.drawCentredString(self._w / 2, hub_y + 18, "Intakes · Orders · Payments · Providers · Catalog · Status")
        c.drawCentredString(self._w / 2, hub_y + 7, "One brain for every partner brand")

        # Arrow to pharmacy
        c.setStrokeColor(ARROW)
        c.setFillColor(ARROW)
        c.setLineWidth(1.4)
        mid = self._w / 2
        c.line(mid, hub_y - 2, mid, 46)
        path = c.beginPath()
        path.moveTo(mid, 40)
        path.lineTo(mid - 4, 47)
        path.lineTo(mid + 4, 47)
        path.close()
        c.drawPath(path, fill=1, stroke=0)

        # Pharmacy
        c.setFillColor(GREEN)
        c.roundRect(self._w * 0.22, 8, self._w * 0.56, 30, 5, fill=1, stroke=0)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(mid, 22, "Partner Pharmacy  (RxHere / RxCore)")
        c.setFont("Helvetica", 7)
        c.drawCentredString(mid, 12, "Fulfills compounds at wholesale · ships to patient / clinic")


class MoneyFlow(Flowable):
    def __init__(self, width: float):
        super().__init__()
        self._w = width
        self.height = 128

    def wrap(self, aw, ah):
        return self._w, self.height

    def draw(self):
        c = self.canv
        steps = [
            ("1. Patient pays", "Full retail price\non Wellness Hub"),
            ("2. Hub keeps margin", "Retail − wholesale\n− fees − partner share"),
            ("3. Hub owes pharmacy", "Wholesale cost\nfrom price sheet"),
            ("4. Pay RxHere", "ACH / PO settlement\nat wholesale"),
        ]
        n = len(steps)
        gap = 14
        bw = (self._w - gap * (n - 1)) / n
        for i, (t, d) in enumerate(steps):
            x = i * (bw + gap)
            c.setFillColor(BOX)
            c.setStrokeColor(NAVY)
            c.roundRect(x, 28, bw, 88, 4, fill=1, stroke=1)
            c.setFillColor(NAVY)
            c.setFont("Helvetica-Bold", 8)
            c.drawCentredString(x + bw / 2, 98, t)
            c.setFillColor(MUTED)
            c.setFont("Helvetica", 7)
            for j, line in enumerate(d.split("\n")):
                c.drawCentredString(x + bw / 2, 78 - j * 11, line)
            if i < n - 1:
                ax0 = x + bw + 2
                ax1 = x + bw + gap - 2
                mid = 72
                c.setStrokeColor(ARROW)
                c.setFillColor(ARROW)
                c.line(ax0, mid, ax1 - 3, mid)
                path = c.beginPath()
                path.moveTo(ax1, mid)
                path.lineTo(ax1 - 5, mid + 3)
                path.lineTo(ax1 - 5, mid - 3)
                path.close()
                c.drawPath(path, fill=1, stroke=0)
        c.setFillColor(MUTED)
        c.setFont("Helvetica-Oblique", 7.5)
        c.drawCentredString(self._w / 2, 10, "Patient never pays the pharmacy directly. Hub is the merchant of record.")


class VerticalSteps(Flowable):
    def __init__(self, steps: list[tuple[str, str]], width: float):
        super().__init__()
        self.steps = steps
        self._w = width
        self.row = 34
        self.gap = 12
        self.height = len(steps) * self.row + (len(steps) - 1) * self.gap

    def wrap(self, aw, ah):
        return self._w, self.height

    def draw(self):
        c = self.canv
        for i, (title, detail) in enumerate(self.steps):
            y = self.height - (i + 1) * self.row - i * self.gap
            c.setFillColor(BOX)
            c.setStrokeColor(NAVY)
            c.roundRect(0, y, self._w, self.row, 4, fill=1, stroke=1)
            c.setFillColor(NAVY)
            c.setFont("Helvetica-Bold", 8)
            c.drawString(10, y + self.row - 13, title)
            c.setFillColor(MUTED)
            c.setFont("Helvetica", 7)
            c.drawString(10, y + 8, detail)
            if i < len(self.steps) - 1:
                mid = self._w / 2
                c.setStrokeColor(ARROW)
                c.setFillColor(ARROW)
                c.line(mid, y - 1, mid, y - self.gap + 4)
                path = c.beginPath()
                path.moveTo(mid, y - self.gap + 1)
                path.lineTo(mid - 3.5, y - self.gap + 6)
                path.lineTo(mid + 3.5, y - self.gap + 6)
                path.close()
                c.drawPath(path, fill=1, stroke=0)


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(0.65 * inch, letter[1] - 0.48 * inch, letter[0] - 0.65 * inch, letter[1] - 0.48 * inch)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(0.65 * inch, letter[1] - 0.38 * inch, "Wellness Hub · Target architecture (for confirmation)")
    canvas.drawRightString(letter[0] - 0.65 * inch, letter[1] - 0.38 * inch, date.today().isoformat())
    canvas.line(0.65 * inch, 0.48 * inch, letter[0] - 0.65 * inch, 0.48 * inch)
    canvas.drawCentredString(letter[0] / 2, 0.32 * inch, f"Page {doc.page}")
    canvas.restoreState()


def table(rows, widths, s):
    data = [[Paragraph(str(c), s["cell_b"] if i == 0 else s["cell"]) for c in row] for i, row in enumerate(rows)]
    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), CREAM),
                ("GRID", (0, 0), (-1, -1), 0.4, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#fcfaf6")]),
            ]
        )
    )
    return t


def callout_box(text: str, s):
    inner = Paragraph(text, s["callout"])
    t = Table([[inner]], colWidths=[7.2 * inch])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), CREAM),
                ("BOX", (0, 0), (-1, -1), 1, GOLD),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return t


def build():
    s = styles()
    story = []
    w = 7.2 * inch

    story.append(Spacer(1, 1.1 * inch))
    story.append(Paragraph("Wellness Hub", s["cover"]))
    story.append(Paragraph("Central Operating System — Target Architecture", s["cover"]))
    story.append(Spacer(1, 0.12 * inch))
    story.append(
        Paragraph(
            "How partner websites, providers, and pharmacies should connect<br/>"
            "so one hub runs intakes, payments, fulfillment, and wholesale settlement.",
            s["sub"],
        )
    )
    story.append(Paragraph(f"Draft for confirmation · {date.today().strftime('%B %d, %Y')}", s["sub"]))
    story.append(Spacer(1, 0.35 * inch))
    story.append(
        callout_box(
            "<b>Goal in one sentence:</b> Every partner brand (KIAN Privé, Threefold Strength, "
            "4everglow, Facial Design, and others) sends patients and orders into <b>Wellness Hub</b>. "
            "Wellness Hub is the only system that takes payment, owns the clinical chart, and pays "
            "the partner pharmacy (RxHere) at wholesale.",
            s,
        )
    )
    story.append(PageBreak())

    # 1 Vision
    story.append(Paragraph("1. The big idea", s["h1"]))
    story.append(
        Paragraph(
            "Today, too much of the “brain” still lives on KIAN Privé while partner sites and "
            "Privé Therapeutics/Wellness Hub branding overlap. The target model is clearer:",
            s["body"],
        )
    )
    story.append(
        table(
            [
                ["Layer", "Job"],
                ["Partner websites", "Brand + marketing + local booking UI. Capture interest. Do NOT charge for Rx."],
                ["Partner providers", "Review charts and build therapy plans inside Wellness Hub (or via Hub API)."],
                ["Wellness Hub", "Central system: intakes, orders, payments, catalog, status, commissions."],
                ["Partner pharmacy (RxHere)", "Compound and ship. Paid by Hub at wholesale after the order is funded."],
            ],
            [1.7 * inch, 5.5 * inch],
            s,
        )
    )
    story.append(Spacer(1, 0.15 * inch))
    story.append(HubDiagram(w))
    story.append(Paragraph("Figure 1 — Partner brands feed one hub; hub fulfills through pharmacy", s["caption"]))

    story.append(Paragraph("2. What each partner website does", s["h1"]))
    story.append(
        Paragraph(
            "KIAN, Threefold, 4everglow, and others stay beautiful front doors. They do not become "
            "mini pharmacies. They collect the patient, then hand work to Wellness Hub.",
            s["body"],
        )
    )
    story.append(
        table(
            [
                ["Partner site", "Keeps on its own site", "Sends to Wellness Hub"],
                ["KIAN Privé", "Brand pages, Icoone booking UI, retail merchandising", "Clinical intakes, therapy orders, Rx checkout"],
                ["Threefold Strength", "Local marketing + booking forms", "Intake payload + patient identity"],
                ["4everglow", "Brand experience + intake forms", "Intake payload + status display"],
                ["Facial Design / others", "Same pattern", "Same Hub APIs + webhooks"],
            ],
            [1.4 * inch, 2.7 * inch, 3.1 * inch],
            s,
        )
    )
    story.append(
        Paragraph(
            "<b>How linking works (technically simple):</b> each partner gets a <b>site ID</b> and a "
            "<b>shared secret</b>. Their form posts to Wellness Hub "
            "<font face='Courier' size='8'>POST /api/v1/intakes</font>. "
            "Hub replies with a tracking code and later pushes status to "
            "<font face='Courier' size='8'>POST {partner}/api/wellness-hub/webhook</font>.",
            s["body"],
        )
    )

    story.append(PageBreak())

    # 3 Order lifecycle
    story.append(Paragraph("3. Perfect order path (clinical / Rx)", s["h1"]))
    story.append(
        VerticalSteps(
            [
                ("A. Patient starts on a partner site", "KIAN / Threefold / 4everglow / etc. — branded experience"),
                ("B. Intake lands in Wellness Hub", "One chart, one KP tracking code, tagged with partner site ID"),
                ("C. Partner provider reviews in Hub", "Builds therapy proposal from the shared formulary"),
                ("D. Patient pays on Wellness Hub", "Authorize.net (or chosen gateway) — Hub is merchant of record"),
                ("E. Hub creates fulfillment job", "Chart + Rx lines + ship-to + wholesale costs attached"),
                ("F. Hub submits to RxHere", "Partner pharmacy compounds / ships"),
                ("G. Status returns to Hub → partners", "Partner sites show paid / shipped without handling money"),
            ],
            w,
        )
    )
    story.append(Paragraph("Figure 2 — End-to-end clinical order lifecycle", s["caption"]))

    story.append(Paragraph("4. Money — retail in, wholesale out", s["h1"]))
    story.append(
        Paragraph(
            "This is the clean settlement model. The patient always pays retail to Wellness Hub. "
            "Hub later pays RxHere only the wholesale amount from the distribution price sheet.",
            s["body"],
        )
    )
    story.append(MoneyFlow(w))
    story.append(Paragraph("Figure 3 — Payment and wholesale settlement", s["caption"]))

    story.append(
        table(
            [
                ["Example", "Amount"],
                ["Patient pays Hub for a therapy line (retail / MSRP)", "$80.00"],
                ["Wholesale cost on price sheet (what Hub owes RxHere)", "$40.00"],
                ["Card fees + ops (illustrative)", "$3.00"],
                ["Optional partner / provider commission", "$8.00"],
                ["Hub margin before other costs", "$29.00"],
            ],
            [5.0 * inch, 2.2 * inch],
            s,
        )
    )
    story.append(
        Paragraph(
            "Wholesale numbers come from the master formulary (Client / MSRP / Online-not-lower-than). "
            "Hub stores both <b>patient price</b> and <b>wholesalePrice</b> on every SKU so settlement "
            "is automatic when the order pays.",
            s["body"],
        )
    )

    story.append(PageBreak())

    # 5 Roles
    story.append(Paragraph("5. Who does what (operating roles)", s["h1"]))
    story.append(
        table(
            [
                ["Role", "Works in", "Responsibilities"],
                ["Patient", "Partner site + Hub pay/track links", "Fill intake, pay, track shipment"],
                ["Partner provider", "Wellness Hub provider portal", "Review intake, sign, send therapy"],
                ["Partner clinic / brand", "Own website + Hub partner portal", "Send leads, see status & earnings"],
                ["Hub admin / ops", "Wellness Hub admin", "Catalog, partners, exceptions, payouts"],
                ["Pharmacy (RxHere)", "RxHere systems", "Compound, ship, send status"],
            ],
            [1.4 * inch, 2.2 * inch, 3.6 * inch],
            s,
        )
    )

    story.append(Paragraph("6. How to connect each existing brand", s["h1"]))
    story.append(Paragraph("KIAN Privé", s["h2"]))
    story.append(
        Paragraph(
            "KIAN becomes a <b>premium brand front</b> (Icoone, retail, membership story) while "
            "clinical Rx checkout and therapy pay links point to Wellness Hub. KIAN can keep "
            "local booking for services that are not pharmacy-fulfilled. Anything that needs "
            "a compound or Hub catalog SKU posts into Hub.",
            s["body"],
        )
    )
    story.append(Paragraph("Threefold Strength", s["h2"]))
    story.append(
        Paragraph(
            "Keep Threefold’s site and intake UI. Change the submit target from KIAN to Wellness Hub "
            "with Threefold’s site ID. Replace KIAN webhooks with Hub webhooks so “payment required / "
            "paid / shipped” still show inside Threefold.",
            s["body"],
        )
    )
    story.append(Paragraph("4everglow & Facial Design", s["h2"]))
    story.append(
        Paragraph(
            "Same partner-intake pattern they already use — only the destination host and webhook "
            "names change to Wellness Hub. They never receive card data; they receive status.",
            s["body"],
        )
    )
    story.append(Paragraph("Privé Therapeutics (current Wellness Hub UI)", s["h2"]))
    story.append(
        Paragraph(
            "Today this site often acts as a front door that forwards into KIAN. In the target model "
            "it becomes (or merges into) the <b>real Hub application</b>: native intakes, native pay, "
            "native provider tools — not a pass-through.",
            s["body"],
        )
    )

    story.append(Paragraph("7. Configuration checklist (to function perfectly)", s["h1"]))
    story.append(
        table(
            [
                ["Must configure", "Why it matters"],
                ["One Hub domain + API keys per partner site", "Trusted intake + webhook identity"],
                ["One payment merchant on Hub (Authorize.net)", "Patients always pay the same trusted checkout"],
                ["Master formulary with retail + wholesale", "Correct patient charge and RxHere cost"],
                ["Provider accounts attached to Hub (not only brand sites)", "Charts reviewed in one place"],
                ["RxHere credentials on Hub (or Hub→WT service)", "Automated pharmacy submit after PAID"],
                ["Wholesale payable ledger + ACH process", "Pay pharmacy without guessing margins"],
                ["Partner revenue-share rules", "Automatic commissions after payment"],
                ["Status webhooks back to every brand", "Partners stay informed without owning fulfillment"],
            ],
            [3.2 * inch, 4.0 * inch],
            s,
        )
    )

    story.append(PageBreak())

    story.append(Paragraph("8. Today vs target (honest snapshot)", s["h1"]))
    story.append(
        table(
            [
                ["Topic", "Today (approx.)", "Target"],
                ["Central brain", "Mostly KIAN Privé", "Wellness Hub"],
                ["Patient pays where?", "KIAN pay links / shop", "Always Wellness Hub"],
                ["Partner intakes land where?", "KIAN partner API", "Hub intake API"],
                ["Pharmacy path", "KIAN → Wellness Tech → RxHere", "Hub → RxHere (WT optional as worker)"],
                ["Wholesale settlement", "Vendor PO / manual ACH to WT", "Hub pays RxHere at wholesale"],
                ["Brand sites", "Mix of local + KIAN dependence", "Front doors only + Hub APIs"],
            ],
            [1.5 * inch, 2.85 * inch, 2.85 * inch],
            s,
        )
    )

    story.append(Paragraph("9. Recommended build sequence (after you confirm)", s["h1"]))
    story.append(
        VerticalSteps(
            [
                ("Phase 1 — Name the hub and freeze the contract", "Confirm Wellness Hub is MoR + chart owner"),
                ("Phase 2 — Partner intake cutover", "Threefold / 4everglow / Facial Design / KIAN → Hub API"),
                ("Phase 3 — Payment cutover", "Move /pay links and Authorize.net merchant to Hub"),
                ("Phase 4 — Pharmacy + wholesale automation", "PAID → RxHere submit + wholesale payable"),
                ("Phase 5 — Provider portal on Hub", "Dual-role providers work charts in Hub"),
                ("Phase 6 — Brand cleanup", "KIAN/partners become fronts; Hub is the ops home"),
            ],
            w,
        )
    )
    story.append(Paragraph("Figure 4 — Suggested rollout order", s["caption"]))

    story.append(
        callout_box(
            "<b>Decision we need from you before building:</b> Confirm that <b>Wellness Hub</b> "
            "(not KIAN Privé) will be the single system that (1) receives all intakes, "
            "(2) charges every patient for therapy/Rx, (3) sends paid orders to RxHere, and "
            "(4) pays RxHere at wholesale. Partner websites remain brands and lead sources. "
            "If you confirm, the next step is a phased build plan with owners and cutover dates.",
            s,
        )
    )

    story.append(Spacer(1, 0.2 * inch))
    story.append(
        Paragraph(
            "Remember the picture: <b>Partner sites → Wellness Hub (pay + chart) → RxHere (fulfill at wholesale) → status back to partners.</b>",
            s["body"],
        )
    )

    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=letter,
        leftMargin=0.65 * inch,
        rightMargin=0.65 * inch,
        topMargin=0.65 * inch,
        bottomMargin=0.65 * inch,
        title="Wellness Hub Central Architecture Plan",
        author="KIAN / Wellness network",
    )
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    build()
