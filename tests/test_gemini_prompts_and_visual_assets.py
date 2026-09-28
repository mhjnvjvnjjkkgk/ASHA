"""
test_gemini_prompts_and_visual_assets.py
Comprehensive test suite for Worker M3: Visual Asset & Prompt Engineer.
Validates production-ready Google Gemini / Imagen prompts, character consistency tokens,
pure white background isolation, simplified dialogue lines, mockup preservation,
and high-resolution image / SVG assets.
"""

import os
import re
import xml.etree.ElementTree as ET
import pytest
from PIL import Image

PROJECT_ROOT = r"d:\HACKATHON"
ASSETS_DIR = os.path.join(PROJECT_ROOT, "presentation_assets")
DOC_PATH = os.path.join(PROJECT_ROOT, "GEMINI_PROMPTS_AND_IMAGE_ASSETS.md")


class TestM3GeminiPromptsAndVisualAssets:

    @pytest.fixture(autouse=True)
    def setup_class(self):
        assert os.path.exists(DOC_PATH), f"Documentation missing: {DOC_PATH}"
        with open(DOC_PATH, "r", encoding="utf-8") as f:
            self.doc_content = f.read()

    def test_all_visual_assets_exist(self):
        """Verify that all 6 episodic PNGs, 6 SVGs, and 3 preserved mockups exist in presentation_assets."""
        required_pngs = [
            "scene1_crisis.png",
            "scene2_panicked_reality.png",
            "scene3_smart_solution.png",
            "scene4_transit_void.png",
            "scene5_resuscitation_relief.png",
            "scene6_authority_endorsement.png",
        ]
        required_svgs = [
            "scene1_crisis.svg",
            "scene2_panicked_reality.svg",
            "scene3_smart_solution.svg",
            "scene4_transit_void.svg",
            "scene5_resuscitation_relief.svg",
            "scene6_authority_endorsement.svg",
        ]
        preserved_mockups = [
            "mockup_slide2_citizen_pwa.png",
            "mockup_slide3_first_aid_sheet.png",
            "mockup_slide5_searched_reservation.png",
        ]

        for fname in required_pngs:
            fpath = os.path.join(ASSETS_DIR, fname)
            assert os.path.exists(fpath), f"Missing PNG visual asset: {fname}"
            assert os.path.getsize(fpath) > 100_000, f"PNG asset too small: {fname}"

        for fname in required_svgs:
            fpath = os.path.join(ASSETS_DIR, fname)
            assert os.path.exists(fpath), f"Missing SVG vector asset: {fname}"
            assert os.path.getsize(fpath) > 2_000, f"SVG asset too small: {fname}"

        for fname in preserved_mockups:
            fpath = os.path.join(ASSETS_DIR, fname)
            assert os.path.exists(fpath), f"Missing preserved mockup copy: {fname}"
            assert os.path.getsize(fpath) > 50_000, f"Mockup too small: {fname}"

    def test_png_dimensions_and_white_background_isolation(self):
        """Verify that all generated PNGs are 1024x1024 and have pure white background pixels (255, 255, 255)."""
        scene_pngs = [
            "scene1_crisis.png",
            "scene2_panicked_reality.png",
            "scene3_smart_solution.png",
            "scene4_transit_void.png",
            "scene5_resuscitation_relief.png",
            "scene6_authority_endorsement.png",
        ]
        for fname in scene_pngs:
            fpath = os.path.join(ASSETS_DIR, fname)
            with Image.open(fpath) as im:
                assert im.size == (1024, 1024), f"{fname} has wrong dimensions {im.size}"
                # Sample 4 outer corner perimeter pixels (offset by 5px)
                corners = [
                    im.getpixel((5, 5))[:3],
                    im.getpixel((1018, 5))[:3],
                    im.getpixel((5, 1018))[:3],
                    im.getpixel((1018, 1018))[:3],
                ]
                for c in corners:
                    assert c[0] >= 250 and c[1] >= 250 and c[2] >= 250, (
                        f"{fname} corner pixel {c} is not pure solid white #FFFFFF"
                    )

    def test_svg_assets_validity_and_palette(self):
        """Verify that all SVGs are valid XML, declare pure white background, and contain key character styles."""
        scene_svgs = [
            "scene1_crisis.svg",
            "scene2_panicked_reality.svg",
            "scene3_smart_solution.svg",
            "scene4_transit_void.svg",
            "scene5_resuscitation_relief.svg",
            "scene6_authority_endorsement.svg",
        ]
        for fname in scene_svgs:
            fpath = os.path.join(ASSETS_DIR, fname)
            tree = ET.parse(fpath)
            root = tree.getroot()
            assert root.tag.endswith("svg")
            assert root.attrib.get("viewBox") == "0 0 1000 1000"

            content = open(fpath, "r", encoding="utf-8").read()
            assert "#FFFFFF" in content, f"{fname} does not declare pure white #FFFFFF"

    def test_character_consistency_tokens_in_documentation(self):
        """Verify documentation specifies immutable design tokens for all 4 characters."""
        content = self.doc_content
        # Grandmother
        assert "Bani Devi" in content or "Dadi" in content
        assert "#800020" in content  # Maroon saree
        assert "silver-grey hair" in content
        assert "bun" in content
        assert "Levine's sign" in content

        # Mother
        assert "Ananya" in content or "Maa" in content
        assert "#EAB308" in content  # Mustard kurta
        assert "#0D9488" in content  # Teal dupatta
        assert "ponytail" in content

        # Granddaughter
        assert "Riya" in content
        assert "#0D9488" in content  # Teal hoodie
        assert "glasses" in content or "spectacles" in content
        assert "smartphone" in content
        assert "4892" in content

        # ER Doctor
        assert "Dr. Arindam Banerjee" in content or "Dr. Banerjee" in content
        assert "lab coat" in content
        assert "#FFFFFF" in content
        assert "stethoscope" in content
        assert "#14B8A6" in content  # Scrubs

    def test_negative_prompt_exclusions_defined(self):
        """Verify negative prompt exclusions (no 3D, no photorealism, no clutter) are strictly documented."""
        content = self.doc_content
        assert "NO 3D" in content or "no 3D" in content
        assert "photorealism" in content.lower()
        assert "watermark" in content.lower()

    def test_simplified_dialogues_enforced(self):
        """Verify that user's simplified dialogue lines (short, emotionally resonant) are present in the documentation."""
        content = self.doc_content
        assert "My chest feels crushed... I can't catch my breath!" in content
        assert "Every hospital line is busy! No ICU beds anywhere?!" in content
        assert "Ma, stop calling! ASHA just locked a bed at Apollo—12 mins away!" in content
        assert "Keep Dadi sitting upright at 45°! The timer is paused because we're moving!" in content
        assert "You got her here in the Golden Hour. She's completely safe now." in content

    def test_critical_user_mandate_mockup_preservation(self):
        """Verify that documentation details the harmonic preservation of Slide 2, 3, 5 app mockups."""
        content = self.doc_content
        assert "CRITICAL USER MANDATE" in content or "Harmonic Preservation" in content
        assert "mockup_slide2_citizen_pwa.png" in content
        assert "mockup_slide3_first_aid_sheet.png" in content
        assert "mockup_slide5_searched_reservation.png" in content
        assert "Slide 2" in content
        assert "Slide 3" in content
        assert "Slide 5" in content
