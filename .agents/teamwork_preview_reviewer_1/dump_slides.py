import pptx

prs = pptx.Presentation(r"d:/HACKATHON/SIH2026-ASHA-Presentation-Optimized.pptx")
with open(r"d:/HACKATHON/.agents/teamwork_preview_reviewer_1/slide_text_dump.txt", "w", encoding="utf-8") as f:
    for i, slide in enumerate(prs.slides, 1):
        f.write(f"\n==================== SLIDE {i} ====================\n")
        slide_words = 0
        for s in slide.shapes:
            if s.has_text_frame:
                f.write(f"\n--- Shape: {s.name} (left={s.left/914400.0:.2f}\", top={s.top/914400.0:.2f}\", w={s.width/914400.0:.2f}\", h={s.height/914400.0:.2f}\") ---\n")
                for p in s.text_frame.paragraphs:
                    txt = p.text.strip()
                    if txt:
                        words = len(txt.split())
                        slide_words += words
                        f.write(f"  [{words}w] {txt}\n")
        f.write(f"\n>> SLIDE {i} TOTAL WORDS: {slide_words}\n")
