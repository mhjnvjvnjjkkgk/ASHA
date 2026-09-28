import os
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
        cls.pptx_path = Path(r"d:\HACKATHON\SIH2026-ASHA-Presentation-Optimized.pptx")
        cls.assets_dir = Path(r"d:\HACKATHON\presentation_assets")
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
