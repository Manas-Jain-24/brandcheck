"""Generate the shareable BrandCheck product overview PDF."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    HRFlowable,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "BrandCheck_Product_Overview.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

font_dir = Path("C:/Windows/Fonts")
if (font_dir / "arial.ttf").exists():
    pdfmetrics.registerFont(TTFont("BrandRegular", str(font_dir / "arial.ttf")))
    pdfmetrics.registerFont(TTFont("BrandBold", str(font_dir / "arialbd.ttf")))
    REGULAR, BOLD = "BrandRegular", "BrandBold"
else:
    REGULAR, BOLD = "Helvetica", "Helvetica-Bold"

INK = colors.HexColor("#18352B")
GREEN = colors.HexColor("#225A42")
MUTED = colors.HexColor("#5C6E64")
PALE = colors.HexColor("#EFF5EF")
MINT = colors.HexColor("#D9E8D8")
LINE = colors.HexColor("#D8E4D9")
AMBER = colors.HexColor("#FFF4DD")
WHITE = colors.white
PAGE_W, PAGE_H = A4
CONTENT_W = PAGE_W - 88

styles = {
    "eyebrow": ParagraphStyle("eyebrow", fontName=BOLD, fontSize=8.1, leading=11, textColor=GREEN, spaceAfter=7),
    "title": ParagraphStyle("title", fontName=BOLD, fontSize=32, leading=38, textColor=INK, spaceAfter=13),
    "subtitle": ParagraphStyle("subtitle", fontName=REGULAR, fontSize=14, leading=20, textColor=MUTED, spaceAfter=16),
    "h1": ParagraphStyle("h1", fontName=BOLD, fontSize=20, leading=25, textColor=INK, spaceAfter=10),
    "h2": ParagraphStyle("h2", fontName=BOLD, fontSize=11, leading=15, textColor=GREEN, spaceBefore=8, spaceAfter=6),
    "body": ParagraphStyle("body", fontName=REGULAR, fontSize=10.3, leading=15.8, textColor=INK, spaceAfter=9),
    "small": ParagraphStyle("small", fontName=REGULAR, fontSize=8.8, leading=13.5, textColor=MUTED, spaceAfter=5),
    "card_title": ParagraphStyle("card_title", fontName=BOLD, fontSize=10.8, leading=15, textColor=INK, spaceAfter=3),
    "card_body": ParagraphStyle("card_body", fontName=REGULAR, fontSize=9.1, leading=13.4, textColor=INK),
    "white_title": ParagraphStyle("white_title", fontName=BOLD, fontSize=11, leading=16, textColor=WHITE),
    "white_body": ParagraphStyle("white_body", fontName=REGULAR, fontSize=9.2, leading=14, textColor=WHITE),
    "table_head": ParagraphStyle("table_head", fontName=BOLD, fontSize=9, leading=12.5, textColor=WHITE),
    "table": ParagraphStyle("table", fontName=REGULAR, fontSize=9, leading=13, textColor=INK),
    "table_bold": ParagraphStyle("table_bold", fontName=BOLD, fontSize=9, leading=13, textColor=INK),
    "center": ParagraphStyle("center", fontName=BOLD, fontSize=9, leading=13, textColor=GREEN, alignment=TA_CENTER),
}


def P(text, kind="body"):
    return Paragraph(text, styles[kind])


def rule():
    return HRFlowable(width="100%", thickness=0.7, color=LINE, spaceBefore=7, spaceAfter=12)


def panel(text, background=PALE, pad=12):
    t = Table([[P(text)]], colWidths=[CONTENT_W])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), background),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), pad),
        ("RIGHTPADDING", (0, 0), (-1, -1), pad),
        ("TOPPADDING", (0, 0), (-1, -1), pad),
        ("BOTTOMPADDING", (0, 0), (-1, -1), pad),
    ]))
    return t


def two_cards(items):
    cells = []
    for title, body in items:
        cells.append([P(title, "card_title"), P(body, "card_body")])
    rows = []
    for i in range(0, len(cells), 2):
        rows.append([cells[i], cells[i + 1] if i + 1 < len(cells) else ""])
    table = Table(rows, colWidths=[CONTENT_W / 2 - 5, CONTENT_W / 2 - 5], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.6, WHITE),
        ("LEFTPADDING", (0, 0), (-1, -1), 11),
        ("RIGHTPADDING", (0, 0), (-1, -1), 11),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    return table


def data_table(headers, rows, widths):
    table = Table([[P(h, "table_head") for h in headers]] +
                  [[P(str(c), "table_bold" if j == 0 else "table") for j, c in enumerate(row)] for row in rows],
                  colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PALE]),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("INNERGRID", (0, 1), (-1, -1), 0.4, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return table


def page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(GREEN)
    canvas.rect(0, PAGE_H - 16, PAGE_W, 16, fill=1, stroke=0)
    canvas.setStrokeColor(LINE)
    canvas.line(44, 38, PAGE_W - 44, 38)
    canvas.setFont(BOLD, 7.5)
    canvas.setFillColor(GREEN)
    canvas.drawString(44, 25, "BRANDCHECK  /  PRODUCT OVERVIEW")
    canvas.setFont(REGULAR, 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(PAGE_W - 44, 25, f"{doc.page} / 6")
    canvas.restoreState()


doc = SimpleDocTemplate(str(OUT), pagesize=A4, leftMargin=44, rightMargin=44,
                        topMargin=55, bottomMargin=55, title="BrandCheck | Product Overview",
                        author="BrandCheck", subject="Shareable explanation of BrandCheck")
story = []

# 1. Cover and simple promise.
story += [
    P("PRODUCT OVERVIEW  /  2 NOVEMBER 2026", "eyebrow"),
    Spacer(1, 20),
    P("BrandCheck", "title"),
    P("A review desk for content that needs to sound, look and read like your brand before it goes live.", "subtitle"),
    panel("<b>The idea:</b> A creator brings a draft to BrandCheck. The product checks it against approved brand sources, explains each issue, suggests a correction, and sends the exact revision to a human reviewer for a decision.", MINT, 16),
    Spacer(1, 23),
    P("Why this matters", "h1"),
    P("As teams grow, posts, emails, documents and visuals come from many people and tools. A retired product name, unsupported promise, inaccessible image or wrong asset can reach the public before a brand manager sees it. BrandCheck moves that discovery into the pre-publication workflow."),
    Spacer(1, 9),
    two_cards([
        ("For creators", "Get specific, source-linked feedback and optional edits without losing the purpose of the draft."),
        ("For brand teams", "Keep one approved policy, reusable assets, decision history and visibility into recurring issues."),
    ]),
    Spacer(1, 22),
    P("Explore the working product", "h2"),
    P('<link href="https://brandcheck.manasj1234567890.workers.dev/example" color="#225A42"><b>Public interactive example</b></link> - review a fictional NovaDesk launch draft without signing in.'),
    P('<link href="https://brandcheck.manasj1234567890.workers.dev/workspace" color="#225A42"><b>Shared workspace</b></link> - sign in for saved guidelines, roles and review history.'),
    P('<link href="https://github.com/Manas-Jain-24/brandcheck" color="#225A42"><b>Source code</b></link> - product implementation and technical documentation.'),
    Spacer(1, 12),
    P("BrandCheck supports a decision before publication; it does not publish the content itself.", "small"),
    PageBreak(),
]

# 2. Personas and journey.
story += [
    P("01  /  THE PRODUCT JOURNEY", "eyebrow"),
    P("From draft to accountable decision", "h1"),
    P("The central workflow connects approved source material to a reviewable content revision. Each step leaves the creator and reviewer in control."),
    two_cards([
        ("Creator", "Writes or imports a draft, checks findings, revises content and submits a version."),
        ("Brand manager", "Maintains approved terminology, messaging, evidence and asset guidance; reviews policy proposals."),
        ("Authorised reviewer", "Reads the submitted snapshot, comments, asks for changes or approves with a reason."),
        ("Organisation", "Sees repeated errors and policy gaps, with an audit trail of content and decisions."),
    ]),
    Spacer(1, 16),
    data_table(["Step", "What happens", "Why it matters"], [
        ("1. Define", "Add approved guideline sources, retired terms, evidence records and known assets.", "Checks have a clear authority."),
        ("2. Prepare", "Write text or extract a text-based PDF, DOCX, TXT or Markdown file. Attach an image if relevant.", "One place for varied content."),
        ("3. Review", "Run rules and, with consent, Gemini analysis against active approved sources.", "Issues appear before publication."),
        ("4. Resolve", "Inspect cited evidence and optional suggestions; edit, apply a verified term fix, or dismiss with a reason.", "The creator keeps editorial control."),
        ("5. Submit", "Freeze the checked revision and assign it for human review.", "The reviewer sees the exact version."),
        ("6. Decide", "A separate reviewer comments, requests changes or approves. A later edit needs a new check.", "Approval stays accountable."),
        ("7. Learn", "Inspect history, recurring issue categories and policy changes that affect old drafts.", "Guidelines can improve over time."),
    ], [71, 247, CONTENT_W - 318]),
    Spacer(1, 13),
    panel("<b>Two ways to try it:</b> <b>/example</b> is a device-local, fictional sample with a simulated role switch. <b>/workspace</b> is the saved, authenticated team workflow with server-enforced permissions.", AMBER),
    PageBreak(),
]

# 3. Real example and explanation model.
story += [
    P("02  /  EXPLAINABLE FINDINGS", "eyebrow"),
    P("A concrete review example", "h1"),
    P("Take this fictional launch line from the public example:"),
    panel('<b>Draft:</b> "Flowly guarantees 2x productivity for every team. Meet the future of work."', MINT, 14),
    Spacer(1, 15),
    data_table(["Issue", "What BrandCheck explains", "Source and next step"], [
        ("Retired name", '"Flowly" is retired; "NovaDesk" is approved.', "TERM-001. Replace the term if this is the intended product."),
        ("Measured claim", '"2x productivity" needs current approved evidence; the app does not call it false.', "CLAIM-001. Attach evidence or remove the measurement."),
        ("Absolute tone", '"Guarantees" may overstate the promise and depart from the calm, specific voice.', "TONE-001. Rewrite with narrower wording for a person to assess."),
        ("Image access", "The meaningful sample graphic has no alternative text.", "ACCESS-001. Describe it or mark it decorative if appropriate."),
    ], [95, 225, CONTENT_W - 320]),
    Spacer(1, 18),
    P("What a finding contains", "h2"),
    P("Each finding identifies the category, severity, exact excerpt or image location, approved source ID and version, reason for the flag, and a suggested next step. The review priority index is a heuristic for triage, not a legal, factual or accessibility certification."),
    P("Corrections are optional", "h2"),
    P("A verified terminology fix can be applied with one click. Broader rewrites remain suggestions and require a new review. A person can also dismiss a finding with an explanation. Unsupported claims are never silently rewritten into supposedly verified claims."),
    P("Uncertain image analysis", "h2"),
    P("Exact approved-image fingerprints and missing alt text are rule checks. Optional AI visual observations are separate, unverified leads. An authorised reviewer must inspect the original image and confirm or dismiss a lead before it counts as a finding."),
    PageBreak(),
]

# 4. Capabilities.
story += [
    P("03  /  CAPABILITIES", "eyebrow"),
    P("What teams can do today", "h1"),
    two_cards([
        ("Guideline library", "Store versioned messaging, terminology, claim policy, evidence and asset rules. Stage changes as proposals before activation."),
        ("Text and document intake", "Review plain text, Markdown, text-based PDF and DOCX. Findings map to document pages or paragraphs."),
        ("Image guidance", "Check approved SHA-256 fingerprints, alternative text, explicit text contrast and graphic palette heuristics."),
        ("Grounded AI review", "With consent, ask Gemini for semantic tone and claim leads. Keep only findings tied to an active approved source and visible draft excerpt."),
        ("Human workflow", "Persist drafts, comments, assignments, source versions, revision history and separate reviewer decisions."),
        ("Governance insights", "See repeated issue categories, policy gaps, reviewer outcomes and drafts affected by guideline changes."),
    ]),
    Spacer(1, 16),
    P("Format and workflow boundaries", "h2"),
    data_table(["Input", "Supported path", "Important boundary"], [
        ("Text", "Write in the guest example or saved workspace.", "Shared drafts are limited to 10,000 characters."),
        ("PDF / DOCX", "Extract text in the browser; review page or paragraph-linked sections.", "Scanned PDFs need OCR; visual page coordinates are not preserved."),
        ("TXT / Markdown", "Import as plain text for review.", "Layout and rich formatting are not preserved."),
        ("Images", "Attach a graphic for asset and accessibility checks.", "Hash matching proves exact identity; palette checks are heuristics."),
    ], [93, 215, CONTENT_W - 308]),
    Spacer(1, 13),
    panel("<b>Policy changes have consequences:</b> Activating an updated guideline can recheck saved drafts and move affected content back into a review-needed state. The public policy lab demonstrates the concept without changing a shared database.", PALE),
    PageBreak(),
]

# 5. Architecture, trust and controls.
story += [
    P("04  /  ARCHITECTURE & TRUST", "eyebrow"),
    P("How it works behind the screen", "h1"),
    P("BrandCheck is a React and TypeScript application running on Cloudflare Workers. The browser performs document extraction; the same-origin API handles authenticated workspace actions and optional AI review."),
    data_table(["Layer", "Responsibility"], [
        ("Browser", "Editor, document extraction, local checks, file preview and review interface."),
        ("Worker API", "Validates requests with Zod, checks membership and roles, coordinates review and audit actions."),
        ("Cloudflare D1", "Stores workspaces, policies, drafts, members, findings and append-only activity events."),
        ("Google Gemini", "Receives consented draft text and approved sources for semantic review; a separate opt-in visual action can send a reduced preview."),
    ], [110, CONTENT_W - 110]),
    Spacer(1, 15),
    P("Privacy and human control", "h2"),
    two_cards([
        ("Local file processing", "PDF and DOCX binaries are parsed in the browser. A creator chooses whether extracted text is saved to a workspace."),
        ("Explicit AI disclosure", "The interface identifies when Gemini is used and asks for consent before sending saved draft material or a reduced image preview."),
        ("Server permissions", "Workspace roles are enforced in API actions. A creator cannot approve their own submitted content."),
        ("Versioned decisions", "A reviewer decides on a frozen revision. Later edits invalidate approval and require a new check."),
    ]),
    Spacer(1, 15),
    panel("<b>Reliability principle:</b> Source IDs and versions must match active approved material. Simulated AI output and unsupported model explanations cannot become real source-grounded findings. If AI is unavailable, rule-based review remains available.", MINT),
    Spacer(1, 8),
    P("Technology: React 19, TypeScript, Vinext/Vite, Cloudflare Workers and D1, Drizzle ORM, Zod, PDF.js, Mammoth, fflate and Google Gemini 3.1 Flash-Lite.", "small"),
    PageBreak(),
]

# 6. Scope, current maturity and links.
story += [
    P("05  /  SCOPE & NEXT STEPS", "eyebrow"),
    P("Built to be useful, with clear limits", "h1"),
    P("The public guest example, document desk and policy lab are available without a login. Saved collaboration requires authentication. Local verification of the current source passed 47 service and helper tests, strict TypeScript and a production build."),
    P("Known limits", "h2"),
    data_table(["Area", "Current limit"], [
        ("Facts and claims", "Checks against approved internal evidence. It does not independently crawl the web or certify a third-party study."),
        ("Documents", "Text-based extraction only: up to 15 MB, 40 PDF pages, 400 DOCX paragraphs and 80,000 extracted characters."),
        ("Visual review", "No full logo-clearance measurement, OCR for scanned documents or automatic aesthetic judgement. AI visual leads need human confirmation."),
        ("Integrations", "Public GitHub JSON policy import is on demand. Private CMS connectors and automatic background synchronization are future work."),
        ("Operations", "The audit log records application events; it is not a cryptographically signed compliance certificate."),
    ], [105, CONTENT_W - 105]),
    Spacer(1, 14),
    P("What we would build next", "h2"),
    P("1. Private document and CMS connectors so approved guidance stays current across tools.<br/>2. Scanned-document OCR and richer image checks with reviewer verification.<br/>3. More flexible approval routing, notifications and governance reporting."),
    Spacer(1, 13),
    panel('<b>Try it:</b> <link href="https://brandcheck.manasj1234567890.workers.dev/example" color="#225A42">Interactive example</link>  |  <link href="https://brandcheck.manasj1234567890.workers.dev/documents" color="#225A42">Document desk</link>  |  <link href="https://brandcheck.manasj1234567890.workers.dev/policy-lab" color="#225A42">Policy lab</link>  |  <link href="https://github.com/Manas-Jain-24/brandcheck" color="#225A42">Source repository</link>', MINT),
    Spacer(1, 16),
    P("BrandCheck is a pre-publication governance tool. Its findings support a person making a decision; they do not replace legal, factual or accessibility review where those are required.", "small"),
]

doc.build(story, onFirstPage=page, onLaterPages=page)
print(OUT)
