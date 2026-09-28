r"""
build_deck.py
Generates the production-ready 6-slide PowerPoint presentation deck:
d:\HACKATHON\SIH2026-ASHA-Presentation-Optimized.pptx
Adhering to:
- 16:9 widescreen format (13.333" x 7.500")
- 3-zone architecture (Header, Condensed Content Cards, Storyboard / Mockup Slot, Bottom Flowchart)
- All 4 mathematical formulas verbatim
- All 10 technical performance metrics verbatim with exact <...> brackets
- All clinical first-aid facts verbatim
- Strictly preserving all 3 website/app image mockups on Slides 2, 3, 5
- Inserting all cartoon story panels (Scenes 1-5, 6)
- Embedding the 5 storybook mini-stories and punchy emotional dialogues (<12-15 words)
- Including the official SIH bottom blue footer bar (#0070C0) on every slide (Slides 1 to 6)
"""

import os
import sys
from pathlib import Path
import pptx
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

sys.stdout.reconfigure(encoding='utf-8')

# Colors
C_DARK = RGBColor(15, 23, 42)          # Slate 900
C_MUTED = RGBColor(71, 85, 105)        # Slate 600
C_LIGHT_BG = RGBColor(248, 250, 252)   # Slate 50
C_CARD_BG = RGBColor(255, 255, 255)    # White
C_BORDER = RGBColor(226, 232, 240)     # Slate 200
C_TEAL = RGBColor(13, 148, 136)        # Teal 600
C_TEAL_DARK = RGBColor(15, 118, 110)   # Teal 700
C_TEAL_LIGHT = RGBColor(204, 251, 241) # Teal 100
C_CRIMSON = RGBColor(225, 29, 72)      # Rose 600
C_CRIMSON_LIGHT = RGBColor(255, 228, 230) # Rose 100
C_AMBER = RGBColor(217, 119, 6)        # Amber 600
C_AMBER_LIGHT = RGBColor(254, 243, 199) # Amber 100
C_BLUE_LIGHT = RGBColor(239, 246, 255) # Blue 50
C_SIH_BLUE = RGBColor(0, 112, 192)     # Official SIH Blue (#0070C0)

ASSETS_DIR = Path(r"d:\HACKATHON\presentation_assets")
OUTPUT_PPTX = Path(r"d:\HACKATHON\SIH2026-ASHA-Presentation-Optimized.pptx")

prs = pptx.Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.500)
blank_layout = prs.slide_layouts[6] # Blank slide

def add_header(slide, pill_text, title_text, subtitle_text, breadcrumb_text):
    """Zone A: Standardized Top Header Bar"""
    header_box = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.50), Inches(0.12), Inches(12.333), Inches(0.90))
    header_box.fill.solid()
    header_box.fill.fore_color.rgb = C_DARK
    header_box.line.color.rgb = C_DARK
    
    tf = header_box.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.20)
    tf.margin_right = Inches(0.20)
    tf.margin_top = Inches(0.08)
    tf.margin_bottom = Inches(0.06)
    
    # Top Line: Pill Badge + Breadcrumb
    p0 = tf.paragraphs[0]
    p0.space_after = Pt(2)
    run_pill = p0.add_run()
    run_pill.text = f" {pill_text} "
    run_pill.font.bold = True
    run_pill.font.size = Pt(9.5)
    run_pill.font.color.rgb = C_TEAL_LIGHT
    
    run_sep = p0.add_run()
    run_sep.text = "   |   "
    run_sep.font.size = Pt(9.0)
    run_sep.font.color.rgb = RGBColor(148, 163, 184)
    
    run_bread = p0.add_run()
    run_bread.text = breadcrumb_text
    run_bread.font.size = Pt(8.5)
    run_bread.font.color.rgb = RGBColor(203, 213, 225)
    
    # Title & Subtitle Line
    p1 = tf.add_paragraph()
    p1.space_after = Pt(1)
    run_title = p1.add_run()
    run_title.text = title_text
    run_title.font.bold = True
    run_title.font.size = Pt(15.5)
    run_title.font.color.rgb = RGBColor(255, 255, 255)
    
    run_sub = p1.add_run()
    run_sub.text = f"  •  {subtitle_text}"
    run_sub.font.size = Pt(10.5)
    run_sub.font.color.rgb = C_TEAL_LIGHT

def add_sih_footer(slide, slide_num):
    """Official SIH bottom blue footer bar (#0070C0) on every slide."""
    footer = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.00), Inches(7.12), Inches(13.333), Inches(0.38))
    footer.fill.solid()
    footer.fill.fore_color.rgb = C_SIH_BLUE
    footer.line.fill.background()
    
    tf = footer.text_frame
    tf.word_wrap = True
    tf.margin_top = Inches(0.06)
    tf.margin_bottom = Inches(0.04)
    
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    run = p.add_run()
    run.text = "@SIH Idea submission- Template"
    run.font.name = "Segoe UI"
    run.font.size = Pt(10)
    run.font.bold = True
    run.font.color.rgb = RGBColor(255, 255, 255)
    
    # Right-aligned slide number box
    num_box = slide.shapes.add_textbox(Inches(12.30), Inches(7.12), Inches(0.80), Inches(0.38))
    tf_num = num_box.text_frame
    tf_num.margin_top = Inches(0.06)
    p_num = tf_num.paragraphs[0]
    p_num.alignment = PP_ALIGN.RIGHT
    r_num = p_num.add_run()
    r_num.text = str(slide_num)
    r_num.font.name = "Segoe UI"
    r_num.font.size = Pt(10)
    r_num.font.bold = True
    r_num.font.color.rgb = RGBColor(255, 255, 255)

def add_card(slide, x, y, w, h, title_text, bullets, bg_color=C_CARD_BG, border_color=C_BORDER):
    """Zone B: Standardized Content Card with bullets"""
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    card.fill.solid()
    card.fill.fore_color.rgb = bg_color
    card.line.color.rgb = border_color
    card.line.width = Pt(1.2)
    
    tf = card.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.18)
    tf.margin_right = Inches(0.18)
    tf.margin_top = Inches(0.12)
    tf.margin_bottom = Inches(0.12)
    
    # Title
    p0 = tf.paragraphs[0]
    p0.space_after = Pt(4)
    run_t = p0.add_run()
    run_t.text = title_text
    run_t.font.bold = True
    run_t.font.size = Pt(11.8)
    run_t.font.color.rgb = C_DARK
    
    # Bullets
    for i, b in enumerate(bullets):
        p = tf.add_paragraph()
        p.space_after = Pt(3)
        lead = b.get("lead", "")
        text = b.get("text", "")
        
        run_lead = p.add_run()
        run_lead.text = f"• {lead}: " if lead else "• "
        run_lead.font.bold = True
        run_lead.font.size = Pt(9.6)
        run_lead.font.color.rgb = C_DARK
        
        run_body = p.add_run()
        run_body.text = text
        run_body.font.size = Pt(9.3)
        run_body.font.color.rgb = C_MUTED
    return card

def add_speech_bubble(slide, x, y, w, h, speaker, text, bg_color=C_AMBER_LIGHT, border_color=C_AMBER):
    """Styled dialogue speech bubble"""
    bubble = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    bubble.fill.solid()
    bubble.fill.fore_color.rgb = bg_color
    bubble.line.color.rgb = border_color
    bubble.line.width = Pt(1.0)
    
    tf = bubble.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.12)
    tf.margin_right = Inches(0.12)
    tf.margin_top = Inches(0.08)
    tf.margin_bottom = Inches(0.08)
    
    p = tf.paragraphs[0]
    run_spk = p.add_run()
    run_spk.text = f"{speaker}: "
    run_spk.font.bold = True
    run_spk.font.size = Pt(9.2)
    run_spk.font.color.rgb = C_DARK
    
    run_txt = p.add_run()
    run_txt.text = f'"{text}"'
    run_txt.font.italic = True
    run_txt.font.size = Pt(9.0)
    run_txt.font.color.rgb = C_DARK
    return bubble

def add_image_safe(slide, img_path, x, y, w, h):
    """Safely insert image if file exists"""
    if os.path.exists(img_path):
        return slide.shapes.add_picture(str(img_path), Inches(x), Inches(y), width=Inches(w), height=Inches(h))
    print(f"Warning: Image path not found: {img_path}")
    return None

# ==============================================================================
# SLIDE 1: TEAM REGISTRATION, NATIONAL CRISIS & INNOVATION OVERVIEW
# ==============================================================================
print("Generating Slide 1...")
s1 = prs.slides.add_slide(blank_layout)
add_header(
    s1,
    pill_text="⚡ SIH 2026 • MEDTECH",
    title_text="ASHA: Automated System for Hospital Allocation",
    subtitle_text="Golden Hour Triage & Bed Locking",
    breadcrumb_text="● Slide 1: Crisis Overview | Slide 2 | Slide 3 | Slide 4 | Slide 5 | Slide 6"
)

# Badges Banner
badge_box = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.50), Inches(1.06), Inches(12.333), Inches(0.34))
badge_box.fill.solid()
badge_box.fill.fore_color.rgb = C_TEAL_LIGHT
badge_box.line.color.rgb = C_TEAL
tf_badge = badge_box.text_frame
tf_badge.word_wrap = True
tf_badge.margin_top = Inches(0.04)
p_b = tf_badge.paragraphs[0]
p_b.alignment = PP_ALIGN.CENTER
b_text = "TEAM ASHA  |  SHAYAK DAS  •  60-MIN GOLDEN HOUR  •  10 KOLKATA ER HUBS  •  100m GEOFENCE LOCK  •  VERNACULAR TRIAGE"
r_b = p_b.add_run()
r_b.text = b_text
r_b.font.bold = True
r_b.font.size = Pt(9.2)
r_b.font.color.rgb = C_TEAL_DARK

# Card 1: 🚨 National Crisis
add_card(
    s1,
    x=0.50, y=1.46, w=8.20, h=2.65,
    title_text="🚨 National Crisis: The Fatal Transit Void",
    bullets=[
        {"lead": "1 in 5 Reaches Care", "text": "Only 20% reach care in Golden Hour; 50% transit deaths occur before reaching a hospital."},
        {"lead": "Transit Void", "text": "Blind transit; ambulances travel without destination bed availability, causing severe fatal turnaways."},
        {"lead": "Catastrophic Rejection", "text": "Critical trauma and cardiac victims endure 2.4 hospital gate rejections on average."}
    ]
)

# Card 2: 💡 Core Breakthroughs
add_card(
    s1,
    x=0.50, y=4.22, w=8.20, h=2.80,
    title_text="💡 Core Breakthroughs: Automated Life-Saving Triage",
    bullets=[
        {"lead": "0ms Vernacular Triage", "text": "Native Bengali intake ('বুকে ব্যথা') in 0ms translation ($0 client-side regex)."},
        {"lead": "Staffed Bed Lock", "text": "Reserves beds via nurse ratio B_staffed = min(B_phys, N_nurses * Ratio), eliminating ghost beds."},
        {"lead": "Spoken 4-Digit OTP", "text": "<2s ER check-in> via 100m geofence lock; spoken admission replacing optical QR failure."}
    ]
)

# Zone C: Storyboard Scene 1 Teaser
add_image_safe(s1, ASSETS_DIR / "scene1_crisis.png", x=8.90, y=1.46, w=3.90, h=4.00)
add_speech_bubble(
    s1,
    x=8.90, y=5.56, w=3.90, h=1.46,
    speaker="Dadi (Bani Devi, 70)",
    text="My chest feels crushed... I can't catch my breath!",
    bg_color=C_CRIMSON_LIGHT,
    border_color=C_CRIMSON
)

add_sih_footer(s1, 1)

s1.notes_slide.notes_text_frame.text = (
    "SLIDE 1 SPEAKER NOTES:\n"
    "Good morning, esteemed judges. We are Team ASHA led by Shayak Das. In India today, 1 in 5 critical emergency patients die during the transit void because ambulances arrive at full emergency rooms. ASHA introduces real-time vernacular triage, atomic staffed bed reservation, and spoken OTP admission to preserve the 60-minute Golden Hour."
)

# ==============================================================================
# SLIDE 2: PROPOSED SOLUTION: ASHA RESUSCITATION GRID & GHOST BED PARADOX
# ==============================================================================
print("Generating Slide 2...")
s2 = prs.slides.add_slide(blank_layout)
add_header(
    s2,
    pill_text="⚡ PROBLEM & SOLUTION",
    title_text="PROPOSED SOLUTION: ASHA RESUSCITATION GRID",
    subtitle_text="Solving India's 1-in-5 Crisis • Halting 2.4 Gate Rejections",
    breadcrumb_text="Slide 1 | ● Slide 2: Proposed Solution | Slide 3 | Slide 4 | Slide 5 | Slide 6"
)

# Card 1: 🚨 4 Pre-Hospital Failures
add_card(
    s2,
    x=0.50, y=1.10, w=8.20, h=1.85,
    title_text="🚨 4 Pre-Hospital Failures Driving Golden Hour Mortality",
    bullets=[
        {"lead": "Fatal Rejection Loop", "text": "Ambulances endure 2.4 gate turnaways, driving 150,000+ deaths annually."},
        {"lead": "Ghost Bed Paradox", "text": "Hospital website portals count empty metal furniture, hiding zero nurses on duty."},
        {"lead": "Read-Only Portals", "text": "Static frames; reading is not reserving—by arrival, claimed beds are occupied."},
        {"lead": "En-Route Void", "text": "Panicked bystanders commit fatal errors en route without clinical guidance."}
    ]
)

# Card 2: 💡 ASHA Resuscitation Engine
add_card(
    s2,
    x=0.50, y=3.02, w=8.20, h=2.30,
    title_text="💡 ASHA Resuscitation Engine: End-to-End Lifesaving Pipeline",
    bullets=[
        {"lead": "Situational First-Aid Protocols", "text": "Semi-Fowler 45° posture, 300mg aspirin, 10s ABC check, DO NOT DO warnings."},
        {"lead": "Zero-Signup Access", "text": "Citizen PWA loads in <0.8s load> with 0ms translation from Bengali ('বুকে ব্যথা')."},
        {"lead": "Staffed Bed Math", "text": "B_staffed = min(B_phys, N_nurses * Ratio); dynamically sheds normal beds first."},
        {"lead": "15-Min Dynamic Hold", "text": "15m hold locks bed; <2s ER check-in> via 4-digit OTP 4892 with GPS tracking."}
    ]
)

# Card 3: 🥊 Competitor Defeat Matrix
add_card(
    s2,
    x=0.50, y=5.40, w=8.20, h=1.62,
    title_text="🥊 Competitor Defeat Matrix: Why Existing Systems Fail",
    bullets=[
        {"lead": "vs. DokLink", "text": "Static counts vs. ASHA nurse-staffed atomic locks with live admission guarantees."},
        {"lead": "vs. XparkAI", "text": "Slow LLMs vs. <0.8s load>, 0ms triage, <420ms OSRM> calibrated routing."},
        {"lead": "vs. 108 Emergency Dispatch", "text": "Voice queues vs. automated matching with <50ms WebSockets> cloud sync."}
    ]
)

# Zone C: Top Scene 2 Cartoon + Dialogue + Mini-Story 1 + PRESERVED MOCKUP
add_image_safe(s2, ASSETS_DIR / "scene2_panicked_reality.png", x=8.90, y=1.10, w=3.90, h=1.80)

# Mini-Story 1 Callout Box (The Ghost Bed Paradox - Aarav & Chhotu)
story1_box = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.90), Inches(2.96), Inches(3.90), Inches(1.75))
story1_box.fill.solid()
story1_box.fill.fore_color.rgb = C_AMBER_LIGHT
story1_box.line.color.rgb = C_AMBER
story1_box.line.width = Pt(1.0)
tf_s1 = story1_box.text_frame
tf_s1.word_wrap = True
tf_s1.margin_left = Inches(0.10)
tf_s1.margin_right = Inches(0.10)
tf_s1.margin_top = Inches(0.06)
tf_s1.margin_bottom = Inches(0.06)

p_s1_t = tf_s1.paragraphs[0]
r_s1_t = p_s1_t.add_run()
r_s1_t.text = "🧸 Mini-Story 1: The Ghost Bed Paradox"
r_s1_t.font.bold = True
r_s1_t.font.size = Pt(9.5)
r_s1_t.font.color.rgb = C_DARK

p_aarav = tf_s1.add_paragraph()
r_a_lead = p_aarav.add_run()
r_a_lead.text = "👦 Aarav asks: "
r_a_lead.font.bold = True
r_a_lead.font.size = Pt(8.5)
r_a_lead.font.color.rgb = C_DARK
r_a_txt = p_aarav.add_run()
r_a_txt.text = '"Look! The hospital website portal clearly says 10 beds are available! Why did the doctor turn us away at the gate?"'
r_a_txt.font.size = Pt(8.0)
r_a_txt.font.italic = True
r_a_txt.font.color.rgb = C_DARK

p_chhotu = tf_s1.add_paragraph()
r_c_lead = p_chhotu.add_run()
r_c_lead.text = "🛡️ ASHA Mascot explains: "
r_c_lead.font.bold = True
r_c_lead.font.size = Pt(8.5)
r_c_lead.font.color.rgb = C_TEAL_DARK
r_c_txt = p_chhotu.add_run()
r_c_txt.text = '"Because hospital website portals show \'Ghost Beds\'—they count empty metal furniture, but hide that zero nurses are on duty! A bed without a nurse cannot give oxygen or life-saving care. ASHA eliminates Ghost Beds by strictly counting Staffed Beds = min(Beds, Nurses × Ratio) with real nurses on duty!"'
r_c_txt.font.size = Pt(8.0)
r_c_txt.font.italic = True
r_c_txt.font.color.rgb = C_DARK

# PRESERVED MOCKUP: Citizen Mobile App Mockup (Situational First-Aid Sheet)
add_image_safe(s2, ASSETS_DIR / "mockup_slide2_citizen_pwa.png", x=8.90, y=4.78, w=3.90, h=2.25)

add_sih_footer(s2, 2)

s2.notes_slide.notes_text_frame.text = (
    "SLIDE 2 SPEAKER NOTES:\n"
    "Here we show the core clinical dilemma. Current hospital website portals display 'Ghost Beds'—beds without nurses. In Mini-Story 1, young Aarav asks why they were turned away when the portal said 10 beds were free. The ASHA mascot reveals that metal beds without nurses cannot save lives. Our preserved citizen app mockup at ashaien.vercel.app shows the live Situational First-Aid sheet rendered directly to the family."
)

# ==============================================================================
# SLIDE 3: TECHNICAL APPROACH & SYSTEM ARCHITECTURE
# ==============================================================================
print("Generating Slide 3...")
s3 = prs.slides.add_slide(blank_layout)
add_header(
    s3,
    pill_text="⚡ TECHNICAL PIPELINE",
    title_text="TECHNICAL APPROACH & SYSTEM ARCHITECTURE",
    subtitle_text="Sub-Second Resuscitation Pipeline • WebSockets & Road Snapping",
    breadcrumb_text="Slide 1 | Slide 2 | ● Slide 3: Technical Approach | Slide 4 | Slide 5 | Slide 6"
)

# Card 1: 🛠️ Pipeline Layers
add_card(
    s3,
    x=0.50, y=1.10, w=8.20, h=2.80,
    title_text="🛠️ 4-Layer Resuscitation Technical Pipeline",
    bullets=[
        {"lead": "Citizen Web PWA / Citizen PWA", "text": "React 19 + Vite bundle (<1.4MB); native Web Speech API with offline service worker caching."},
        {"lead": "In-Memory Bengali Normalizer", "text": "Regex converts 150+ colloquial phrases in 0ms translation ($0 client compute)."},
        {"lead": "Deterministic Triage Classifier", "text": "AHRQ ESI-1 to ESI-5 clinical triage with zero hallucinations or LLM latency."},
        {"lead": "Geospatial & Road Routing", "text": "PostGIS + self-hosted engine calculating calibrated routes in <420ms OSRM>."}
    ]
)

# Card 2: 🔄 4-Step Methodology
add_card(
    s3,
    x=0.50, y=3.98, w=8.20, h=3.04,
    title_text="🔄 4-Step Methodology: Speech to Bed Lock in <2 Seconds",
    bullets=[
        {"lead": "1. Voice Intake", "text": "Streams continuous speech; normalizes 'বুকে ব্যথা' to cardiac triage instantly."},
        {"lead": "2. First-Aid Trigger", "text": "Maps ESI-1 to Cardiac ICU; renders Semi-Fowler 45° sheet and 300mg aspirin warnings."},
        {"lead": "3. 15-Min Reservation", "text": "Issues 4-digit OTP 4892, decrements staffed bed counter, and starts GPS telemetry pause loop."},
        {"lead": "4. Geofence Lock", "text": "Spoken OTP verifies <2s ER check-in> via 100m geofence lock upon gate arrival."}
    ]
)

# Zone C: Top Scene 3 Cartoon + Speech Bubble + Mini-Story 2 + PRESERVED MOCKUP
add_image_safe(s3, ASSETS_DIR / "scene3_smart_solution.png", x=8.90, y=1.10, w=3.90, h=1.80)

# Mini-Story 2 Callout Box (The Invisible Shield - Maa & Riya)
story2_box = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.90), Inches(2.96), Inches(3.90), Inches(1.75))
story2_box.fill.solid()
story2_box.fill.fore_color.rgb = C_TEAL_LIGHT
story2_box.line.color.rgb = C_TEAL
story2_box.line.width = Pt(1.0)
tf_s2 = story2_box.text_frame
tf_s2.word_wrap = True
tf_s2.margin_left = Inches(0.10)
tf_s2.margin_right = Inches(0.10)
tf_s2.margin_top = Inches(0.06)
tf_s2.margin_bottom = Inches(0.06)

p_s2_t = tf_s2.paragraphs[0]
r_s2_t = p_s2_t.add_run()
r_s2_t.text = "🛡️ Mini-Story 2: The Invisible 15-Minute Shield"
r_s2_t.font.bold = True
r_s2_t.font.size = Pt(9.5)
r_s2_t.font.color.rgb = C_DARK

p_m_q = tf_s2.add_paragraph()
r_mq_lead = p_m_q.add_run()
r_mq_lead.text = "👩 Maa asks: "
r_mq_lead.font.bold = True
r_mq_lead.font.size = Pt(8.5)
r_mq_lead.font.color.rgb = C_DARK
r_mq_txt = p_m_q.add_run()
r_mq_txt.text = '"What if another patient reaches before us and takes our bed while we\'re stuck in traffic?!"'
r_mq_txt.font.size = Pt(8.0)
r_mq_txt.font.italic = True
r_mq_txt.font.color.rgb = C_DARK

p_r_a = tf_s2.add_paragraph()
r_ra_lead = p_r_a.add_run()
r_ra_lead.text = "👧 Riya explains: "
r_ra_lead.font.bold = True
r_ra_lead.font.size = Pt(8.5)
r_ra_lead.font.color.rgb = C_TEAL_DARK
r_ra_txt = p_r_a.add_run()
r_ra_txt.text = '"Don\'t worry, Ma! ASHA\'s GPS sees our car moving. It puts an invisible 15-minute shield on that bed—nobody else can take it!"'
r_ra_txt.font.size = Pt(8.0)
r_ra_txt.font.italic = True
r_ra_txt.font.color.rgb = C_DARK

p_sync = tf_s2.add_paragraph()
r_sync = p_sync.add_run()
r_sync.text = "Master Dual-App Cloud Sync: Supabase sync: <50ms WebSockets>."
r_sync.font.bold = True
r_sync.font.size = Pt(8.0)
r_sync.font.color.rgb = C_TEAL_DARK

# PRESERVED MOCKUP: Active Bed Hold Pass (15m hold countdown, OTP 4892)
add_image_safe(s3, ASSETS_DIR / "mockup_slide3_first_aid_sheet.png", x=8.90, y=4.78, w=3.90, h=2.25)

add_sih_footer(s3, 3)

s3.notes_slide.notes_text_frame.text = (
    "SLIDE 3 SPEAKER NOTES:\n"
    "Our technical approach operates with sub-second determinism. We avoid hallucinating LLMs on the critical path, relying on a 0ms regex normalizer and AHRQ ESI triage. In Mini-Story 2, teen Riya calms her mother by explaining the 15-minute GPS-backed soft lock. The preserved citizen PWA mockup demonstrates the active hold pass with OTP 4892 synchronized via Supabase WebSockets in under 50 milliseconds."
)

# ==============================================================================
# SLIDE 4: FEASIBILITY, RISKS & ANTI-HOARDING TELEMETRY
# ==============================================================================
print("Generating Slide 4...")
s4 = prs.slides.add_slide(blank_layout)
add_header(
    s4,
    pill_text="⚡ DEFENSIVE SECURITY",
    title_text="FEASIBILITY, RISKS & ANTI-HOARDING TELEMETRY",
    subtitle_text="100m Geofence Gate • Risk Scoring • Bed Integrity",
    breadcrumb_text="Slide 1 | Slide 2 | Slide 3 | ● Slide 4: Feasibility & Risks | Slide 5 | Slide 6"
)

# Card 1: 📊 Operational Feasibility
add_card(
    s4,
    x=0.50, y=1.10, w=3.80, h=4.25,
    title_text="📊 Operational Feasibility",
    bullets=[
        {"lead": "Zero-Install PWA", "text": "Runs on all mobile browsers; hospital ER desk operates on existing emergency PCs."},
        {"lead": "$0 Map Routing", "text": "Self-hosted OSRM on MeghRaj eliminates commercial map API fees."},
        {"lead": "ABDM Ready", "text": "Pre-integrated with ABDM HFR (Health Facility Registry) and FHIR standards."},
        {"lead": "Low-Bandwidth", "text": "Ultra-lean 1.4MB bundle functions seamlessly on 2G/3G mobile networks across suburban zones."}
    ]
)

# Card 2: ⚠️ Risks & Mitigations
add_card(
    s4,
    x=4.45, y=1.10, w=3.90, h=4.25,
    title_text="⚠️ Operational Risks & Defenses",
    bullets=[
        {"lead": "Bed Hoarding by Touts", "text": "50% hold cap and 100m geofence stop touts and speculative scalpers."},
        {"lead": "Night Nurse Fatigue", "text": "1-tap adjusters recompute beds; 1:2 ICU surge stretch prevents administrative burden."},
        {"lead": "Transit Traffic Jams", "text": "GPS vector pauses 15m hold moving toward ER; timer extends when progress is confirmed."},
        {"lead": "Patient Privacy", "text": "Ephemeral state; automatic 60m data purge ensures zero HIPAA/DISHA violations."}
    ]
)

# Card 3: 🛡️ Mathematical Formulations & Mini-Story 5 (Sneaky Fox)
math_card = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.50), Inches(1.10), Inches(4.33), Inches(4.25))
math_card.fill.solid()
math_card.fill.fore_color.rgb = C_BLUE_LIGHT
math_card.line.color.rgb = RGBColor(147, 197, 253)
math_card.line.width = Pt(1.2)
tf_m = math_card.text_frame
tf_m.word_wrap = True
tf_m.margin_left = Inches(0.14)
tf_m.margin_right = Inches(0.14)
tf_m.margin_top = Inches(0.10)

p_mt = tf_m.paragraphs[0]
r_mt = p_mt.add_run()
r_mt.text = "🛡️ Mathematical Formulations & Anti-Abuse"
r_mt.font.bold = True
r_mt.font.size = Pt(11.5)
r_mt.font.color.rgb = C_DARK

formulas_data = [
    ("Staffed Bed Math", "B_staffed = min(B_phys, N_nurses * Ratio)"),
    ("Risk Composite", "R = 0.30*S_IP + 0.35*S_Device + 0.20*S_Velocity + 0.15*S_Geo"),
    ("Burst IP Score", "S_IP = min(100, 30*max(0, N_1h - 1) + 10*max(0, N_24h - 2))"),
    ("100m Geofence", "Distance(P_telemetry, H_ER) <= 0.100 km")
]

for f_title, f_expr in formulas_data:
    p_f = tf_m.add_paragraph()
    p_f.space_after = Pt(2)
    r_ft = p_f.add_run()
    r_ft.text = f"• {f_title}: "
    r_ft.font.bold = True
    r_ft.font.size = Pt(9.0)
    r_ft.font.color.rgb = C_DARK
    
    r_fe = p_f.add_run()
    r_fe.text = f_expr
    r_fe.font.bold = True
    r_fe.font.size = Pt(8.5)
    r_fe.font.color.rgb = C_TEAL_DARK

# Mini-Story 5: The Sneaky Fox & Smart Risk Meter Callout
p_fox = tf_m.add_paragraph()
p_fox.space_before = Pt(4)
r_fox_title = p_fox.add_run()
r_fox_title.text = "🦊 Mini-Story 5: Sneaky Fox vs. Smart Risk Meter\n"
r_fox_title.font.bold = True
r_fox_title.font.size = Pt(9.0)
r_fox_title.font.color.rgb = C_CRIMSON

r_fox_q = p_fox.add_run()
r_fox_q.text = 'Sneaky Fox: "Can I book 30 beds from home?"\n'
r_fox_q.font.italic = True
r_fox_q.font.size = Pt(8.2)
r_fox_q.font.color.rgb = C_DARK

r_fox_a = p_fox.add_run()
r_fox_a.text = 'Chhotu: "Blocked! Attempt Burst Velocity spikes Risk R to 100!"'
r_fox_a.font.bold = True
r_fox_a.font.size = Pt(8.2)
r_fox_a.font.color.rgb = C_TEAL_DARK

# Zone D: Bottom State Ribbon (15-Minute Dynamic Soft-Lock State Machine)
ribbon = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.50), Inches(5.48), Inches(12.333), Inches(1.56))
ribbon.fill.solid()
ribbon.fill.fore_color.rgb = C_CARD_BG
ribbon.line.color.rgb = C_TEAL
ribbon.line.width = Pt(1.2)

tf_r = ribbon.text_frame
tf_r.word_wrap = True
tf_r.margin_left = Inches(0.15)
tf_r.margin_top = Inches(0.08)

p_rt = tf_r.paragraphs[0]
r_rt = p_rt.add_run()
r_rt.text = "15-Minute Dynamic Soft-Lock State Machine: Step-by-Step Lifecycle (Storyboard Scene 4)"
r_rt.font.bold = True
r_rt.font.size = Pt(10.5)
r_rt.font.color.rgb = C_TEAL_DARK

p_flow = tf_r.add_paragraph()
p_flow.space_after = Pt(2)
r_fl = p_flow.add_run()
r_fl.text = "1. Pool (50% Cap)  ➔  2. 15m Hold (OTP 4892)  ➔  3. GPS Loop Telemetry Pause  ➔  4. Gate Check-In (<2s ER check-in> within 100m geofence)"
r_fl.font.bold = True
r_fl.font.size = Pt(9.5)
r_fl.font.color.rgb = C_DARK

p_tr = tf_r.add_paragraph()
r_tr = p_tr.add_run()
r_tr.text = 'Transit Speech Bubble: "Keep Dadi sitting upright at 45°! The timer is paused because we\'re moving!"'
r_tr.font.italic = True
r_tr.font.size = Pt(9.0)
r_tr.font.color.rgb = C_CRIMSON

# Small Scene 4 Thumbnail in Ribbon
add_image_safe(s4, ASSETS_DIR / "scene4_transit_void.png", x=10.90, y=5.50, w=1.80, h=1.50)

add_sih_footer(s4, 4)

s4.notes_slide.notes_text_frame.text = (
    "SLIDE 4 SPEAKER NOTES:\n"
    "Judges frequently ask how we prevent scalping by touts. Our answer lies in rigorous mathematics and telemetry. The 15-Minute Dynamic Soft-Lock State Machine caps speculative bookings, while the multi-factor risk score R monitors burst velocity S_IP and hardware entropy. In Mini-Story 5, the Sneaky Fox tout is blocked from hoarding beds, while legitimate transit ambulances have their timer paused automatically via GPS velocity."
)

# ==============================================================================
# SLIDE 5: IMPACT, HEALTHCARE VALUE & REAL-TIME ADMIN DESK
# ==============================================================================
print("Generating Slide 5...")
s5 = prs.slides.add_slide(blank_layout)
add_header(
    s5,
    pill_text="⚡ HEALTHCARE IMPACT",
    title_text="IMPACT & REAL-TIME ADMIN DESK",
    subtitle_text="Saving 15,000+ Golden Hour Lives • 10 Kolkata Hubs",
    breadcrumb_text="Slide 1 | Slide 2 | Slide 3 | Slide 4 | ● Slide 5: Impact & Admin Sync | Slide 6"
)

# Card 1: ❤️ Citizen Impact
add_card(
    s5,
    x=0.50, y=1.10, w=8.20, h=2.70,
    title_text="❤️ Citizen Clinical Impact: Preserving the Golden Hour",
    bullets=[
        {"lead": "15,000+ Lives Saved", "text": "Guaranteed first-run admission halts 2.4 gate rejections across 10 Kolkata hubs."},
        {"lead": "Transit Void", "text": "First-Aid protocols (Semi-Fowler 45°, 300mg aspirin) stabilize patients en route."},
        {"lead": "Zero Secondary Transfers", "text": "Direct routing avoids 30-50% secondary transfer mortality."},
        {"lead": "Realistic Budget Choice", "text": "Side-by-side Govt vs. Private ER routing shields 60M families from catastrophic debt."}
    ]
)

# Card 2: 🏥 Hospital Command Desk
add_card(
    s5,
    x=0.50, y=3.92, w=8.20, h=3.10,
    title_text="🏥 Hospital Command Desk: Real-Time ER Allocation Terminal",
    bullets=[
        {"lead": "Regional Balancing", "text": "Diverts acute surges to idle staffed beds across 10 Kolkata hubs."},
        {"lead": "Live Desk", "text": "Supabase CDC delivers incoming ambulance alerts and ETAs in <50ms WebSockets>."},
        {"lead": "Staff Counter", "text": "1-tap nurse shift toggle dynamically recalibrates real-time bed capacity."},
        {"lead": "Gate Verification", "text": "Spoken 4-digit OTP 4892 enables <2s ER check-in> within 100m geofence."}
    ]
)

# Zone C: Scene 5 Cartoon + Mini-Story 4 + PRESERVED MOCKUP
add_image_safe(s5, ASSETS_DIR / "scene5_resuscitation_relief.png", x=8.90, y=1.10, w=3.90, h=1.80)

# Mini-Story 4 Callout Box (The 4 Magic Numbers - Paramedic & ER Nurse)
story4_box = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.90), Inches(2.96), Inches(3.90), Inches(1.75))
story4_box.fill.solid()
story4_box.fill.fore_color.rgb = C_BLUE_LIGHT
story4_box.line.color.rgb = RGBColor(147, 197, 253)
story4_box.line.width = Pt(1.0)
tf_s4 = story4_box.text_frame
tf_s4.word_wrap = True
tf_s4.margin_left = Inches(0.10)
tf_s4.margin_right = Inches(0.10)
tf_s4.margin_top = Inches(0.06)
tf_s4.margin_bottom = Inches(0.06)

p_s4_t = tf_s4.paragraphs[0]
r_s4_t = p_s4_t.add_run()
r_s4_t.text = "🔑 Mini-Story 4: The 4 Magic Numbers (Gate Admission)"
r_s4_t.font.bold = True
r_s4_t.font.size = Pt(9.5)
r_s4_t.font.color.rgb = C_DARK

p_p_q = tf_s4.add_paragraph()
r_pq_lead = p_p_q.add_run()
r_pq_lead.text = "🚑 Paramedic asks: "
r_pq_lead.font.bold = True
r_pq_lead.font.size = Pt(8.5)
r_pq_lead.font.color.rgb = C_DARK
r_pq_txt = p_p_q.add_run()
r_pq_txt.text = '"Do I have to fill out a 5-page admission form in the pouring rain?!"'
r_pq_txt.font.size = Pt(8.0)
r_pq_txt.font.italic = True
r_pq_txt.font.color.rgb = C_DARK

p_n_a = tf_s4.add_paragraph()
r_na_lead = p_n_a.add_run()
r_na_lead.text = "👩‍⚕️ ER Nurse explains: "
r_na_lead.font.bold = True
r_na_lead.font.size = Pt(8.5)
r_na_lead.font.color.rgb = C_TEAL_DARK
r_na_txt = p_n_a.add_run()
r_na_txt.text = '"No forms! Just say your 4 magic numbers: \'4892!\' We type it in 2 seconds, and Dadi goes straight into the ICU!"'
r_na_txt.font.size = Pt(8.0)
r_na_txt.font.italic = True
r_na_txt.font.color.rgb = C_DARK

p_pilot = tf_s4.add_paragraph()
r_pilot = p_pilot.add_run()
r_pilot.text = 'Doctor: "You arrived in the Golden Hour. She\'s safe now." (10 Kolkata hubs pilot status)'
r_pilot.font.bold = True
r_pilot.font.size = Pt(8.0)
r_pilot.font.color.rgb = C_TEAL_DARK

# PRESERVED MOCKUP: Hospital Admin Command Desk Tablet (ashait-admin.vercel.app / ashaien-admin.vercel.app)
add_image_safe(s5, ASSETS_DIR / "mockup_slide5_searched_reservation.png", x=8.90, y=4.78, w=3.90, h=2.25)

add_sih_footer(s5, 5)

s5.notes_slide.notes_text_frame.text = (
    "SLIDE 5 SPEAKER NOTES:\n"
    "Slide 5 proves the operational feasibility of our hospital command desk. In Mini-Story 4, the paramedic arrives in the pouring rain without needing to scan complex QR codes on wet phone screens; stating the 4-digit spoken OTP '4892' executes check-in in under 2 seconds. Dr. Banerjee confirms that Bani Devi was admitted within the Golden Hour. Our preserved desktop mockup shows the live triage terminal tested across 10 Kolkata hubs."
)

# ==============================================================================
# SLIDE 6: CLINICAL RESEARCH DATA ORIGIN & NATIONAL SCALABILITY
# ==============================================================================
print("Generating Slide 6...")
s6 = prs.slides.add_slide(blank_layout)
add_header(
    s6,
    pill_text="⚡ RESEARCH & SCALE",
    title_text="CLINICAL RESEARCH & NATIONWIDE SCALE",
    subtitle_text="Evidence Lineage • Zero-Capex Scaling for 10,000 Hospitals",
    breadcrumb_text="Slide 1 | Slide 2 | Slide 3 | Slide 4 | Slide 5 | ● Slide 6: Research & Scaling"
)

# Card 1: 📚 Clinical Research Lineage
add_card(
    s6,
    x=0.50, y=1.10, w=5.90, h=4.25,
    title_text="📚 Clinical Research Lineage & Evidence Base",
    bullets=[
        {"lead": "AHRQ ESI v4 Triage", "text": "5-level clinical acuity algorithm routing patients directly to clinically equipped wards."},
        {"lead": "ISCCM Staffing Standards", "text": "Statutory nurse staffing ratios (ICU 1:1, High Dependency 1:2, General Ward 1:6)."},
        {"lead": "ERC & AHA Guidelines", "text": "Semi-Fowler 45° posture, 300mg aspirin, 10s ABC check, and DO NOT DO warnings."},
        {"lead": "The Lancet Benchmarks", "text": "Empirical validation of 20% Golden Hour survival rates and secondary transfer hazards."}
    ]
)

# Card 2: 🚀 Nationwide Zero-Capex Scaling Architecture
add_card(
    s6,
    x=6.60, y=1.10, w=6.233, h=4.25,
    title_text="🚀 Nationwide Zero-Capex Scaling Architecture",
    bullets=[
        {"lead": "Zero-Capex Deploy", "text": "Hospitals onboard in 15 minutes on existing computers without hardware acquisition ($0)."},
        {"lead": "MeghRaj OSRM Grid", "text": "Self-hosted routing clusters on Government of India cloud deliver <420ms OSRM> routing at $0."},
        {"lead": "Redis TTL Keyspace Sharding", "text": "In-memory cluster managing 100,000+ concurrent 15m hold reservations effortlessly."},
        {"lead": "Live ABDM Integration", "text": "Fully interoperable with ABDM HFR; deployed live at ashaien.vercel.app with <0.8s load>."}
    ]
)

# Zone D: Bottom Scaling Ribbon & Endorsement
ribbon6 = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.50), Inches(5.48), Inches(12.333), Inches(1.56))
ribbon6.fill.solid()
ribbon6.fill.fore_color.rgb = C_CARD_BG
ribbon6.line.color.rgb = C_TEAL
ribbon6.line.width = Pt(1.2)

tf_r6 = ribbon6.text_frame
tf_r6.word_wrap = True
tf_r6.margin_left = Inches(0.15)
tf_r6.margin_top = Inches(0.08)

p_r6t = tf_r6.paragraphs[0]
r_r6t = p_r6t.add_run()
r_r6t.text = "National Grid Flow: 4-Node Zero-Capex Architecture (Storyboard Scene 6)"
r_r6t.font.bold = True
r_r6t.font.size = Pt(10.5)
r_r6t.font.color.rgb = C_TEAL_DARK

p_flow6 = tf_r6.add_paragraph()
p_flow6.space_after = Pt(2)
r_fl6 = p_flow6.add_run()
r_fl6.text = "1. ABDM HFR (10k nodes)  ➔  2. MeghRaj OSRM (<420ms)  ➔  3. Redis TTL (100k holds)  ➔  4. 108 Sync (15,000+ lives saved)"
r_fl6.font.bold = True
r_fl6.font.size = Pt(9.5)
r_fl6.font.color.rgb = C_DARK

p_end = tf_r6.add_paragraph()
r_end = p_end.add_run()
r_end.text = "Clinical Authority Endorsement: ABDM Compliance Verified, 10 Kolkata Pilot Network Operational."
r_end.font.italic = True
r_end.font.size = Pt(9.0)
r_end.font.color.rgb = C_MUTED

# Small Scene 6 Thumbnail in Ribbon
add_image_safe(s6, ASSETS_DIR / "scene6_authority_endorsement.png", x=10.90, y=5.50, w=1.80, h=1.50)

add_sih_footer(s6, 6)

s6.notes_slide.notes_text_frame.text = (
    "SLIDE 6 SPEAKER NOTES:\n"
    "To conclude, ASHA is rooted in peer-reviewed clinical research and built for zero-capex national deployment. By using existing MeghRaj infrastructure and browser PWAs, 10,000 hospitals can onboard in under 15 minutes without buying new hardware. ASHA bridges the transit void, ends ghost beds, and saves over 15,000 Indian lives every single year. Thank you."
)

prs.save(str(OUTPUT_PPTX))
print(f"SUCCESS: Saved presentation deck to {OUTPUT_PPTX}")
print(f"Verified slide count: {len(prs.slides)}")
print(f"Verified dimensions: {prs.slide_width / pptx.util.Inches(1)} x {prs.slide_height / pptx.util.Inches(1)}")
