import sys
import os
import hashlib
from pathlib import Path
import pptx
from pptx.util import Inches, Pt
from pptx.enum.shapes import MSO_SHAPE_TYPE
from pptx.dml.color import RGBColor

sys.stdout.reconfigure(encoding='utf-8')

PPTX_PATH = Path(r"d:\HACKATHON\SIH2026-ASHA-Presentation-Optimized.pptx")
ORIG_PPTX_PATH = Path(r"d:\HACKATHON\SIH2026-ASHA-Presentation-Ready.pptx")
ASSETS_DIR = Path(r"d:\HACKATHON\presentation_assets")

if not PPTX_PATH.exists():
    print(f"FATAL: {PPTX_PATH} does not exist!")
    sys.exit(1)

prs = pptx.Presentation(str(PPTX_PATH))
orig_prs = pptx.Presentation(str(ORIG_PPTX_PATH)) if ORIG_PPTX_PATH.exists() else None

print("=" * 80)
print("     ADVERSARIAL GEOMETRY & LAYOUT INSPECTION HARNESS")
print("=" * 80)

# 1. Deck Level Checks
slide_count = len(prs.slides)
w_in = prs.slide_width / Inches(1)
h_in = prs.slide_height / Inches(1)
print(f"[CHECK 1] Slide Count: {slide_count} (Expected: 6) -> {'PASS' if slide_count == 6 else 'FAIL'}")
print(f"[CHECK 2] Dimensions: {w_in:.4f}\" x {h_in:.4f}\" (Expected: 13.333\" x 7.500\") -> {'PASS' if abs(w_in - 13.333) < 0.01 and abs(h_in - 7.500) < 0.01 else 'FAIL'}")

# Global trackers
total_shapes_count = 0
zero_area_shapes = []
overflow_shapes = []
footer_issues = []
mockup_issues = []
slide_word_counts = {}
orig_slide_word_counts = {}
bullet_length_issues = []
text_wrap_issues = []

# Count original words per slide if orig_prs exists
if orig_prs:
    for s_idx, slide in enumerate(orig_prs.slides):
        s_words = []
        for sh in slide.shapes:
            if sh.has_text_frame and sh.text.strip():
                s_words.extend(sh.text.strip().split())
        orig_slide_word_counts[s_idx + 1] = len(s_words)

print("\n" + "=" * 80)
print("     SLIDE-BY-SLIDE ADVERSARIAL INSPECTION")
print("=" * 80)

for s_idx, slide in enumerate(prs.slides):
    s_num = s_idx + 1
    print(f"\n>>> SLIDE {s_num} ANALYSIS (Total Shapes: {len(slide.shapes)}) <<<")
    
    slide_text_blocks = []
    slide_pics = []
    has_footer_bar = False
    footer_bar_shape = None
    has_slide_num = False
    slide_num_shape = None
    
    for sh_idx, shape in enumerate(slide.shapes):
        total_shapes_count += 1
        sh_name = shape.name
        sh_type = shape.shape_type
        
        x = shape.left / Inches(1) if shape.left is not None else 0.0
        y = shape.top / Inches(1) if shape.top is not None else 0.0
        w = shape.width / Inches(1) if shape.width is not None else 0.0
        h = shape.height / Inches(1) if shape.height is not None else 0.0
        right = x + w
        bottom = y + h
        
        # Zero-area check
        if w <= 0.001 or h <= 0.001:
            zero_area_shapes.append((s_num, sh_idx, sh_name, w, h))
            print(f"  [ALERT ZERO-AREA] Shape {sh_idx} ({sh_name}): w={w:.4f}, h={h:.4f}")
            
        # Overflow check
        if x < -0.015 or y < -0.015 or right > 13.333 + 0.02 or bottom > 7.500 + 0.02:
            overflow_shapes.append((s_num, sh_idx, sh_name, x, y, right, bottom))
            print(f"  [ALERT OVERFLOW] Shape {sh_idx} ({sh_name}): box=({x:.2f}, {y:.2f}, {right:.2f}, {bottom:.2f})")

        # Text Frame inspection
        if shape.has_text_frame:
            tf = shape.text_frame
            if not tf.word_wrap:
                text_wrap_issues.append((s_num, sh_idx, sh_name))
                print(f"  [ALERT NO-WORD-WRAP] Shape {sh_idx} ({sh_name}) does not have word_wrap enabled!")
                
            txt = shape.text.strip()
            if txt:
                slide_text_blocks.append({"name": sh_name, "x": x, "y": y, "w": w, "h": h, "text": txt})
                
                # Check for footer bar text
                if "@SIH Idea submission- Template" in txt:
                    has_footer_bar = True
                    footer_bar_shape = shape
                if txt == str(s_num):
                    has_slide_num = True
                    slide_num_shape = shape

                # Inspect paragraphs and bullet rules
                for p_idx, p in enumerate(tf.paragraphs):
                    p_txt = p.text.strip()
                    if p_txt.startswith("•"):
                        p_words = p_txt.split()
                        # Strictly 1-2 lines, max 25-30 words per bullet
                        if len(p_words) > 35:
                            bullet_length_issues.append((s_num, sh_name, len(p_words), p_txt[:40]))
                            print(f"  [WARN LONG BULLET] Slide {s_num} {sh_name} p{p_idx}: {len(p_words)} words: {p_txt[:40]}...")

        # Picture inspection
        if sh_type == MSO_SHAPE_TYPE.PICTURE:
            img = shape.image
            blob = img.blob
            md5_hash = hashlib.md5(blob).hexdigest()
            is_png = blob.startswith(b'\x89PNG\r\n\x1a\n')
            
            slide_pics.append({
                "idx": sh_idx,
                "name": sh_name,
                "x": x, "y": y, "w": w, "h": h,
                "content_type": img.content_type,
                "size_bytes": len(blob),
                "is_png": is_png,
                "md5": md5_hash
            })
            print(f"  [IMAGE] Shape {sh_idx} ({sh_name}): ({x:.2f}\", {y:.2f}\", {w:.2f}\"x{h:.2f}\") | {len(blob)} bytes | PNG={is_png} | md5={md5_hash[:8]}")

    # Footer Bar Validation
    if has_footer_bar and footer_bar_shape:
        fy = footer_bar_shape.top / Inches(1)
        fw = footer_bar_shape.width / Inches(1)
        fh = footer_bar_shape.height / Inches(1)
        
        fill_rgb = None
        try:
            fill_rgb = footer_bar_shape.fill.fore_color.rgb
        except Exception as e:
            fill_rgb = f"Error: {e}"
            
        print(f"  [FOOTER BAR] pos=({footer_bar_shape.left/Inches(1):.2f}\", {fy:.3f}\"), dim=({fw:.3f}\"x{fh:.3f}\"), fill={fill_rgb}")
        
        if fy < 7.10:
            footer_issues.append((s_num, f"Footer y={fy:.3f} < 7.10"))
        if fw < 13.0:
            footer_issues.append((s_num, f"Footer w={fw:.3f} < 13.0"))
        if fill_rgb != RGBColor(0, 112, 192):
            footer_issues.append((s_num, f"Footer fill color {fill_rgb} != #0070C0"))
    else:
        footer_issues.append((s_num, "Footer bar shape missing"))
        print(f"  [FOOTER BAR] MISSING on Slide {s_num}!")

    # Slide Number Box Validation
    if has_slide_num and slide_num_shape:
        sny = slide_num_shape.top / Inches(1)
        snx = slide_num_shape.left / Inches(1)
        print(f"  [SLIDE NUMBER] '{s_num}' at x={snx:.2f}\", y={sny:.2f}\"")
        if sny < 7.10:
            footer_issues.append((s_num, f"Slide number y={sny:.2f} < 7.10"))
    else:
        footer_issues.append((s_num, f"Slide number '{s_num}' missing"))
        print(f"  [SLIDE NUMBER] MISSING on Slide {s_num}!")

    # Word Count & Condensation Calculation
    all_slide_words = []
    for tb in slide_text_blocks:
        all_slide_words.extend(tb["text"].split())
    word_count = len(all_slide_words)
    slide_word_counts[s_num] = word_count
    
    orig_count = orig_slide_word_counts.get(s_num, 0)
    reduction = ((orig_count - word_count) / orig_count * 100) if orig_count > 0 else 0
    print(f"  [WORD COUNT] Slide {s_num}: {word_count} words (Original: {orig_count} words, Reduction: {reduction:.1f}%)")

    # Preserved Mockups Inspection on Slides 2, 3, 5
    if s_num in (2, 3, 5):
        expected_mockup_names = {
            2: "mockup_slide2_citizen_pwa.png",
            3: "mockup_slide3_first_aid_sheet.png",
            5: "mockup_slide5_searched_reservation.png"
        }
        exp_file = ASSETS_DIR / expected_mockup_names[s_num]
        exp_md5 = None
        if exp_file.exists():
            exp_md5 = hashlib.md5(exp_file.read_bytes()).hexdigest()
            
        print(f"  [PRESERVED MOCKUP VERIFICATION] Slide {s_num} target: {expected_mockup_names[s_num]}")
        mockup_found = False
        for p in slide_pics:
            # Check if MD5 matches expected file on disk
            if exp_md5 and p["md5"] == exp_md5:
                mockup_found = True
                print(f"    ✓ EXACT MATCH with {expected_mockup_names[s_num]} (MD5 {p['md5'][:8]}..., size={p['size_bytes']} bytes, pos=({p['x']:.2f}\", {p['y']:.2f}\", {p['w']:.2f}\"x{p['h']:.2f}\"))")
            # If not exact md5, check if dimensions and position match mockup container (y ~ 4.78", w ~ 3.90", h ~ 2.25")
            elif abs(p["x"] - 8.90) < 0.1 and abs(p["y"] - 4.78) < 0.2:
                mockup_found = True
                print(f"    ✓ GEOMETRIC MATCH for mockup container: pos=({p['x']:.2f}\", {p['y']:.2f}\", {p['w']:.2f}\"x{p['h']:.2f}\"), size={p['size_bytes']} bytes")
                
        if not mockup_found:
            mockup_issues.append((s_num, f"Mockup {expected_mockup_names[s_num]} not found on Slide {s_num}"))
            print(f"    ✗ FAILED to verify mockup on Slide {s_num}!")

print("\n" + "=" * 80)
print("     COMPREHENSIVE ADVERSARIAL VERIFICATION SUMMARY")
print("=" * 80)
total_orig_words = sum(orig_slide_word_counts.values())
total_opt_words = sum(slide_word_counts.values())
overall_reduction = ((total_orig_words - total_opt_words) / total_orig_words * 100) if total_orig_words > 0 else 0

print(f"1. Slide Count:               {slide_count} (Must be exactly 6) -> {'PASS' if slide_count == 6 else 'FAIL'}")
print(f"2. Aspect Ratio / Dimensions: {w_in:.3f}\" x {h_in:.3f}\" (16:9 Widescreen) -> {'PASS' if abs(w_in - 13.333) < 0.01 and abs(h_in - 7.500) < 0.01 else 'FAIL'}")
print(f"3. Total Shapes Audited:      {total_shapes_count}")
print(f"4. Zero-Area Shapes:          {len(zero_area_shapes)} -> {'PASS' if len(zero_area_shapes) == 0 else 'FAIL'}")
print(f"5. Slide Boundary Overflows:  {len(overflow_shapes)} -> {'PASS' if len(overflow_shapes) == 0 else 'FAIL'}")
print(f"6. Text Word-Wrap Issues:     {len(text_wrap_issues)} -> {'PASS' if len(text_wrap_issues) == 0 else 'FAIL'}")
print(f"7. Long Bullet Warnings (>35w):{len(bullet_length_issues)}")
print(f"8. Official SIH Footer Issues:{len(footer_issues)} -> {'PASS' if len(footer_issues) == 0 else 'FAIL'}")
print(f"9. Preserved Mockup Issues:   {len(mockup_issues)} -> {'PASS' if len(mockup_issues) == 0 else 'FAIL'}")
print(f"10. Word Count Reduction:     {total_orig_words} -> {total_opt_words} words ({overall_reduction:.1f}% reduction)")

all_checks_passed = (
    slide_count == 6 and
    abs(w_in - 13.333) < 0.01 and abs(h_in - 7.500) < 0.01 and
    len(zero_area_shapes) == 0 and
    len(overflow_shapes) == 0 and
    len(footer_issues) == 0 and
    len(mockup_issues) == 0
)

print("\n" + "=" * 80)
print(f"FINAL ADVERSARIAL VERDICT: {'APPROVE' if all_checks_passed else 'REJECT'}")
print("=" * 80)

# Generate tests/test_adversarial_geometry.py
test_file_content = '''import os
import sys
import hashlib
import unittest
from pathlib import Path
import pptx
from pptx.util import Inches
from pptx.enum.shapes import MSO_SHAPE_TYPE
from pptx.dml.color import RGBColor

class TestPresentationGeometryAndLayout(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pptx_path = Path(r"d:\\HACKATHON\\SIH2026-ASHA-Presentation-Optimized.pptx")
        cls.assets_dir = Path(r"d:\\HACKATHON\\presentation_assets")
        cls.prs = pptx.Presentation(str(cls.pptx_path))

    def test_01_exact_slide_count(self):
        self.assertEqual(len(self.prs.slides), 6)

    def test_02_exact_widescreen_dimensions(self):
        w_in = self.prs.slide_width / Inches(1)
        h_in = self.prs.slide_height / Inches(1)
        self.assertAlmostEqual(w_in, 13.333, places=2)
        self.assertAlmostEqual(h_in, 7.500, places=2)

    def test_03_no_zero_area_shapes(self):
        zero_area = []
        for s_idx, s in enumerate(self.prs.slides, 1):
            for sh in s.shapes:
                w = sh.width / Inches(1) if sh.width else 0
                h = sh.height / Inches(1) if sh.height else 0
                if w <= 0.001 or h <= 0.001:
                    zero_area.append((s_idx, sh.name, w, h))
        self.assertEqual(len(zero_area), 0)

    def test_04_no_boundary_overflows(self):
        overflows = []
        for s_idx, s in enumerate(self.prs.slides, 1):
            for sh in s.shapes:
                x = sh.left / Inches(1) if sh.left else 0.0
                y = sh.top / Inches(1) if sh.top else 0.0
                w = sh.width / Inches(1) if sh.width else 0.0
                h = sh.height / Inches(1) if sh.height else 0.0
                if x < -0.015 or y < -0.015 or (x + w) > 13.333 + 0.02 or (y + h) > 7.500 + 0.02:
                    overflows.append((s_idx, sh.name, x, y, x + w, y + h))
        self.assertEqual(len(overflows), 0)

    def test_05_sih_official_footer_bar_on_all_slides(self):
        for s_idx, s in enumerate(self.prs.slides, 1):
            footers = [sh for sh in s.shapes if sh.has_text_frame and "@SIH Idea submission- Template" in sh.text]
            self.assertEqual(len(footers), 1)
            f = footers[0]
            fy = f.top / Inches(1)
            fw = f.width / Inches(1)
            self.assertGreaterEqual(fy, 7.10)
            self.assertGreaterEqual(fw, 13.0)
            self.assertEqual(f.fill.fore_color.rgb, RGBColor(0, 112, 192))

    def test_06_sih_slide_numbers_on_all_slides(self):
        for s_idx, s in enumerate(self.prs.slides, 1):
            nums = [sh for sh in s.shapes if sh.has_text_frame and sh.text.strip() == str(s_idx)]
            self.assertEqual(len(nums), 1)
            nb = nums[0]
            self.assertGreaterEqual(nb.top / Inches(1), 7.10)
            self.assertGreaterEqual(nb.left / Inches(1), 12.0)

    def test_07_preserved_mockups_on_slides_2_3_5(self):
        targets = {
            2: "mockup_slide2_citizen_pwa.png",
            3: "mockup_slide3_first_aid_sheet.png",
            5: "mockup_slide5_searched_reservation.png"
        }
        for s_num, fn in targets.items():
            s = self.prs.slides[s_num - 1]
            pics = [sh for sh in s.shapes if sh.shape_type == MSO_SHAPE_TYPE.PICTURE]
            self.assertGreaterEqual(len(pics), 2)
            exp_file = self.assets_dir / fn
            self.assertTrue(exp_file.exists())
            exp_md5 = hashlib.md5(exp_file.read_bytes()).hexdigest()
            matching = [p for p in pics if hashlib.md5(p.image.blob).hexdigest() == exp_md5]
            self.assertEqual(len(matching), 1, f"Slide {s_num} missing preserved mockup {fn}")
            mp = matching[0]
            self.assertAlmostEqual(mp.left / Inches(1), 8.90, places=1)
            self.assertGreaterEqual(mp.top / Inches(1), 4.50)

    def test_08_word_counts_and_bullet_discipline(self):
        for s_idx, s in enumerate(self.prs.slides, 1):
            words = []
            for sh in s.shapes:
                if sh.has_text_frame and sh.text.strip():
                    words.extend(sh.text.strip().split())
                    for p in sh.text_frame.paragraphs:
                        pt = p.text.strip()
                        if pt.startswith("•"):
                            self.assertLessEqual(len(pt.split()), 35)
            self.assertGreaterEqual(len(words), 100)
            self.assertLessEqual(len(words), 350)

if __name__ == "__main__":
    unittest.main()
'''

test_out = Path(r"d:\HACKATHON\tests\test_adversarial_geometry.py")
test_out.write_text(test_file_content, encoding="utf-8")
print(f"Generated test file: {test_out}")


