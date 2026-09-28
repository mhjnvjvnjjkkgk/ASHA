import pptx
from pptx import Presentation

prs = Presentation(r"d:\HACKATHON\SIH2026-ASHA-Presentation-Optimized.pptx")

for i, slide in enumerate(prs.slides, 1):
    print(f"\n--- SLIDE {i} Shapes ---")
    shapes = list(slide.shapes)
    for idx, s in enumerate(shapes):
        l = s.left / 914400.0
        t = s.top / 914400.0
        w = s.width / 914400.0
        h = s.height / 914400.0
        print(f"  Shape {idx} [{s.name}]: left={l:.2f}\", top={t:.2f}\", w={w:.2f}\", h={h:.2f}\", r={l+w:.2f}\", b={t+h:.2f}\"")
        
    # Check pairwise intersection
    for j in range(len(shapes)):
        for k in range(j + 1, len(shapes)):
            s1, s2 = shapes[j], shapes[k]
            # Ignore header/footer/slide num
            l1, t1, w1, h1 = s1.left/914400.0, s1.top/914400.0, s1.width/914400.0, s1.height/914400.0
            l2, t2, w2, h2 = s2.left/914400.0, s2.top/914400.0, s2.width/914400.0, s2.height/914400.0
            r1, b1 = l1 + w1, t1 + h1
            r2, b2 = l2 + w2, t2 + h2
            
            # Allow footer (y >= 7.12) vs num_box (y >= 7.12)
            if t1 >= 7.10 and t2 >= 7.10:
                continue
                
            # Intersect check
            inter_w = max(0.0, min(r1, r2) - max(l1, l2))
            inter_h = max(0.0, min(b1, b2) - max(t1, t2))
            if inter_w > 0.05 and inter_h > 0.05:
                print(f"  COLLISION between {s1.name} and {s2.name}: overlap w={inter_w:.2f}\", h={inter_h:.2f}\"")
