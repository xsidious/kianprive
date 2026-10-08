"""Generate category placeholder SVGs for clinical formulary products."""
from pathlib import Path

palette = {
    "appetite-suppressant": ("#1b6568", "#8a682e", "Appetite"),
    "fat-loss-metabolic": ("#2d5a3d", "#c4a35a", "Metabolic"),
    "anti-aging": ("#5c4a7a", "#d4a574", "Anti-Aging"),
    "tissue-repair": ("#3d5a80", "#a8dadc", "Repair"),
    "longevity": ("#1d3557", "#e9c46a", "Longevity"),
    "sleep": ("#2b2d42", "#8d99ae", "Sleep"),
    "growth-hormone": ("#264653", "#2a9d8f", "GH"),
    "immune": ("#6a994e", "#a7c957", "Immune"),
    "cognitive": ("#4a4e69", "#9a8c98", "Cognitive"),
    "hrt": ("#7b2d26", "#e09f3e", "HRT"),
    "sexual-health": ("#9b2226", "#ee9b00", "Sexual"),
    "dermatology": ("#6d597a", "#e8c2ca", "Derma"),
    "skin-hair": ("#bc6c25", "#dda15e", "Skin"),
    "wellness": ("#386641", "#a7c957", "Wellness"),
    "peptides": ("#023e8a", "#48cae4", "Peptides"),
    "peptide-stacks": ("#0077b6", "#90e0ef", "Stacks"),
    "addiction": ("#495057", "#adb5bd", "Support"),
    "anesthetic": ("#343a40", "#ced4da", "Anesthetic"),
    "compounded": ("#8a682e", "#f1e7d7", "Rx"),
}


def svg(bg: str, accent: str, label: str) -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" role="img" aria-label="{label}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{bg}"/>
      <stop offset="100%" stop-color="{accent}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#g)"/>
  <circle cx="400" cy="320" r="120" fill="rgba(255,255,255,0.12)"/>
  <rect x="340" y="250" width="120" height="220" rx="28" fill="rgba(255,255,255,0.88)"/>
  <rect x="360" y="220" width="80" height="40" rx="10" fill="rgba(255,255,255,0.95)"/>
  <rect x="370" y="290" width="60" height="140" rx="12" fill="{accent}" opacity="0.55"/>
  <text x="400" y="560" text-anchor="middle" font-family="Georgia, serif" font-size="36" fill="rgba(255,255,255,0.95)">{label}</text>
  <text x="400" y="610" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" letter-spacing="4" fill="rgba(255,255,255,0.7)">COMPOUNDED</text>
</svg>
"""


dirs = [
    Path(r"C:/Users/FindMeAnywhere/Desktop/kianprive/public/images/formulary"),
    Path(r"C:/Users/FindMeAnywhere/Desktop/wellness-tech/public/images/formulary"),
]

for d in dirs:
    d.mkdir(parents=True, exist_ok=True)
    for slug, (bg, accent, label) in palette.items():
        (d / f"{slug}.svg").write_text(svg(bg, accent, label), encoding="utf-8")
    print(d, "files", len(list(d.glob("*.svg"))))
