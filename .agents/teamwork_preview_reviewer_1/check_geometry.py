import pptx
from pptx import Presentation

prs = Presentation(r"d:\HACKATHON\SIH2026-ASHA-Presentation-Optimized.pptx")

print("=== CHECKING SHAPE BOUNDING BOXES AND BULLETS ===")

for i, slide in enumerate(prs.slides, 1):
    print(f"\n--- SLIDE {i} ---")
    shapes = list(slide.shapes)
    
    # Check overlaps and bounds
    for s in shapes:
        left = s.left / 914400.0
        top = s.top / 914400.0
        width = s.width / 914400.0
        height = s.height / 914400.0
        bottom = top + height
        right = left + width
        
        # Check if shape extends past slide boundary (13.333 x 7.500)
        if bottom > 7.51 or right > 13.34:
            print(f"  WARNING: Shape {s.name} exceeds slide boundary! bottom={bottom:.2f}\", right={right:.2f}\"")
            
        # Check if card overlaps with footer (footer top is 7.12")
        if top < 7.12 and bottom > 7.12 and s.name != "Rectangle 7" and "footer" not in s.name.lower():
            # If shape is not the footer itself
            print(f"  COLLISION: Shape {s.name} (top={top:.2f}\", bottom={bottom:.2f}\") overlaps footer bar (7.12\")")

    # Check bullet counts per text frame
    for s in shapes:
        if s.has_text_frame:
            paras = [p for p in s.text_frame.paragraphs if p.text.strip().startswith("•")]
            if len(paras) > 4:
                print(f"  VIOLATION: Shape {s.name} has {len(paras)} bullets (max allowed is 3-4)!")
            for p in paras:
                words = len(p.text.strip().split())
                if words > 25:
                    print(f"  BULLET LENGTH WARNING: {words} words in bullet: '{p.text[:50]}...'")
