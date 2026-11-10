"""Client-facing technical audit PDF for a-biousa.com (redesign + retainer pitch)."""
from __future__ import annotations

from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle, PageBreak, KeepTogether

OUT = Path(r"C:\Users\FindMeAnywhere\Desktop\ABio_USA_Website_Technical_Audit.pdf")
SITE = "https://a-biousa.com/"

NAVY = colors.HexColor("#0f2744")
GOLD = colors.HexColor("#9a7b3c")
RED = colors.HexColor("#8b2e2e")
CREAM = colors.HexColor("#f7f3ec")
INK = colors.HexColor("#1c1915")
MUTED = colors.HexColor("#5c5348")
LINE = colors.HexColor("#d7d0c4")
OK = colors.HexColor("#1f6b45")


def styles():
    b = getSampleStyleSheet()
    return {
        "cover": ParagraphStyle("cover", parent=b["Title"], fontName="Helvetica-Bold", fontSize=22, leading=28, textColor=NAVY, alignment=TA_CENTER, spaceAfter=8),
        "sub": ParagraphStyle("sub", parent=b["Normal"], fontName="Helvetica", fontSize=11, leading=15, textColor=MUTED, alignment=TA_CENTER, spaceAfter=6),
        "h1": ParagraphStyle("h1", parent=b["Heading1"], fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=NAVY, spaceBefore=12, spaceAfter=7),
        "h2": ParagraphStyle("h2", parent=b["Heading2"], fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=GOLD, spaceBefore=9, spaceAfter=5),
        "body": ParagraphStyle("body", parent=b["Normal"], fontName="Helvetica", fontSize=9.5, leading=13, textColor=INK, alignment=TA_LEFT, spaceAfter=6),
        "small": ParagraphStyle("small", parent=b["Normal"], fontName="Helvetica", fontSize=8, leading=10.5, textColor=MUTED, spaceAfter=4),
        "cell": ParagraphStyle("cell", parent=b["Normal"], fontName="Helvetica", fontSize=8, leading=10.5, textColor=INK),
        "cell_b": ParagraphStyle("cell_b", parent=b["Normal"], fontName="Helvetica-Bold", fontSize=8, leading=10.5, textColor=NAVY),
        "sev": ParagraphStyle("sev", parent=b["Normal"], fontName="Helvetica-Bold", fontSize=8, leading=10.5, textColor=RED),
    }


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(0.65 * inch, letter[1] - 0.48 * inch, letter[0] - 0.65 * inch, letter[1] - 0.48 * inch)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(0.65 * inch, letter[1] - 0.38 * inch, "ABio USA · Website Technical Audit")
    canvas.drawRightString(letter[0] - 0.65 * inch, letter[1] - 0.38 * inch, date.today().isoformat())
    canvas.line(0.65 * inch, 0.48 * inch, letter[0] - 0.65 * inch, 0.48 * inch)
    canvas.drawCentredString(letter[0] / 2, 0.32 * inch, f"Page {doc.page} · Confidential")
    canvas.restoreState()


def table(rows, widths, s):
    data = []
    for i, row in enumerate(rows):
        cells = []
        for j, c in enumerate(row):
            style = s["cell_b"] if i == 0 else (s["sev"] if j == 0 and i > 0 and str(row[0]).startswith("P") else s["cell"])
            cells.append(Paragraph(str(c), style if not (i == 0) else s["cell_b"]))
        data.append(cells)
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


def box(text, s, color=CREAM, border=GOLD):
    inner = Paragraph(text, s["body"])
    t = Table([[inner]], colWidths=[7.2 * inch])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), color),
                ("BOX", (0, 0), (-1, -1), 1.2, border),
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

    story.append(Spacer(1, 1.0 * inch))
    story.append(Paragraph("Website Technical Audit", s["cover"]))
    story.append(Paragraph("ABio materials USA Inc · a-biousa.com", s["cover"]))
    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph(f"Independent review · {date.today().strftime('%B %d, %Y')}", s["sub"]))
    story.append(Paragraph("Prepared for strategic redesign, performance, SEO & ongoing maintenance", s["sub"]))
    story.append(Spacer(1, 0.3 * inch))
    story.append(
        box(
            "<b>Executive summary:</b> The site is a WordPress + WooCommerce + Elementor build with "
            "serious front-end bloat, incomplete content components, weak commerce conversion patterns, "
            "and only partial SEO/performance hygiene. It can look “fine” in a quick glance, but under "
            "the hood it behaves like an aging, over-plugin’d stack that has not been engineered for "
            "speed, clarity, or modern B2B medical-aesthetics conversion. A redesign plus monthly "
            "maintenance is justified to protect brand credibility, rankings, and sales.",
            s,
        )
    )
    story.append(PageBreak())

    story.append(Paragraph("1. Current technology stack (legacy pattern)", s["h1"]))
    story.append(
        Paragraph(
            "Detected stack from live HTML/headers/API fingerprints on "
            f"<font color='#0f2744'><u>{SITE}</u></font>:",
            s["body"],
        )
    )
    story.append(
        table(
            [
                ["Layer", "What we found", "Why it matters"],
                ["CMS / commerce", "WordPress + WooCommerce", "Flexible, but heavy when uncared for"],
                ["Page builder", "Elementor / Elementor Pro (+ theme residue)", "Classic source of CSS/JS bloat"],
                ["Theme clues", "Hello Elementor / Astra / Divi fingerprints", "Messy multi-theme residue = tech debt"],
                ["JS libraries", "jQuery + Swiper + Owl Carousel + Font Awesome", "Older multi-library pattern, duplicated motion tooling"],
                ["SEO plugin", "Rank Math present", "Plugin ≠ optimized; hygiene still weak"],
                ["Hosting edge", "Cloudflare + LiteSpeed headers", "Edge present, but HTML served DYNAMIC (not fully cached)"],
                ["Tracking", "GTM / gtag + Facebook pixel signals", "Marketing tags add weight without conversion polish"],
            ],
            [1.4 * inch, 2.7 * inch, 3.1 * inch],
            s,
        )
    )
    story.append(
        Paragraph(
            "<b>Plain English:</b> This is not a modern lean storefront. It is a classic WordPress "
            "builder stack with multiple leftover libraries and plugins — the pattern teams inherit "
            "when sites are assembled quickly and not continuously engineered.",
            s["body"],
        )
    )

    story.append(Paragraph("2. Performance & load optimization (critical)", s["h1"]))
    story.append(
        table(
            [
                ["Finding", "Evidence", "Business impact"],
                ["Homepage HTML ~1.3 MB", "Live document size measured ~1,316,861 bytes", "Slow first paint; crawlers & mobiles struggle"],
                ["~190 stylesheets in DOM", "document.styleSheets.length = 190", "Render-blocking CSS; “old builder” signature"],
                ["~95 stylesheet link tags + ~92 style blocks", "Parsed from HTML", "Massive CSS payload / duplication"],
                ["~75 scripts / 37 external script tags", "DOM + HTML parse", "Main-thread contention; janky UX"],
                ["100+ images, 0 lazy-load attributes", "loading=lazy count = 0", "Wastes bandwidth below the fold"],
                ["Oversized media", "2000×1333 image shown ~244px wide; product thumbs via huge data-URI/base64", "Loads far more pixels than needed"],
                ["~13 video resources requested", "Performance resource log", "Heavy media without clear conversion role"],
                ["~167 network requests on load", "Browser performance entries", "Too chatty for a marketing homepage"],
                ["Cloudflare cache DYNAMIC", "cf-cache-status: DYNAMIC", "Edge not fully helping HTML TTFB"],
            ],
            [2.1 * inch, 2.7 * inch, 2.4 * inch],
            s,
        )
    )
    story.append(
        box(
            "<b>Bottom line on speed:</b> Even with Cloudflare in front, the page composition is "
            "unoptimized. A premium biotech / aesthetics brand should feel instant. This stack "
            "currently feels assembled, not engineered.",
            s,
            color=colors.HexColor("#f8ecec"),
            border=RED,
        )
    )

    story.append(PageBreak())
    story.append(Paragraph("3. Content & UX defects (not “to perfection”)", s["h1"]))
    story.append(
        table(
            [
                ["Issue", "What users see / experience", "Severity"],
                ["Broken trust metrics", "Homepage counters render as 0% / 0k+ / 0 Years", "High — looks unfinished"],
                ["Desktop hamburger nav", "Primary nav hidden behind toggle on wide screens", "High — friction + dated UX"],
                ["Wall of text", "“Our Technology” is a dense centered paragraph block", "Med — poor scanability"],
                ["Weak commerce CTAs", "Many “Read more” cards; limited Add to cart emphasis", "High — leaves money on table"],
                ["Duplicate / noisy IA", "Mega-menu repeats Celexo / LUMIDOR trees heavily", "Med — cognitive overload"],
                ["Asset typos", "e.g. filename “Soltion” (Solution misspelled)", "Low/Med — quality signal"],
                ["Hero vs product conflict", "Large EXO-THERAPY overlay competes with product photography", "Med — brand clarity"],
                ["Floating call widget + chrome", "Extra floating UI competes with content", "Med — mobile clutter risk"],
            ],
            [1.8 * inch, 3.6 * inch, 1.8 * inch],
            s,
        )
    )
    story.append(
        Paragraph(
            "These are not theoretical. A prospect landing on the homepage immediately sees "
            "<b>zeros</b> in the “Why Choose” stats — the opposite of a polished, trustworthy "
            "medical-aesthetics supplier site.",
            s["body"],
        )
    )

    story.append(Paragraph("4. SEO audit (opportunity, not finished)", s["h1"]))
    story.append(
        table(
            [
                ["Area", "Current state", "Gap / recommendation"],
                ["Title tag", "“Exosome Skin Booster & Plant Exosome Treatments | ABio USA”", "Decent, but homepage H1 does not reinforce primary offer"],
                ["Meta description", "~149 chars, generic science positioning", "OK length; needs sharper proof + CTA language"],
                ["H1", "“Why Choose ABio materials USA Inc.”", "Brand-centric, not intent-centric (exosome / clinic buyer keywords)"],
                ["Structured data", "JSON-LD present (1 block observed)", "Expand Product/Organization/FAQ for rich results"],
                ["Sitemap / robots", "Rank Math sitemap index + Woo disallow rules", "Good baseline; still need crawl-budget discipline on thin/dupe URLs"],
                ["Internal linking", "Product grids + deep menus", "Menus are heavy; editorial SEO paths (guides, protocols) underused"],
                ["Image SEO", "Many WebP assets (good) but oversized + no lazy load", "Compression + responsive srcset + lazy load required"],
                ["Content strategy", "Catalog-heavy homepage", "Needs clinical education hubs to rank beyond product SKUs"],
                ["E-E-A-T / medical claims", "Strong FDA/importer language", "Needs careful clinical claim review + citations for trust/compliance"],
            ],
            [1.4 * inch, 2.9 * inch, 2.9 * inch],
            s,
        )
    )
    story.append(
        Paragraph(
            "<b>SEO reality check:</b> Having Rank Math installed is not the same as being SEO-complete. "
            "Technical weight, weak H1 strategy, thin educational content, and unoptimized media "
            "cap organic growth even when titles look acceptable.",
            s["body"],
        )
    )

    story.append(PageBreak())
    story.append(Paragraph("5. Security, ops & maintainability", s["h1"]))
    story.append(
        table(
            [
                ["Topic", "Observation", "Retainer implication"],
                ["Plugin surface area", "Woo + Elementor Pro + sliders + filters + SEO + security signals", "Needs monthly updates / conflict testing"],
                ["Public wp-json", "REST API responds (~1.5MB payload observed)", "Hardening / exposure review"],
                ["Multi-builder residue", "Elementor + theme fingerprints (Astra/Divi/Hello)", "Cleanup reduces break risk"],
                ["Content ops", "Large product catalog across Celexo / CellExosome / LUMIDOR", "Ongoing product SEO + image QA"],
                ["Forms / lead capture", "Contact + phone repeated many times", "Should be CRM-connected, tracked, spam-hardened"],
            ],
            [1.6 * inch, 3.0 * inch, 2.6 * inch],
            s,
        )
    )

    story.append(Paragraph("6. What “good” looks like for this brand", s["h1"]))
    story.append(
        Paragraph(
            "ABio is positioning as a North American importer/distributor of advanced Korean "
            "bio-materials (Celexo, CellExosome, LUMIDOR). The site should feel like a "
            "<b>clinical partner portal + brand authority engine</b>, not a generic Elementor brochure.",
            s["body"],
        )
    )
    story.append(
        table(
            [
                ["Priority", "Deliverable"],
                ["P0", "Fix broken counters, nav IA, and homepage conversion hierarchy"],
                ["P0", "Performance pass: cut CSS/JS, lazy-load, responsive images, cache HTML intelligently"],
                ["P1", "Redesign system: premium biotech visual language, clearer Celexo vs LUMIDOR journeys"],
                ["P1", "Commerce UX: B2B-aware shop paths, stronger CTAs, login/wholesale flows if needed"],
                ["P1", "SEO program: intent H1s, clinical content hubs, product schema, internal linking"],
                ["P2", "Monthly maintenance: updates, uptime, Core Web Vitals, content QA, security"],
            ],
            [1.0 * inch, 6.2 * inch],
            s,
        )
    )

    story.append(Paragraph("7. Recommended engagement", s["h1"]))
    story.append(
        box(
            "<b>Recommended structure:</b><br/>"
            "• <b>Redesign / rebuild sprint</b> (separate project fee) — modern information architecture, "
            "performance budget, conversion-focused homepage + product templates.<br/>"
            "• <b>$500 / month maintenance & growth retainer</b> — WordPress/Woo updates, uptime monitoring, "
            "Core Web Vitals, SEO hygiene, product & image QA, security patches, minor CRO iterations, "
            "monthly reporting.<br/><br/>"
            "Without a retainer, Elementor/Woo sites typically drift: plugins conflict, scores decay, "
            "and broken modules (like the 0% counters) stay live for months.",
            s,
        )
    )

    story.append(Paragraph("8. Scorecard (current)", s["h1"]))
    story.append(
        table(
            [
                ["Category", "Score (1–10)", "Notes"],
                ["Visual first impression", "6", "Photography is strong; layout/system feels generic"],
                ["Technical modernity", "4", "WordPress builder stack with heavy residue"],
                ["Performance engineering", "3", "1.3MB HTML, 190 stylesheets, no lazy-load"],
                ["SEO completeness", "5", "Basics present; strategy & technical SEO incomplete"],
                ["Conversion / commerce UX", "4", "Read-more heavy; trust stats broken"],
                ["Content polish", "4", "Dense copy; unfinished components visible"],
                ["Maintainability", "4", "High plugin/theme complexity"],
                ["Overall readiness for premium brand", "4 / 10", "Needs redesign + ongoing ownership"],
            ],
            [2.4 * inch, 1.3 * inch, 3.5 * inch],
            s,
        )
    )

    story.append(Spacer(1, 0.15 * inch))
    story.append(
        Paragraph(
            f"Audit method: live inspection of {SITE} (HTML/headers/assets/DOM performance) on "
            f"{date.today().isoformat()}. Findings reflect the public production site at time of review.",
            s["small"],
        )
    )

    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=letter,
        leftMargin=0.65 * inch,
        rightMargin=0.65 * inch,
        topMargin=0.65 * inch,
        bottomMargin=0.65 * inch,
        title="ABio USA Website Technical Audit",
        author="Website Technical Audit",
    )
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    build()
