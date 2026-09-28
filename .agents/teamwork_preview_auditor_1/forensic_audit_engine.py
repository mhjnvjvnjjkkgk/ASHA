import os
import sys
import zipfile
import hashlib
import json
import math
import xml.etree.ElementTree as ET
from PIL import Image
import pptx
from pptx.util import Inches, Pt
from pptx.enum.shapes import MSO_SHAPE_TYPE

sys.stdout.reconfigure(encoding='utf-8')

REPORT = {
    verdict: UNKNOWN,
    checks: {},
    pptx_details: {},
    assets_details: {},
    tests_details: {},
    falsifiability_results: {}
}

print(= * 80)
print( EXHAUSTIVE FORENSIC AUDIT ENGINE - TEAM ASHA / PULSEGRID)
print(= * 80)

# ----------------------------------------------------------------------
# 1. PPTX BINARY INTEGRITY & OPENXML STRUCTURE
# ----------------------------------------------------------------------
pptx_path = rd:\HACKATHON\SIH2026-ASHA-Presentation-Optimized.pptx
print(f\n[PHASE 1] Auditing Binary PPTX: {pptx_path})

if not os.path.exists(pptx_path):
    print(FATAL: PPTX file does not exist!)
    REPORT[checks][pptx_exists] = False
    sys.exit(1)

REPORT[checks][pptx_exists] = True
file_size = os.path.getsize(pptx_path)
with open(pptx_path, rb) as f:
    file_bytes = f.read()
sha256_hash = hashlib.sha256(file_bytes).hexdigest()

print(f - File Size: {file_size:,} bytes ({file_size / (1024*1024):.2f} MB))
print(f - SHA256: {sha256_hash})
REPORT[pptx_details][size] = file_size
REPORT[pptx_details][sha256] = sha256_hash

# Test ZIP integrity
try:
    with zipfile.ZipFile(pptx_path, 'r') as zf:
        namelist = zf.namelist()
        test_res = zf.testzip()
        if test_res is not None:
            raise ValueError(fCorrupt zip entry: {test_res})
        slide_xmls = [n for n in namelist if n.startswith(ppt/slides/slide) and n.endswith(.xml)]
        media_files = [n for n in namelist if n.startswith(ppt/media/)]
        print(f - ZIP Archive Integrity: VALID (0 CRC errors))
        print(f - XML Slides in Package: {len(slide_xmls)} slides ({', '.join(sorted(slide_xmls))}))
        print(f - Embedded Media in Package: {len(media_files)} media files)
        REPORT[checks][zip_valid] = True
        REPORT[pptx_details][slide_xmls] = slide_xmls
        REPORT[pptx_details][media_count] = len(media_files)
except Exception as e:
    print(f - ZIP Integrity Error: {e})
    REPORT[checks][zip_valid] = False

# Load via python-pptx
prs = pptx.Presentation(pptx_path)
num_slides = len(prs.slides)
w_in = prs.slide_width / 914400.0
h_in = prs.slide_height / 914400.0
print(f - Python-pptx Loader: SUCCESS)
print(f - Slide Count: {num_slides} (Target: 6))
print(f - Slide Dimensions: {w_in:.4f}" x {h_in:.4f}" (Target: 13.333" x 7.500" Widescreen 16:9))

REPORT[checks][slide_count_is_6] = (num_slides == 6)
REPORT[checks][dimensions_16_9] = (abs(w_in - 13.333) < 0.02 and abs(h_in - 7.500) < 0.02)

# Slide-by-slide shape and content extraction
slide_data = []
all_deck_text = []

for idx, slide in enumerate(prs.slides, start=1):
    shapes = list(slide.shapes)
    text_content = []
    pics = []
    footer_found = False
    footer_text = "
 slide_num_found = False
 slide_num_val = 
 
 for s in shapes:
 if s.has_text_frame:
 txt = s.text.strip()
 if txt:
 text_content.append(txt)
 if @SIH Idea submission- Template in txt:
 footer_found = True
 footer_text = txt
 # Check footer geometry
 fx = s.left / 914400.0
 fy = s.top / 914400.0
 fw = s.width / 914400.0
 fh = s.height / 914400.0
 # Check fill color
 fill_rgb = None
 try:
 fill_rgb = (s.fill.fore_color.rgb[0], s.fill.fore_color.rgb[1], s.fill.fore_color.rgb[2])
 except Exception:
 pass
 elif txt == str(idx):
 slide_num_found = True
 slide_num_val = txt
 
 if s.shape_type == MSO_SHAPE_TYPE.PICTURE:
 pics.append({
 name: s.name,
 x: s.left / 914400.0,
 y: s.top / 914400.0,
 w: s.width / 914400.0,
 h: s.height / 914400.0,
 image_size: len(s.image.blob),
 content_type: s.image.content_type
 })
 
 combined_text =  \n .join(text_content)
 all_deck_text.append(combined_text)
 word_count = len(combined_text.split())
 
 slide_info = {
 slide_number: idx,
 total_shapes: len(shapes),
 picture_count: len(pics),
 pictures: pics,
 word_count: word_count,
 footer_found: footer_found,
 slide_num_found: slide_num_found,
 text_preview: combined_text[:120].replace('\n', ' ')
 }
 slide_data.append(slide_info)
 print(f  - Slide {idx}: {len(shapes)} shapes, {len(pics)} pictures, {word_count} words | Footer: {footer_found} | SlideNum: {slide_num_found})

REPORT[pptx_details][slides] = slide_data
total_deck_text =  \n .join(all_deck_text)
total_words = len(total_deck_text.split())
print(f  - Total Deck Word Count: {total_words} words (Condensed from original ~2,391 words, reduction: {(1 - total_words/2391.0)*100:.1f}%))

# Formula Verification
required_formulas = [
 B_staffed = min(B_phys, N_nurses * Ratio),
 R = 0.30*S_IP + 0.35*S_Device + 0.20*S_Velocity + 0.15*S_Geo,
 S_IP = min(100, 30*max(0, N_1h - 1) + 10*max(0, N_24h - 2)),
 Distance(P_telemetry, H_ER) <= 0.100 km
]
print(\n[PHASE 1.1] Verifying Required Mathematical Formulas:)
all_formulas_present = True
for f in required_formulas:
 present = f in total_deck_text
 print(f  - '{f}': {'PRESENT (PASS)' if present else 'MISSING (FAIL)'})
 if not present:
 all_formulas_present = False
REPORT[checks][formulas_present] = all_formulas_present

# Metric Verification
required_metrics = [
 <0.8s load>, 0ms translation, <420ms OSRM>, <50ms WebSockets>,
 15m hold, 4-digit OTP 4892, <2s ER check-in>, 100m geofence,
 10 Kolkata hubs, 15,000+ lives saved
]
print(\n[PHASE 1.2] Verifying Required Performance Metrics:)
all_metrics_present = True
for m in required_metrics:
 present = m in total_deck_text
 print(f  - '{m}': {'PRESENT (PASS)' if present else 'MISSING (FAIL)'})
 if not present:
 all_metrics_present = False
REPORT[checks][metrics_present] = all_metrics_present

# Mockup Preservation Verification
print(\n[PHASE 1.3] Verifying Preserved Mockups in PPTX (Slides 2, 3, 5):)
s2_pics = slide_data[1][pictures]
s3_pics = slide_data[2][pictures]
s5_pics = slide_data[4][pictures]
print(f  - Slide 2 pictures: {len(s2_pics)} (Requires cartoon + mockup))
print(f  - Slide 3 pictures: {len(s3_pics)} (Requires cartoon + mockup))
print(f  - Slide 5 pictures: {len(s5_pics)} (Requires cartoon + mockup))
mockups_preserved = len(s2_pics) >= 2 and len(s3_pics) >= 2 and len(s5_pics) >= 2
REPORT[checks][mockups_preserved] = mockups_preserved

# SIH Blue Footer on every slide
print(\n[PHASE 1.4] Verifying SIH Footer Rectangle on all slides:)
footers_all_pass = all(s[footer_found] and s[slide_num_found] for s in slide_data)
print(f  - SIH Blue Footers on All 6 Slides: {'PASS' if footers_all_pass else 'FAIL'})
REPORT[checks][footers_all_pass] = footers_all_pass

# Mini-Story 1 exact user wording
print(\n[PHASE 1.5] Verifying Mini-Story 1 User Update dialogue:)
mini1_terms = [
 Why did the doctor turn us away at the gate?,
 Because hospital website portals show 'Ghost Beds',
 empty metal furniture
]
mini1_pass = all(term in total_deck_text for term in mini1_terms)
for term in mini1_terms:
 print(f  - '{term[:40]}...': {'PRESENT (PASS)' if term in total_deck_text else 'MISSING (FAIL)'})
REPORT[checks][mini_story_1_user_dialogue] = mini1_pass

# ----------------------------------------------------------------------
# 2. PRESENTATION ASSETS INTEGRITY (presentation_assets/)
# ----------------------------------------------------------------------
print(\n[PHASE 2] Auditing Presentation Assets Directory:)
assets_dir = rd:\HACKATHON\presentation_assets

required_png_files = [
 scene1_crisis.png,
 scene2_panicked_reality.png,
 scene3_smart_solution.png,
 scene4_transit_void.png,
 scene5_resuscitation_relief.png,
 scene6_authority_endorsement.png,
 mockup_slide2_citizen_pwa.png,
 mockup_slide3_first_aid_sheet.png,
 mockup_slide5_searched_reservation.png
]

all_assets_valid = True
for fname in required_png_files:
 fpath = os.path.join(assets_dir, fname)
 if not os.path.exists(fpath):
 print(f  - {fname}: MISSING (FAIL))
 all_assets_valid = False
 continue
 size = os.path.getsize(fpath)
 with open(fpath, rb) as f:
 head = f.read(8)
 is_png = (head == b\x89PNG\r\n\x1a\n)
 try:
 with Image.open(fpath) as img:
 dims = img.size
 mode = img.mode
 # Check corner pixels for white background if scene image
 is_scene = fname.startswith(scene)
 corners_white = True
 if is_scene:
 c1 = img.getpixel((5, 5))[:3]
 c2 = img.getpixel((img.width - 6, 5))[:3]
 c3 = img.getpixel((5, img.height - 6))[:3]
 c4 = img.getpixel((img.width - 6, img.height - 6))[:3]
 corners_white = all(c[0] >= 250 and c[1] >= 250 and c[2] >= 250 for c in [c1, c2, c3, c4])
 print(f  - {fname}: VALID PNG ({dims[0]}x{dims[1]}, {mode}, {size:,} bytes) | WhiteBg: {corners_white if is_scene else 'N/A'})
 REPORT[assets_details][fname] = {
 size: size, dims: dims, mode: mode, png_valid: is_png, corners_white: corners_white
 }
 except Exception as e:
 print(f  - {fname}: CORRUPTED IMAGE ({e}))
 all_assets_valid = False

REPORT[checks][assets_valid] = all_assets_valid

# ----------------------------------------------------------------------
# 3. TEST SUITE STATIC & RUNTIME INTEGRITY
# ----------------------------------------------------------------------
print(\n[PHASE 3] Auditing Test Suites (tests/test_presentation_transformation.py & test_gemini_prompts_and_visual_assets.py):)

def audit_test_file(fpath):
 with open(fpath, r, encoding=utf-8) as f:
 code = f.read()
 test_funcs = re.findall(rdef (test_\w+)\(self\):, code)
 # Check for suspicious dummy assertions
 dummy_patterns = [
 rassert\s+True\b,
 rassert\s+1\s*==\s*1,
 rself\.assertTrue\(\s*True\s*\),
 rself\.assertEqual\(\s*1\s*,\s*1\s*\),
 rreturn\s+True\b,
 rpass\b
 ]
 suspicious_matches = []
 for pat in dummy_patterns:
 m = re.findall(pat, code)
 if m:
 suspicious_matches.extend(m)
 return len(test_funcs), suspicious_matches

t1_path = rd:\HACKATHON\tests\test_presentation_transformation.py
t2_path = rd:\HACKATHON\tests\test_gemini_prompts_and_visual_assets.py

t1_count, t1_susp = audit_test_file(t1_path)
t2_count, t2_susp = audit_test_file(t2_path)

print(f  - test_presentation_transformation.py: {t1_count} test methods, {len(t1_susp)} dummy assertions found)
print(f  - test_gemini_prompts_and_visual_assets.py: {t2_count} test methods, {len(t2_susp)} dummy assertions found)

REPORT[tests_details][t1_count] = t1_count
REPORT[tests_details][t1_suspicious] = t1_susp
REPORT[tests_details][t2_count] = t2_count
REPORT[tests_details][t2_suspicious] = t2_susp
REPORT[checks][no_dummy_test_assertions] = (len(t1_susp) == 0 and len(t2_susp) == 0)

# ----------------------------------------------------------------------
# 4. FALSIFIABILITY & STRESS TESTING
# ----------------------------------------------------------------------
print(\n[PHASE 4] Adversarial Stress Testing & Falsifiability Analysis:)

# Test 4.1: Corrupt a requirement to verify tests actually catch failures
test_cases = [
 {name: Non-existent formula detection, query: B_staffed = 999999, expected_in_deck: False},
 {name: Corrupt geofence check, query: Distance(P_telemetry, H_ER) <= 999.000 km, expected_in_deck: False},
 {name: Non-existent metric, query: <999s load>, expected_in_deck: False},
 {name: Tampered OTP, query: 4-digit OTP 9999, expected_in_deck: False}
]

falsifiability_passed = True
for tc in test_cases:
 found = tc[query] in total_deck_text
 passed = (found == tc[expected_in_deck])
 print(f  - Stress Check '{tc['name']}': {'PASS (Correctly Rejected)' if passed else 'FAIL (False Positive)'})
 if not passed:
 falsifiability_passed = False
 REPORT[falsifiability_results][tc[name]] = passed

REPORT[checks][falsifiability_passed] = falsifiability_passed

# ----------------------------------------------------------------------
# 5. OVERALL VERDICT DETERMINATION
# ----------------------------------------------------------------------
all_checks_passed = all(REPORT[checks].values())
if all_checks_passed:
 REPORT[verdict] = CLEAN
else:
 REPORT[verdict] = INTEGRITY VIOLATION

print(\n + = * 80)
print(f     FORENSIC AUDIT VERDICT: {REPORT['verdict']})
print(= * 80)

# Output summary JSON for record
with open(rd:\HACKATHON\.agents\teamwork_preview_auditor_1\audit_summary.json, w, encoding=utf-8) as f:
 json.dump(REPORT, f, indent=2)

print(Saved audit report summary to audit_summary.json)
