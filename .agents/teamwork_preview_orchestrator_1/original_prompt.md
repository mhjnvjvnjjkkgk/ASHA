# Teamwork Project Prompt

Transform the text-heavy 6-slide ASHA presentation into a visually engaging, story-driven deck featuring clean bullet points, flowcharts, and a multi-step consistent vector cartoon story (Grandmother chest pain crisis → Mother panicking/calling → Teen Granddaughter booking via ASHA → Doctor saving life at hospital).

Working directory: d:\HACKATHON
Integrity mode: development

## Requirements

### R1. Slide-by-Slide Text Condensation & Information Hierarchy
- Condense long narrative paragraphs across all 6 slides into crisp, high-impact bullet points (maximum 3-4 bullet points per section, strictly 1-2 lines each).
- Preserve critical mathematical formulas, ESI triage facts, and technical metrics while removing clutter.

### R2. Multi-Step Vector Cartoon Storyboard (Characters & Narrative Flow)
- Develop a 4-to-5 step episodic visual storyline:
  - **Scene 1 (The Crisis):** Elderly Grandmother clutches chest/palpitations in acute distress.
  - **Scene 2 (The Panicked Reality):** Mother (30s/40s) panics, frantically making phone calls with zero beds/answers.
  - **Scene 3 (The Smart Solution):** Tech-savvy Teen Granddaughter (15-17) steps in with phone: discovers ASHA, speaks symptom in Bengali, locks hospital bed with 15-min countdown.
  - **Scene 4 (The Resuscitation & Relief):** Emergency arrival at hospital; Doctor confirms timely Golden Hour arrival saved grandmother's life; family relieved and grateful.
- Include conversational character dialogue bubbles (e.g. Q&A or thought bubbles) to answer common user/judge concerns.

### R3. Character-Consistent Gemini Image Generation Prompts
- Generate exact, production-ready prompts tailored for Google Gemini / Imagen.
- Enforce strict visual consistency: flat modern vector illustration style, clean white/isolated background, distinct character design tokens (Grandmother in saree, Mother in kurta, Granddaughter in modern casuals with smartphone, ER Doctor in lab coat with stethoscope).

## Acceptance Criteria

### Content Optimization
- [ ] Text density across slides reduced by ~50-60%, eliminating walls of text.
- [ ] Every slide retains clear visual breathing room, punchy bold labels, and readable typography.

### Story & Illustration Specification
- [ ] Exact scene breakdown mapping story panels to specific slides (e.g. Crisis on Slide 2, Solution on Slide 2/3, Resolution on Slide 5).
- [ ] Character consistency design guidelines defined (palettes, attire, expressions).
- [ ] 5+ detailed Gemini prompts with isolated white backgrounds ready for image generation.
