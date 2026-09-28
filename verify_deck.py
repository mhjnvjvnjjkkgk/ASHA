# verify_deck.py
import sys
import pptx
from pptx.enum.shapes import MSO_SHAPE_TYPE

sys.stdout.reconfigure(encoding='utf-8')

pptx_path = r"d:\HACKATHON\SIH2026-ASHA-Presentation-Optimized.pptx"
prs = pptx.Presentation(pptx_path)

print("=" * 80)
print("     PROGRAMMATIC VALIDATION OF GENERATED PRESENTATION DECK")
print("=" * 80)

print(f"Slide count: {len(prs.slides)}")
assert len(prs.slides) == 6, f"Expected 6 slides, got {len(prs.slides)}"

w_in = prs.slide_width / 914400.0
h_in = prs.slide_height / 914400.0
print(f"Aspect Ratio: {w_in:.3f}\" x {h_in:.3f}\"")
assert abs(w_in - 13.333) < 0.01, f"Expected 13.333\" width, got {w_in}"
assert abs(h_in - 7.500) < 0.01, f"Expected 7.500\" height, got {h_in}"

all_text = []
slide_pics = []
for i, slide in enumerate(prs.slides):
    s_text = []
    pics = []
    for shape in slide.shapes:
        if shape.has_text_frame:
            s_text.append(shape.text)
        if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
            pics.append(shape)
    s_combined = " ".join(s_text)
    all_text.append(s_combined)
    slide_pics.append(pics)
    print(f"Slide {i+1}: {len(slide.shapes)} total shapes, {len(pics)} pictures, {len(s_combined.split())} words")

deck_full_text = " ".join(all_text)

# 1. Formulas
formulas = [
    "B_staffed = min(B_phys, N_nurses * Ratio)",
    "R = 0.30*S_IP + 0.35*S_Device + 0.20*S_Velocity + 0.15*S_Geo",
    "S_IP = min(100, 30*max(0, N_1h - 1) + 10*max(0, N_24h - 2))",
    "Distance(P_telemetry, H_ER) <= 0.100 km"
]
print("\n[1] Verifying Mathematical Formulas:")
for f in formulas:
    assert f in deck_full_text, f"Formula missing in PPTX: {f}"
    print(f"    ✓ [PASS] Formula: {f}")

# 2. Metrics
metrics = [
    "<0.8s load>", "0ms translation", "<420ms OSRM>", "<50ms WebSockets>",
    "15m hold", "4-digit OTP 4892", "<2s ER check-in>", "100m geofence",
    "10 Kolkata hubs", "15,000+ lives saved"
]
print("\n[2] Verifying Technical Performance Metrics:")
for m in metrics:
    assert m in deck_full_text, f"Metric missing in PPTX: {m}"
    print(f"    ✓ [PASS] Metric: {m}")

# 3. Clinical Facts
facts = ["Semi-Fowler 45°", "300mg aspirin", "10s ABC check", "DO NOT DO warnings"]
print("\n[3] Verifying Clinical Protocols:")
for fc in facts:
    assert fc in deck_full_text, f"Clinical fact missing in PPTX: {fc}"
    print(f"    ✓ [PASS] Fact: {fc}")

# 4. User Mandate: Mockup Preservation on Slides 2, 3, 5
print("\n[4] Verifying Website/App Mockup Images on Slides 2, 3, 5:")
assert len(slide_pics[1]) >= 2, f"Slide 2 must have at least 2 pictures (cartoon + mockup), found {len(slide_pics[1])}"
assert len(slide_pics[2]) >= 2, f"Slide 3 must have at least 2 pictures (cartoon + mockup), found {len(slide_pics[2])}"
assert len(slide_pics[4]) >= 2, f"Slide 5 must have at least 2 pictures (cartoon + mockup), found {len(slide_pics[4])}"
print("    ✓ [PASS] Slide 2 has preserved citizen PWA mockup & cartoon panel.")
print("    ✓ [PASS] Slide 3 has preserved active hold pass mockup & cartoon panel.")
print("    ✓ [PASS] Slide 5 has preserved hospital admin command desk mockup & cartoon panel.")

# 5. Mini-Story 1 User Update
print("\n[5] Verifying Mini-Story 1 User Instruction Update:")
assert "Why did the doctor turn us away at the gate?" in deck_full_text, "Aarav question missing in PPTX"
assert "Because hospital website portals show 'Ghost Beds'" in deck_full_text, "Chhotu answer missing in PPTX"
assert "empty metal furniture" in deck_full_text, "Ghost bed furniture explanation missing in PPTX"
print("    ✓ [PASS] Mini-Story 1 user wording verified verbatim.")

# 6. Official SIH Blue Footer Bar on Every Slide
print("\n[6] Verifying Official SIH Blue Footer Bar across all slides:")
for i, slide in enumerate(prs.slides):
    slide_num = i + 1
    footers = [s for s in slide.shapes if s.has_text_frame and "@SIH Idea submission- Template" in s.text]
    assert len(footers) == 1, f"Slide {slide_num} missing official SIH footer bar"
    # Check slide number
    num_boxes = [s for s in slide.shapes if s.has_text_frame and s.text.strip() == str(slide_num)]
    assert len(num_boxes) == 1, f"Slide {slide_num} missing slide number '{slide_num}'"
    print(f"    ✓ [PASS] Slide {slide_num}: Footer bar and number '{slide_num}' verified.")

print("\n" + "=" * 80)
print("     ALL PRESENTATION DECK VALIDATIONS PASSED PERFECTLY")
print("=" * 80)
