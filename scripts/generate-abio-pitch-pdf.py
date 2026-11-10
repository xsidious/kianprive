"""Realistic client pitch PDF for a-biousa.com maintenance / redesign."""
from __future__ import annotations

from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle, PageBreak

OUT = Path(r"C:\Users\FindMeAnywhere\Desktop\ABio_USA_Website_Pitch.pdf")

NAVY = colors.HexColor("#0f2744")
GOLD = colors.HexColor("#8a6b35")
CREAM = colors.HexColor("#f7f3ec")
INK = colors.HexColor("#1c1915")
MUTED = colors.HexColor("#5c5348")
LINE = colors.HexColor("#d7d0c4")


def styles():
    b = getSampleStyleSheet()
    return {
        "cover": ParagraphStyle(
            "cover", parent=b["Title"], fontName="Helvetica-Bold", fontSize=20, leading=26,
            textColor=NAVY, alignment=TA_CENTER, spaceAfter=8,
        ),
        "sub": ParagraphStyle(
            "sub", parent=b["Normal"], fontName="Helvetica", fontSize=11, leading=15,
            textColor=MUTED, alignment=TA_CENTER, spaceAfter=6,
        ),
        "h1": ParagraphStyle(
            "h1", parent=b["Heading1"], fontName="Helvetica-Bold", fontSize=13, leading=17,
            textColor=NAVY, spaceBefore=12, spaceAfter=6,
        ),
        "h2": ParagraphStyle(
            "h2", parent=b["Heading2"], fontName="Helvetica-Bold", fontSize=11, leading=14,
            textColor=GOLD, spaceBefore=8, spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "body", parent=b["Normal"], fontName="Helvetica", fontSize=10, leading=14,
            textColor=INK, alignment=TA_LEFT, spaceAfter=7,
        ),
        "cell": ParagraphStyle(
            "cell", parent=b["Normal"], fontName="Helvetica", fontSize=8.5, leading=11, textColor=INK,
        ),
        "cell_b": ParagraphStyle(
            "cell_b", parent=b["Normal"], fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=NAVY,
        ),
        "small": ParagraphStyle(
            "small", parent=b["Normal"], fontName="Helvetica", fontSize=8, leading=10.5,
            textColor=MUTED, spaceAfter=4,
        ),
    }


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(0.7 * inch, letter[1] - 0.5 * inch, letter[0] - 0.7 * inch, letter[1] - 0.5 * inch)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(0.7 * inch, letter[1] - 0.4 * inch, "ABio USA · Website review & proposal")
    canvas.drawRightString(letter[0] - 0.7 * inch, letter[1] - 0.4 * inch, date.today().isoformat())
    canvas.line(0.7 * inch, 0.5 * inch, letter[0] - 0.7 * inch, 0.5 * inch)
    canvas.drawCentredString(letter[0] / 2, 0.35 * inch, f"Page {doc.page}")
    canvas.restoreState()


def table(rows, widths, s):
    data = [
        [Paragraph(str(c), s["cell_b"] if i == 0 else s["cell"]) for c in row]
        for i, row in enumerate(rows)
    ]
    t = Table(data, colWidths=widths, repeatRows=1)
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


def box(text, s):
    t = Table([[Paragraph(text, s["body"])]], colWidths=[7.1 * inch])
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

    story.append(Spacer(1, 1.15 * inch))
    story.append(Paragraph("Website Review & Maintenance Proposal", s["cover"]))
    story.append(Paragraph("ABio materials USA Inc · a-biousa.com", s["sub"]))
    story.append(Paragraph(f"{date.today().strftime('%B %d, %Y')}", s["sub"]))
    story.append(Spacer(1, 0.35 * inch))
    story.append(
        box(
            "This is a straightforward review of the public site as it stands today. "
            "The goal is not to scare anyone — it is to explain what the site is built on, "
            "where it is slow or fragile, and why a full Next.js rebuild, custom dashboard, "
            "and monthly care is the practical next step.",
            s,
        )
    )
    story.append(PageBreak())

    story.append(Paragraph("1. What the site is built with", s["h1"]))
    story.append(
        Paragraph(
            "From the live site we can confirm it runs on a standard <b>WordPress</b> setup with "
            "<b>WooCommerce</b> for the shop and <b>Elementor</b> (a drag-and-drop page builder) "
            "for most of the page layout. That combination is common. It is also the reason many "
            "sites get heavy over time: each plugin and builder widget adds more CSS, JavaScript, "
            "and update surface area.",
            s["body"],
        )
    )
    story.append(
        table(
            [
                ["Component", "What that means in plain terms"],
                ["WordPress", "Content management system. Flexible, but depends on regular updates."],
                ["WooCommerce", "Online store layer on top of WordPress."],
                ["Elementor", "Visual page builder. Fast to edit, easy to overload with widgets/CSS."],
                ["Cloudflare + LiteSpeed signals", "Hosting/CDN layer exists, but the page itself is still heavy."],
                ["SEO plugin (Rank Math)", "Helps with basics. Does not automatically make the site fast or secure."],
            ],
            [2.2 * inch, 4.9 * inch],
            s,
        )
    )
    story.append(
        Paragraph(
            "None of this means the site was “built wrong.” It means it was built the usual way — "
            "and that usual way needs ongoing maintenance if you want it to stay fast, safe, and polished.",
            s["body"],
        )
    )

    story.append(Paragraph("2. Speed & page weight (measured)", s["h1"]))
    story.append(
        Paragraph(
            "These numbers came from the live homepage, not a lab estimate:",
            s["body"],
        )
    )
    story.append(
        table(
            [
                ["Measurement", "What we saw"],
                ["Homepage HTML size", "About 1.3 MB for the HTML document alone"],
                ["Stylesheets", "Roughly 95 CSS files linked, plus ~90 inline style blocks"],
                ["Scripts", "Dozens of JavaScript files loaded"],
                ["Images", "100+ image tags; no lazy-loading attributes found"],
                ["Caching header", "Cloudflare reported DYNAMIC (HTML not fully edge-cached)"],
            ],
            [2.4 * inch, 4.7 * inch],
            s,
        )
    )
    story.append(
        Paragraph(
            "In practical terms: the first load has a lot of work to do before the page feels settled. "
            "On mobile networks this matters more. Speed will not magically match a modern lean build "
            "until CSS/JS/media are cleaned up and caching is tuned properly.",
            s["body"],
        )
    )

    story.append(Paragraph("3. WordPress risk — without the drama", s["h1"]))
    story.append(
        Paragraph(
            "WordPress powers a huge share of the web. That popularity is also why it is a frequent "
            "target. The risk is usually not “WordPress is broken.” The risk is "
            "<b>outdated plugins, outdated builders, weak hardening, and no one watching updates</b>.",
            s["body"],
        )
    )
    story.append(
        table(
            [
                ["Risk area", "Why it matters here"],
                ["Plugin / builder surface", "WooCommerce + Elementor + SEO + sliders/filters = more things that must stay patched"],
                ["Public WordPress API", "The site exposes /wp-json/ (normal for WP). Still worth hardening and monitoring."],
                ["Admin & login attacks", "Credential stuffing and bot logins are common on Woo shops"],
                ["File / upload paths", "WooCommerce upload/log paths are referenced in robots rules — normal, but need secure config"],
                ["Unattended updates", "One outdated plugin can open an avoidable hole even if the design looks fine"],
            ],
            [2.2 * inch, 4.9 * inch],
            s,
        )
    )
    story.append(
        Paragraph(
            "A monthly retainer is largely about reducing that exposure: updates, backups, monitoring, "
            "and fixing issues before they become downtime or a cleanup project.",
            s["body"],
        )
    )

    story.append(PageBreak())
    story.append(Paragraph("4. Polish & conversion gaps (visible today)", s["h1"]))
    story.append(
        Paragraph(
            "A few examples that affect trust and sales more than most people expect:",
            s["body"],
        )
    )
    story.append(
        table(
            [
                ["Issue", "Why a client/visitor notices"],
                ["Stat / counter section looks unfinished", "Numbers start at zero / can fail to read clearly (Elementor counter widgets)"],
                ["Desktop hamburger menu", "Hides navigation on large screens — extra friction"],
                ["Dense text blocks", "Harder to scan; weak hierarchy for a clinical/B2B brand"],
                ["Shop UX is soft", "Lots of “Read more”; commerce path could be clearer"],
                ["Heavy media", "Some images are much larger than the size they display at"],
            ],
            [2.6 * inch, 4.5 * inch],
            s,
        )
    )

    story.append(Paragraph("5. SEO — present, not finished", s["h1"]))
    story.append(
        Paragraph(
            "There is an SEO plugin and a sitemap, which is a decent baseline. That is not the same as "
            "a finished SEO setup. Homepage heading strategy, content depth for clinical buyers, "
            "image performance, and cleaner internal structure still need work. Rankings depend on "
            "both content quality and technical health — and technical health is currently weighed down "
            "by page bulk.",
            s["body"],
        )
    )

    story.append(Paragraph("6. What we recommend", s["h1"]))
    story.append(
        Paragraph(
            "We recommend a <b>full site rebuild on Next.js</b> (modern web framework), not another "
            "round of Elementor patches. Next.js sites typically load and navigate faster because "
            "pages are engineered for performance instead of stacking page-builder plugins.",
            s["body"],
        )
    )
    story.append(
        table(
            [
                ["Engagement", "Scope"],
                [
                    "Full site rebuild (Next.js)",
                    "Complete redesign + rebuild of the public site: faster loads, cleaner product/shop flows, stronger brand presentation, SEO-ready structure",
                ],
                [
                    "Custom dashboard",
                    "Admin / business dashboard built for your team — manage products, content, leads/orders visibility, and day-to-day operations without fighting WordPress plugins",
                ],
                [
                    "$500 / month maintenance",
                    "Hosting care, updates, monitoring, backups/uptime, performance watch, small improvements, SEO hygiene, monthly summary after launch",
                ],
            ],
            [2.0 * inch, 5.1 * inch],
            s,
        )
    )
    story.append(Paragraph("Why Next.js instead of staying on WordPress", s["h2"]))
    story.append(
        table(
            [
                ["WordPress + Elementor today", "Next.js rebuild"],
                ["Heavy HTML/CSS/JS from builders & plugins", "Lean pages built to load quickly"],
                ["Security depends on constant plugin patching", "Smaller attack surface; no random plugin stack"],
                ["Editing is flexible but easy to break polish/speed", "Custom dashboard + structured content you control"],
                ["Feels assembled over time", "Feels intentional — one coherent product"],
            ],
            [3.55 * inch, 3.55 * inch],
            s,
        )
    )
    story.append(
        Paragraph(
            "The monthly fee is not “hosting only.” After the rebuild, it is ongoing ownership: "
            "keeping the Next.js site and custom dashboard stable, monitored, and improved.",
            s["body"],
        )
    )

    story.append(Paragraph("7. Honest summary", s["h1"]))
    story.append(
        box(
            "<b>What is true:</b> This is a WordPress + WooCommerce + Elementor site. It is heavier "
            "than it should be, has real maintenance/security exposure typical of that stack, and "
            "shows polish issues that hurt credibility.<br/><br/>"
            "<b>What we propose:</b> A full rebuild on <b>Next.js</b> for faster loading and cleaner "
            "performance, plus a <b>custom dashboard</b> for your team, and <b>$500/month</b> afterward "
            "for maintenance and improvements.<br/><br/>"
            "<b>What we are not claiming:</b> That the current site is unusable overnight. It works — "
            "but it is not the long-term foundation a premium importer brand should rely on.<br/><br/>"
            "<b>Ask:</b> Approve the Next.js full rebuild + custom dashboard plan, with the $500/month "
            "retainer for ongoing care after launch.",
            s,
        )
    )
    story.append(Spacer(1, 0.2 * inch))
    story.append(
        Paragraph(
            f"Based on a live review of https://a-biousa.com/ on {date.today().isoformat()}. "
            "Figures are from the public production site at time of review.",
            s["small"],
        )
    )

    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=letter,
        leftMargin=0.7 * inch,
        rightMargin=0.7 * inch,
        topMargin=0.7 * inch,
        bottomMargin=0.7 * inch,
        title="ABio USA Website Review & Proposal",
        author="Website Proposal",
    )
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    build()
