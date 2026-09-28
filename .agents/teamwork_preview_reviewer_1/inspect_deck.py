import sys
import pptx
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE

pptx_path = r"d:/HACKATHON/SIH2026-ASHA-Presentation-Optimized.pptx"
prs = Presentation(pptx_path)

print(f"Slide count: {len(prs.slides)}")
print(f"Slide width: {prs.slide_width / 914400.0:.3f} in, height: {prs.slide_height / 914400.0:.3f} in")

total_words = 0
for i, slide in enumerate(prs.slides, 1):
    slide_text = []
    images = []
    shapes_info = []
    footer_bar = None
    footer_text = None
    slide_num_text = None
    
    for shape in slide.shapes:
        if shape.has_text_frame:
            t = shape.text.strip()
            if t:
                slide_text.append(t)
            if "@SIH Idea submission" in t or "@SIH" in t:
                footer_text = t
            if str(i) == t.strip():
                slide_num_text = t
        if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
            images.append(shape)
        # Check if shape looks like footer bar
        top_in = shape.top / 914400.0
        h_in = shape.height / 914400.0
        w_in = shape.width / 914400.0
        if top_in >= 7.0 and w_in >= 12.0:
            footer_bar = shape
            
    full_text = " ".join(slide_text)
    words = len(full_text.split())
    total_words += words
    print(f"\n==================== SLIDE {i} ====================")
    print(f"Word count: {words}")
    print(f"Shapes count: {len(slide.shapes)}")
    print(f"Images count: {len(images)}")
    for img in images:
        print(f"  Image: {img.name} (left={img.left/914400.0:.2f}\", top={img.top/914400.0:.2f}\", w={img.width/914400.0:.2f}\", h={img.height/914400.0:.2f}\")")
    if footer_bar:
        color_info = "unknown"
        try:
            fill = footer_bar.fill
            if fill.type == 1: # solid
                color_info = f"{fill.fore_color.rgb}"
        except Exception as e:
            color_info = str(e)
        print(f"  Footer bar found: top={footer_bar.top/914400.0:.2f}\", height={footer_bar.height/914400.0:.2f}\", fill={color_info}")
    else:
        print("  WARNING: Footer bar NOT found by geometry!")
    print(f"  Footer text: {footer_text}")
    print(f"  Slide number text: {slide_num_text}")

print(f"\n==================================================")
print(f"TOTAL DECK WORD COUNT: {total_words}")
