"""
generate_svg_assets.py - Production-ready vector SVG asset generator for ASHA Storyboard
Enforces character consistency tokens, 60-30-10 color rule, pure white #FFFFFF isolation,
and simple, emotionally resonant dialogue lines per user instructions.
"""

import os

OUTPUT_DIR = r"d:\HACKATHON\presentation_assets"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# -----------------------------------------------------------------------------
# SVG SCENE 1: The Midnight Crisis (1:15 AM)
# Grandmother clutching chest in Levine's sign, Mother rushing in with water.
# Dialogue: "My chest feels crushed... I can't catch my breath!"
# -----------------------------------------------------------------------------
scene1_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <defs>
    <style>
      .bg { fill: #FFFFFF; }
      .skin-dadi { fill: #F0C4A4; }
      .skin-shadow-dadi { fill: #DFAB88; }
      .hair-dadi { fill: #94A3B8; }
      .saree-maroon { fill: #800020; }
      .saree-gold { fill: #D4AF37; }
      .blouse-cream { fill: #F5F5DC; }
      .skin-maa { fill: #E8BA96; }
      .hair-maa { fill: #1E293B; }
      .kurta-mustard { fill: #EAB308; }
      .dupatta-teal { fill: #0D9488; }
      .chair { fill: #334155; }
      .chair-accent { fill: #1E293B; }
      .bubble-bg { fill: #FFFFFF; stroke: #E11D48; stroke-width: 2.5; filter: drop-shadow(0 4px 12px rgba(225,29,72,0.12)); }
      .badge-bg { fill: #FFF1F2; stroke: #F43F5E; stroke-width: 1.5; }
      .text-title { font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif; font-weight: 700; }
      .text-body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
    </style>
  </defs>

  <!-- Pure White Background -->
  <rect width="1000" height="1000" class="bg" />

  <!-- Top Telemetry Pill -->
  <g transform="translate(60, 45)">
    <rect width="460" height="42" rx="21" class="badge-bg" />
    <circle cx="24" cy="21" r="7" fill="#E11D48" />
    <text x="42" y="27" font-size="16" class="text-title" fill="#9F1239">⏱️ 01:15 AM • GOLDEN HOUR CLOCK STARTS</text>
  </g>

  <!-- Scene Subtitle / Clinical Tag -->
  <g transform="translate(60, 105)">
    <rect width="210" height="28" rx="6" fill="#FEE2E2" />
    <text x="12" y="19" font-size="13" class="text-title" fill="#B91C1C">ESI-1 IMMEDIATE RESUSCITATION</text>
  </g>

  <!-- Armchair Base -->
  <g id="armchair">
    <rect x="220" y="380" width="380" height="480" rx="36" class="chair" />
    <rect x="190" y="460" width="80" height="340" rx="24" class="chair-accent" />
    <rect x="550" y="460" width="80" height="340" rx="24" class="chair-accent" />
    <rect x="250" y="700" width="320" height="160" rx="16" class="chair-accent" />
    <rect x="240" y="860" width="32" height="60" rx="8" fill="#0F172A" />
    <rect x="548" y="860" width="32" height="60" rx="8" fill="#0F172A" />
  </g>

  <!-- Grandmother (Dadi / Bani Devi, 70) -->
  <g id="grandmother" transform="translate(50, 0)">
    <path d="M 280 480 Q 360 440 440 480 L 490 780 L 230 780 Z" class="saree-maroon" />
    <path d="M 330 460 Q 360 620 370 780" stroke="#D4AF37" stroke-width="6" fill="none" />
    <path d="M 380 460 Q 400 620 420 780" stroke="#D4AF37" stroke-width="4" fill="none" />
    <polygon points="260,760 480,760 490,780 250,780" class="saree-gold" />

    <path d="M 290 440 Q 360 420 430 440 L 440 520 L 280 520 Z" class="blouse-cream" />
    <path d="M 290 440 L 400 580 L 370 600 L 270 470 Z" class="saree-maroon" />
    <path d="M 290 440 L 400 580" stroke="#D4AF37" stroke-width="5" />

    <rect x="335" y="380" width="50" height="55" rx="10" class="skin-dadi" />
    <path d="M 345 410 Q 360 415 375 410" stroke="#DFAB88" stroke-width="2" fill="none" />

    <circle cx="360" cy="310" r="70" class="skin-dadi" />
    <circle cx="290" cy="330" r="38" class="hair-dadi" />
    <path d="M 300 255 Q 360 230 420 270 Q 390 320 360 320 Q 320 310 300 255 Z" class="hair-dadi" />

    <path d="M 330 295 Q 342 305 350 295" stroke="#1E293B" stroke-width="4" fill="none" stroke-linecap="round" />
    <path d="M 370 295 Q 380 305 390 295" stroke="#1E293B" stroke-width="4" fill="none" stroke-linecap="round" />
    <path d="M 324 290 Q 320 295 324 300" stroke="#DFAB88" stroke-width="2" fill="none" />
    <path d="M 396 290 Q 400 295 396 300" stroke="#DFAB88" stroke-width="2" fill="none" />

    <path d="M 326 282 L 352 290" stroke="#475569" stroke-width="4" stroke-linecap="round" />
    <path d="M 388 282 L 368 290" stroke="#475569" stroke-width="4" stroke-linecap="round" />

    <path d="M 360 292 L 356 316 L 366 316" stroke="#DFAB88" stroke-width="3" fill="none" />
    <circle cx="360" cy="272" r="5" fill="#800020" />

    <rect x="325" y="285" width="28" height="22" rx="6" fill="none" stroke="#64748B" stroke-width="2.5" />
    <rect x="367" y="285" width="28" height="22" rx="6" fill="none" stroke="#64748B" stroke-width="2.5" />
    <line x1="353" y1="295" x2="367" y2="295" stroke="#64748B" stroke-width="2.5" />

    <ellipse cx="360" cy="340" rx="14" ry="10" fill="#881337" />
    <path d="M 350 334 Q 360 330 370 334" stroke="#FFF" stroke-width="2" fill="none" />

    <path d="M 270 480 Q 300 520 345 530" stroke="#800020" stroke-width="42" stroke-linecap="round" fill="none" />
    <circle cx="355" cy="530" r="22" class="skin-dadi" />
    <path d="M 345 520 Q 360 520 365 530 Q 355 545 345 540" fill="#DFAB88" />
    <circle cx="325" cy="520" r="16" fill="none" stroke="#F59E0B" stroke-width="4" />
    <circle cx="320" cy="517" r="16" fill="none" stroke="#F59E0B" stroke-width="3" />

    <path d="M 440 480 Q 480 540 520 560" stroke="#800020" stroke-width="38" stroke-linecap="round" fill="none" />
    <circle cx="530" cy="565" r="18" class="skin-dadi" />
  </g>

  <!-- Mother (Maa / Ananya, 42) Rushing in with Water Glass -->
  <g id="mother" transform="translate(560, 160)">
    <path d="M 120 320 Q 180 290 230 320 L 250 640 L 90 640 Z" class="kurta-mustard" />
    <path d="M 160 310 L 175 360 L 190 310" stroke="#FFFFFF" stroke-width="4" fill="none" />

    <path d="M 120 320 Q 100 450 110 580 Q 130 580 140 450 Z" class="dupatta-teal" />

    <circle cx="175" cy="180" r="60" class="skin-maa" />
    <path d="M 120 180 Q 130 110 200 130 Q 230 160 235 220 Q 200 170 150 190 Z" class="hair-maa" />
    <ellipse cx="235" cy="225" rx="18" ry="32" class="hair-maa" />
    <circle cx="175" cy="155" r="4" fill="#E11D48" />

    <ellipse cx="155" cy="175" rx="10" ry="12" fill="#FFFFFF" />
    <circle cx="157" cy="175" r="5" fill="#0F172A" />
    <ellipse cx="195" cy="175" rx="10" ry="12" fill="#FFFFFF" />
    <circle cx="193" cy="175" r="5" fill="#0F172A" />

    <path d="M 145 160 Q 155 150 168 158" stroke="#0F172A" stroke-width="3" fill="none" />
    <path d="M 182 158 Q 195 150 205 160" stroke="#0F172A" stroke-width="3" fill="none" />

    <ellipse cx="175" cy="210" rx="12" ry="14" fill="#881337" />

    <path d="M 130 330 Q 80 370 60 410" stroke="#EAB308" stroke-width="30" stroke-linecap="round" fill="none" />
    <circle cx="55" cy="415" r="16" class="skin-maa" />
    <polygon points="35,395 75,395 70,445 40,445" fill="#E0F2FE" stroke="#38BDF8" stroke-width="2" opacity="0.9" />
    <path d="M 40,415 Q 55,405 70,420" fill="#38BDF8" opacity="0.6" />
    <circle cx="48" cy="385" r="3" fill="#38BDF8" />
    <circle cx="68" cy="390" r="2.5" fill="#38BDF8" />

    <g transform="translate(-10, 460)">
      <rect width="130" height="26" rx="6" fill="#FEE2E2" stroke="#EF4444" stroke-width="1.2" />
      <text x="8" y="17" font-size="11" class="text-title" fill="#B91C1C">⚠️ DO NOT GIVE WATER</text>
    </g>
  </g>

  <!-- Simplified Emotionally Resonant Dialogue Bubble (Dadi - Pain) -->
  <g transform="translate(180, 160)">
    <path d="M 0,0 L 360,0 Q 380,0 380,20 L 380,90 Q 380,110 360,110 L 140,110 L 100,140 L 110,110 L 20,110 Q 0,110 0,90 Z" class="bubble-bg" />
    <text x="24" y="42" font-size="18" class="text-title" fill="#0F172A">Dadi (70):</text>
    <text x="24" y="74" font-size="18" class="text-title" fill="#E11D48">"My chest feels crushed...</text>
    <text x="24" y="98" font-size="18" class="text-title" fill="#E11D48"> I can't catch my breath!"</text>
  </g>

  <!-- Bottom Context Banner -->
  <g transform="translate(60, 920)">
    <rect width="880" height="45" rx="10" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
    <text x="25" y="28" font-size="14" class="text-body" fill="#475569">
      <tspan font-weight="700" fill="#0F172A">Scene 1 • Acute Angina Onset:</tspan> Transmural myocardial ischemia (STEMI). Levine's sign clutched fist indicates severe occlusion.
    </text>
  </g>
</svg>
"""

# -----------------------------------------------------------------------------
# SVG SCENE 2: The Panicked Reality &amp; Ghost Beds
# -----------------------------------------------------------------------------
scene2_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <defs>
    <style>
      .bg { fill: #FFFFFF; }
      .skin-maa { fill: #E8BA96; }
      .skin-shadow-maa { fill: #DFAB88; }
      .hair-maa { fill: #1E293B; }
      .kurta-mustard { fill: #EAB308; }
      .dupatta-teal { fill: #0D9488; }
      .bubble-bg { fill: #FFFFFF; stroke: #E11D48; stroke-width: 2.5; filter: drop-shadow(0 4px 12px rgba(225,29,72,0.12)); }
      .tag-reject { fill: #FFF1F2; stroke: #E11D48; stroke-width: 1.5; }
      .text-title { font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif; font-weight: 700; }
      .text-body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
    </style>
  </defs>

  <rect width="1000" height="1000" class="bg" />

  <!-- Top Telemetry Pill -->
  <g transform="translate(60, 45)">
    <rect width="440" height="42" rx="21" fill="#FFF1F2" stroke="#E11D48" stroke-width="1.5" />
    <circle cx="24" cy="21" r="7" fill="#E11D48" />
    <text x="42" y="27" font-size="16" class="text-title" fill="#9F1239">⏱️ 01:25 AM • T = 10:00 (50 MIN REMAINING)</text>
  </g>

  <!-- Problem Tag -->
  <g transform="translate(60, 105)">
    <rect width="260" height="28" rx="6" fill="#FEE2E2" />
    <text x="12" y="19" font-size="13" class="text-title" fill="#B91C1C">THE FATAL 2.4 GATE REJECTION CYCLE</text>
  </g>

  <!-- Mother Central Figure (Ananya, 42) in Overwhelming Frantic Panic -->
  <g id="mother_panic" transform="translate(260, 180)">
    <path d="M 130 380 Q 230 350 330 380 L 360 760 L 100 760 Z" class="kurta-mustard" />
    <path d="M 120 380 Q 90 520 110 680 Q 140 680 150 520 Z" class="dupatta-teal" />
    <path d="M 210 370 L 230 430 L 250 370" stroke="#FFFFFF" stroke-width="5" fill="none" />

    <rect x="205" y="270" width="50" height="70" rx="12" class="skin-maa" />
    <circle cx="230" cy="210" r="95" class="skin-maa" />

    <path d="M 140 200 Q 160 90 260 110 Q 320 150 325 240 Q 270 170 200 190 Z" class="hair-maa" />
    <path d="M 130 220 Q 110 260 125 310" stroke="#1E293B" stroke-width="8" fill="none" />
    <path d="M 320 220 Q 345 270 335 320" stroke="#1E293B" stroke-width="8" fill="none" />
    <circle cx="230" cy="165" r="6" fill="#E11D48" />

    <!-- Right Hand Clutched to Forehead in Agony / Grief -->
    <path d="M 130 400 Q 90 320 150 170" stroke="#EAB308" stroke-width="36" stroke-linecap="round" fill="none" />
    <circle cx="160" cy="160" r="24" class="skin-maa" />
    <path d="M 148 150 Q 165 145 180 155" fill="#DFAB88" />

    <!-- Left Hand Holding Smartphone to Ear -->
    <path d="M 330 400 Q 370 320 310 230" stroke="#EAB308" stroke-width="36" stroke-linecap="round" fill="none" />
    <rect x="295" y="210" width="26" height="50" rx="6" fill="#0F172A" />
    <circle cx="305" cy="245" r="18" class="skin-maa" />

    <path d="M 185 185 Q 200 170 215 185" stroke="#0F172A" stroke-width="4.5" fill="none" />
    <path d="M 245 185 Q 260 170 275 185" stroke="#0F172A" stroke-width="4.5" fill="none" />

    <ellipse cx="200" cy="205" rx="14" ry="16" fill="#FFFFFF" stroke="#0F172A" stroke-width="2" />
    <circle cx="202" cy="205" r="7" fill="#0F172A" />
    <ellipse cx="260" cy="205" rx="14" ry="16" fill="#FFFFFF" stroke="#0F172A" stroke-width="2" />
    <circle cx="258" cy="205" r="7" fill="#0F172A" />

    <path d="M 200 222 Q 195 245 198 260" stroke="#38BDF8" stroke-width="3.5" fill="none" stroke-linecap="round" />
    <path d="M 260 222 Q 265 245 262 260" stroke="#38BDF8" stroke-width="3.5" fill="none" stroke-linecap="round" />

    <ellipse cx="230" cy="255" rx="18" ry="18" fill="#881337" />
    <path d="M 218 248 Q 230 242 242 248" stroke="#FFFFFF" stroke-width="3" fill="none" />
  </g>

  <!-- Rejection Speech Callouts from Hospitals -->
  <g transform="translate(680, 220)">
    <g transform="translate(0, 0)">
      <rect width="250" height="70" rx="12" class="tag-reject" />
      <circle cx="30" cy="35" r="14" fill="#E11D48" />
      <text x="24" y="41" font-size="16" fill="#FFFFFF" font-weight="bold">✕</text>
      <text x="56" y="30" font-size="15" class="text-title" fill="#9F1239">NO ICU BEDS</text>
      <text x="56" y="52" font-size="12" class="text-body" fill="#BE123C">Govt Hospital • Divert</text>
    </g>
    <g transform="translate(20, 95)">
      <rect width="250" height="70" rx="12" class="tag-reject" />
      <circle cx="30" cy="35" r="14" fill="#E11D48" />
      <text x="24" y="41" font-size="16" fill="#FFFFFF" font-weight="bold">✕</text>
      <text x="56" y="30" font-size="15" class="text-title" fill="#9F1239">LINE DISCONNECTED</text>
      <text x="56" y="52" font-size="12" class="text-body" fill="#BE123C">Continuous Busy Tone</text>
    </g>
    <g transform="translate(0, 190)">
      <rect width="265" height="85" rx="12" fill="#FEF2F2" stroke="#DC2626" stroke-width="1.8" />
      <text x="18" y="28" font-size="14" class="text-title" fill="#991B1B">🚨 GHOST BED PARADOX</text>
      <text x="18" y="50" font-size="12" class="text-body" fill="#7F1D1D">Portal: "4 Beds Open"</text>
      <text x="18" y="70" font-size="12" class="text-title" fill="#B91C1C">Nurse: "No staff! Cannot admit!"</text>
    </g>
  </g>

  <!-- Simplified Emotionally Resonant Dialogue Bubble (Maa - Panic) -->
  <g transform="translate(70, 240)">
    <path d="M 0,0 L 320,0 Q 340,0 340,20 L 340,110 Q 340,130 320,130 L 260,130 L 280,160 L 220,130 L 20,130 Q 0,130 0,110 Z" class="bubble-bg" />
    <text x="24" y="40" font-size="18" class="text-title" fill="#0F172A">Maa (42):</text>
    <text x="24" y="72" font-size="18" class="text-title" fill="#E11D48">"Every hospital line is busy!</text>
    <text x="24" y="98" font-size="18" class="text-title" fill="#E11D48"> No ICU beds anywhere?!"</text>
  </g>

  <!-- Bottom Context Banner -->
  <g transform="translate(60, 920)">
    <rect width="880" height="45" rx="10" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
    <text x="25" y="28" font-size="14" class="text-body" fill="#475569">
      <tspan font-weight="700" fill="#0F172A">Scene 2 • The Systemic Trap:</tspan> Static portals show metal frames (B_phys), not staffed beds. 75-110 min wasted in blind phone triage.
    </text>
  </g>
</svg>
"""

# -----------------------------------------------------------------------------
# SVG SCENE 3: The Smart Solution
# -----------------------------------------------------------------------------
scene3_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <defs>
    <style>
      .bg { fill: #FFFFFF; }
      .skin-riya { fill: #F0C4A4; }
      .hair-riya { fill: #0F172A; }
      .hoodie-teal { fill: #0D9488; }
      .hoodie-accent { fill: #FFFFFF; }
      .jeans-dark { fill: #1E293B; }
      .phone-chassis { fill: #0F172A; stroke: #334155; stroke-width: 3; }
      .phone-screen { fill: #0A192F; }
      .pulse-cyan { fill: none; stroke: #00F0FF; stroke-width: 3; opacity: 0.8; }
      .bubble-bg { fill: #FFFFFF; stroke: #0D9488; stroke-width: 2.5; filter: drop-shadow(0 4px 12px rgba(13,148,136,0.15)); }
      .badge-pass { fill: #ECFDF5; stroke: #10B981; stroke-width: 1.5; }
      .text-title { font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif; font-weight: 700; }
      .text-body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
    </style>
  </defs>

  <rect width="1000" height="1000" class="bg" />

  <!-- Top Telemetry Pill -->
  <g transform="translate(60, 45)">
    <rect width="440" height="42" rx="21" fill="#F0FDFA" stroke="#0D9488" stroke-width="1.5" />
    <circle cx="24" cy="21" r="7" fill="#0D9488" />
    <text x="42" y="27" font-size="16" class="text-title" fill="#0F766E">⏱️ 01:27 AM • T = 12:00 (BED SOFT-LOCKED)</text>
  </g>

  <!-- Breakthrough Tag -->
  <g transform="translate(60, 105)">
    <rect width="320" height="28" rx="6" fill="#CCFBF1" />
    <text x="12" y="19" font-size="13" class="text-title" fill="#0F766E">0ms BENGALI VOICE TRIAGE &amp; 15-MIN SOFT-LOCK</text>
  </g>

  <!-- Teen Granddaughter (Riya, 16) Front Center -->
  <g id="granddaughter_riya" transform="translate(320, 180)">
    <path d="M 60 160 Q 20 80 40 40 Q 90 20 110 90 Z" class="hair-riya" />
    <ellipse cx="65" cy="115" rx="16" ry="10" fill="#0D9488" stroke="#14B8A6" stroke-width="2" />

    <path d="M 60 340 Q 180 320 280 340 L 300 680 L 40 680 Z" class="hoodie-teal" />
    <path d="M 50 360 L 20 540 L 50 540 L 75 360 Z" class="hoodie-teal" />
    <path d="M 60 360 L 35 540" stroke="#FFFFFF" stroke-width="4" />
    <path d="M 270 360 L 330 480" stroke="#FFFFFF" stroke-width="4" />

    <rect x="55" y="680" width="105" height="180" rx="10" class="jeans-dark" />
    <rect x="175" y="680" width="105" height="180" rx="10" class="jeans-dark" />

    <rect x="145" y="270" width="45" height="60" rx="10" class="skin-riya" />
    <circle cx="170" cy="200" r="75" class="skin-riya" />

    <path d="M 95 190 Q 130 130 200 135 Q 245 150 245 210 Q 210 170 145 180 Z" class="hair-riya" />

    <rect x="120" y="180" width="40" height="30" rx="8" fill="none" stroke="#0F172A" stroke-width="3" />
    <rect x="175" y="180" width="40" height="30" rx="8" fill="none" stroke="#0F172A" stroke-width="3" />
    <line x1="160" y1="195" x2="175" y2="195" stroke="#0F172A" stroke-width="3" />

    <circle cx="140" cy="195" r="5" fill="#0F172A" />
    <circle cx="195" cy="195" r="5" fill="#0F172A" />

    <path d="M 152 235 Q 168 252 184 235" stroke="#0F172A" stroke-width="3.5" fill="none" stroke-linecap="round" />

    <path d="M 60 350 Q 20 440 20 540" stroke="#0D9488" stroke-width="32" stroke-linecap="round" fill="none" />
    <circle cx="20" cy="545" r="16" class="skin-riya" />
    <rect x="12" y="525" width="16" height="20" rx="4" fill="#CBD5E1" stroke="#0F172A" stroke-width="2" />
    <rect x="15" y="530" width="10" height="10" rx="2" fill="#00F0FF" />

    <path d="M 270 350 Q 320 440 290 510" stroke="#0D9488" stroke-width="32" stroke-linecap="round" fill="none" />
  </g>

  <!-- Glowing Smartphone Screen -->
  <g id="smartphone_ui" transform="translate(560, 320)">
    <rect width="320" height="520" rx="36" class="phone-chassis" />
    <rect x="12" y="12" width="296" height="496" rx="26" class="phone-screen" />
    <rect x="105" y="22" width="110" height="20" rx="10" fill="#000000" />

    <circle cx="160" cy="140" r="50" class="pulse-cyan" />
    <circle cx="160" cy="140" r="75" class="pulse-cyan" stroke-width="1.5" stroke-dasharray="4,4" />

    <path d="M 80 140 L 120 140 L 135 110 L 155 170 L 175 125 L 190 150 L 205 140 L 240 140" fill="none" stroke="#00F0FF" stroke-width="4" stroke-linecap="round" />

    <rect x="30" y="210" width="260" height="120" rx="14" fill="#0F2D37" stroke="#00F0FF" stroke-width="1.8" />
    <text x="45" y="238" font-size="13" class="text-title" fill="#5EEAD4">🚨 ESI-1 CARDIAC ICU BED</text>
    <text x="45" y="262" font-size="18" class="text-title" fill="#FFFFFF">LOCKED: CNMC #04</text>
    <text x="45" y="286" font-size="12" class="text-body" fill="#99F6E4">Distance: 2.8 km • ETA: 12 min</text>
    <text x="45" y="312" font-size="12" class="text-title" fill="#34D399">⚡ 0ms Bengali Normalizer</text>

    <g transform="translate(30, 345)">
      <rect width="260" height="60" rx="12" fill="#1E293B" stroke="#F59E0B" stroke-width="1.8" />
      <text x="20" y="26" font-size="11" class="text-title" fill="#FBBF24">HOLD TIMER ACTIVE</text>
      <text x="20" y="49" font-size="20" class="text-title" fill="#F59E0B">⏱️ 14:59 (15 MIN HOLD)</text>
    </g>

    <g transform="translate(30, 420)">
      <rect width="260" height="70" rx="14" class="badge-pass" />
      <text x="20" y="28" font-size="12" class="text-title" fill="#047857">SPOKEN GATE PASS</text>
      <text x="20" y="56" font-size="28" class="text-title" fill="#065F46">🔑 OTP: 4892</text>
    </g>
  </g>

  <!-- Simplified Emotionally Resonant Dialogue Bubble (Riya - Calm Action) -->
  <g transform="translate(60, 240)">
    <path d="M 0,0 L 360,0 Q 380,0 380,20 L 380,120 Q 380,140 360,140 L 300,140 L 320,170 L 260,140 L 20,140 Q 0,140 0,120 Z" class="bubble-bg" />
    <text x="24" y="40" font-size="18" class="text-title" fill="#0F172A">Riya (16):</text>
    <text x="24" y="74" font-size="18" class="text-title" fill="#0D9488">"Ma, stop calling!</text>
    <text x="24" y="100" font-size="18" class="text-title" fill="#0D9488"> ASHA just locked a bed at</text>
    <text x="24" y="124" font-size="18" class="text-title" fill="#0D9488"> Apollo—12 mins away!"</text>
  </g>

  <!-- Bottom Context Banner -->
  <g transform="translate(60, 920)">
    <rect width="880" height="45" rx="10" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
    <text x="25" y="28" font-size="14" class="text-body" fill="#475569">
      <tspan font-weight="700" fill="#0F172A">Scene 3 • The Smart Solution:</tspan> Zero downloads, zero login. Spoken Bengali ("বুকে ব্যথা") tokenized client-side in 0ms; atomic SELECT FOR UPDATE locks bed.
    </text>
  </g>
</svg>
"""

# -----------------------------------------------------------------------------
# SVG SCENE 4: Bridging the Transit Void
# -----------------------------------------------------------------------------
scene4_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <defs>
    <style>
      .bg { fill: #FFFFFF; }
      .skin-dadi { fill: #F0C4A4; }
      .hair-dadi { fill: #94A3B8; }
      .saree-maroon { fill: #800020; }
      .skin-maa { fill: #E8BA96; }
      .hair-maa { fill: #1E293B; }
      .kurta-mustard { fill: #EAB308; }
      .dupatta-teal { fill: #0D9488; }
      .skin-riya { fill: #F0C4A4; }
      .hoodie-teal { fill: #0D9488; }
      .hair-riya { fill: #0F172A; }
      .gurney { fill: #0F766E; }
      .pillow { fill: #E2E8F0; stroke: #94A3B8; stroke-width: 2; }
      .bubble-bg { fill: #FFFFFF; stroke: #0D9488; stroke-width: 2.5; filter: drop-shadow(0 4px 12px rgba(13,148,136,0.15)); }
      .badge-ok { fill: #ECFDF5; stroke: #10B981; stroke-width: 1.5; }
      .text-title { font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif; font-weight: 700; }
      .text-body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
    </style>
  </defs>

  <rect width="1000" height="1000" class="bg" />

  <!-- Top Telemetry Pill -->
  <g transform="translate(60, 45)">
    <rect width="450" height="42" rx="21" fill="#F0FDF4" stroke="#16A34A" stroke-width="1.5" />
    <circle cx="24" cy="21" r="7" fill="#16A34A" />
    <text x="42" y="27" font-size="16" class="text-title" fill="#15803D">⏱️ 01:40 AM • T = 25:00 (TRANSIT STABILIZATION)</text>
  </g>

  <!-- Clinical Protocol Tag -->
  <g transform="translate(60, 105)">
    <rect width="320" height="28" rx="6" fill="#DCFCE7" />
    <text x="12" y="19" font-size="13" class="text-title" fill="#166534">AIIMS / ERC SEMI-FOWLER 45° EN-ROUTE PROTOCOL</text>
  </g>

  <!-- Ambulance Gurney / Backrest at strict 45-degree angle -->
  <g id="gurney_45deg" transform="translate(200, 360)">
    <path d="M 0 380 L 220 160 L 250 190 L 30 410 Z" class="gurney" />
    <path d="M 30 360 L 200 190 L 240 230 L 70 400 Z" class="pillow" />
    <rect x="0" y="380" width="380" height="50" rx="10" fill="#14B8A6" />
    <line x1="30" y1="430" x2="30" y2="520" stroke="#64748B" stroke-width="8" />
    <line x1="340" y1="430" x2="340" y2="520" stroke="#64748B" stroke-width="8" />
    <circle cx="30" cy="530" r="16" fill="#334155" />
    <circle cx="340" cy="530" r="16" fill="#334155" />
  </g>

  <!-- Grandmother Reclined Upright at 45° Angle -->
  <g id="grandmother_45" transform="translate(260, 340)">
    <path d="M 40 280 L 140 160 L 190 200 L 90 320 Z" class="saree-maroon" />
    <path d="M 90 320 L 320 320 L 320 380 L 90 380 Z" class="saree-maroon" />

    <circle cx="175" cy="140" r="50" class="skin-dadi" />
    <circle cx="130" cy="130" r="28" class="hair-dadi" />
    <path d="M 140 100 Q 180 85 220 120" stroke="#94A3B8" stroke-width="12" fill="none" />
    <circle cx="175" cy="115" r="4" fill="#800020" />

    <path d="M 160 135 Q 170 142 180 135" stroke="#1E293B" stroke-width="3" fill="none" />
    <path d="M 190 135 Q 200 142 210 135" stroke="#1E293B" stroke-width="3" fill="none" />
    <path d="M 175 160 Q 185 168 195 160" stroke="#0F172A" stroke-width="2.5" fill="none" />

    <g transform="translate(190, 80)">
      <circle cx="30" cy="30" r="28" fill="#ECFDF5" stroke="#10B981" stroke-width="2" />
      <text x="16" y="37" font-size="15" class="text-title" fill="#047857">45°</text>
    </g>
  </g>

  <!-- Mother Ananya Supporting Grandmother's Shoulder with Care -->
  <g id="mother_support" transform="translate(100, 340)">
    <path d="M 80 200 Q 140 180 180 200 L 190 450 L 70 450 Z" class="kurta-mustard" />
    <path d="M 75 200 Q 60 300 70 400" stroke="#0D9488" stroke-width="24" fill="none" />
    <circle cx="130" cy="130" r="48" class="skin-maa" />
    <path d="M 90 125 Q 110 70 170 85" stroke="#1E293B" stroke-width="16" fill="none" />
    <circle cx="130" cy="110" r="4" fill="#E11D48" />

    <path d="M 120 130 Q 130 135 140 130" stroke="#0F172A" stroke-width="2.5" fill="none" />
    <path d="M 125 152 Q 135 160 145 152" stroke="#0F172A" stroke-width="2" fill="none" />

    <path d="M 160 220 Q 230 200 270 230" stroke="#EAB308" stroke-width="26" stroke-linecap="round" fill="none" />
    <circle cx="275" cy="235" r="14" class="skin-maa" />
  </g>

  <!-- Teen Granddaughter Riya Holding Telemetry GPS Phone -->
  <g id="riya_transit" transform="translate(680, 240)">
    <path d="M 60 220 Q 140 200 200 220 L 220 540 L 40 540 Z" class="hoodie-teal" />
    <path d="M 160 100 Q 220 40 210 160" stroke="#0F172A" stroke-width="24" fill="none" />
    <circle cx="120" cy="130" r="50" class="skin-riya" />
    <rect x="90" y="115" width="26" height="20" rx="6" fill="none" stroke="#0F172A" stroke-width="2.5" />
    <rect x="125" y="115" width="26" height="20" rx="6" fill="none" stroke="#0F172A" stroke-width="2.5" />

    <path d="M 60 240 Q 20 300 0 350" stroke="#0D9488" stroke-width="24" stroke-linecap="round" fill="none" />

    <g transform="translate(-110, 310)">
      <rect width="130" height="210" rx="16" fill="#0A192F" stroke="#00F0FF" stroke-width="2.5" />
      <circle cx="65" cy="45" r="22" fill="#064E3B" stroke="#10B981" stroke-width="2" />
      <path d="M 55 45 L 63 53 L 75 37" stroke="#10B981" stroke-width="3" fill="none" />
      <text x="25" y="85" font-size="11" class="text-title" fill="#67E8F9">GPS VECTOR</text>
      <text x="18" y="105" font-size="12" class="text-title" fill="#34D399">TOWARD ER</text>
      <rect x="15" y="125" width="100" height="24" rx="6" fill="#1E293B" />
      <text x="22" y="142" font-size="10" class="text-title" fill="#FBBF24">TIMER PAUSED</text>
      <text x="18" y="175" font-size="11" class="text-body" fill="#CBD5E1">ETA: 8 mins</text>
      <text x="18" y="195" font-size="10" class="text-title" fill="#38BDF8">Speed: 38 km/h</text>
    </g>
  </g>

  <!-- Simplified Emotionally Resonant Dialogue Bubble (Riya - Care) -->
  <g transform="translate(480, 160)">
    <path d="M 0,0 L 440,0 Q 460,0 460,20 L 460,110 Q 460,130 440,130 L 260,130 L 240,160 L 220,130 L 20,130 Q 0,130 0,110 Z" class="bubble-bg" />
    <text x="24" y="38" font-size="17" class="text-title" fill="#0F172A">Riya (16):</text>
    <text x="24" y="68" font-size="17" class="text-title" fill="#0D9488">"Keep Dadi sitting upright at 45°!</text>
    <text x="24" y="94" font-size="17" class="text-title" fill="#0D9488"> The timer is paused because</text>
    <text x="24" y="118" font-size="17" class="text-title" fill="#0D9488"> we're moving!"</text>
  </g>

  <!-- Bottom Context Banner -->
  <g transform="translate(60, 920)">
    <rect width="880" height="45" rx="10" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
    <text x="25" y="28" font-size="14" class="text-body" fill="#475569">
      <tspan font-weight="700" fill="#0F172A">Scene 4 • The Transit Void Bridged:</tspan> Semi-Fowler 45° posture reduces preload by 22%. 10s GPS velocity heartbeat pauses countdown during transit.
    </text>
  </g>
</svg>
"""

# -----------------------------------------------------------------------------
# SVG SCENE 5: Resuscitation &amp; Relief in Golden Hour
# -----------------------------------------------------------------------------
scene5_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <defs>
    <style>
      .bg { fill: #FFFFFF; }
      .skin-doc { fill: #E8BA96; }
      .labcoat-white { fill: #FFFFFF; stroke: #CBD5E1; stroke-width: 2.5; }
      .scrubs-teal { fill: #14B8A6; }
      .stethoscope { fill: none; stroke: #0F172A; stroke-width: 5; }
      .skin-dadi { fill: #F0C4A4; }
      .saree-maroon { fill: #800020; }
      .hair-dadi { fill: #94A3B8; }
      .skin-maa { fill: #E8BA96; }
      .kurta-mustard { fill: #EAB308; }
      .skin-riya { fill: #F0C4A4; }
      .hoodie-teal { fill: #0D9488; }
      .monitor-bg { fill: #0F172A; stroke: #334155; stroke-width: 3; }
      .bubble-bg { fill: #FFFFFF; stroke: #10B981; stroke-width: 2.5; filter: drop-shadow(0 4px 12px rgba(16,185,129,0.18)); }
      .text-title { font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif; font-weight: 700; }
      .text-body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
    </style>
  </defs>

  <rect width="1000" height="1000" class="bg" />

  <!-- Top Telemetry Pill -->
  <g transform="translate(60, 45)">
    <rect width="470" height="42" rx="21" fill="#ECFDF5" stroke="#10B981" stroke-width="1.5" />
    <circle cx="24" cy="21" r="7" fill="#10B981" />
    <text x="42" y="27" font-size="16" class="text-title" fill="#047857">⏱️ 01:57 AM • T = 42:00 • GOLDEN HOUR PRESERVED!</text>
  </g>

  <!-- Outcome Tag -->
  <g transform="translate(60, 105)">
    <rect width="360" height="28" rx="6" fill="#D1FAE5" />
    <text x="12" y="19" font-size="13" class="text-title" fill="#047857">DOOR-TO-TREATMENT: 42 MIN • GATE DELAY: 1.8 SECONDS</text>
  </g>

  <!-- Background: Hospital Bed with Grandmother &amp; Vitals Monitor -->
  <g id="hospital_bed" transform="translate(380, 360)">
    <g transform="translate(180, -90)">
      <rect width="180" height="130" rx="12" class="monitor-bg" />
      <path d="M 20 60 L 50 60 L 60 40 L 75 80 L 90 50 L 105 65 L 120 60 L 160 60" fill="none" stroke="#34D399" stroke-width="3.5" />
      <text x="20" y="105" font-size="16" class="text-title" fill="#34D399">SpO2: 98%</text>
      <text x="110" y="105" font-size="16" class="text-title" fill="#38BDF8">HR: 72</text>
      <circle cx="160" cy="30" r="6" fill="#10B981" />
    </g>

    <rect x="0" y="140" width="460" height="40" rx="6" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2" />
    <rect x="20" y="100" width="420" height="50" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5" />

    <circle cx="120" cy="80" r="44" class="skin-dadi" />
    <circle cx="80" cy="70" r="24" class="hair-dadi" />
    <path d="M 90 50 Q 130 35 160 65" stroke="#94A3B8" stroke-width="10" fill="none" />
    <path d="M 120 85 L 125 105" stroke="#38BDF8" stroke-width="2.5" fill="none" />
    <path d="M 115 95 Q 125 105 135 95" stroke="#0F172A" stroke-width="2.5" fill="none" />
    <path d="M 140 100 L 420 100 L 420 140 L 120 140 Z" fill="#F8FAFC" />
    <path d="M 150 100 L 190 100 L 190 140 L 150 140 Z" class="saree-maroon" />

    <!-- Mother (Ananya) Weeping Tears of Joy in Namaste -->
    <g transform="translate(240, 20)">
      <circle cx="60" cy="40" r="38" class="skin-maa" />
      <path d="M 30 35 Q 40 -10 90 0" stroke="#1E293B" stroke-width="12" fill="none" />
      <path d="M 45 80 L 60 55 L 75 80 Z" fill="#E8BA96" stroke="#DFAB88" stroke-width="1.5" />
      <path d="M 30 90 Q 60 70 90 90 L 90 160 L 30 160 Z" class="kurta-mustard" />
      <circle cx="50" cy="50" r="3" fill="#38BDF8" />
    </g>

    <!-- Granddaughter (Riya) Proudly Smiling -->
    <g transform="translate(340, 20)">
      <circle cx="50" cy="40" r="36" class="skin-riya" />
      <path d="M 75 -15 Q 100 20 90 60" stroke="#0F172A" stroke-width="14" fill="none" />
      <path d="M 20 90 Q 50 75 80 90 L 80 160 L 20 160 Z" class="hoodie-teal" />
      <path d="M 40 55 Q 50 65 60 55" stroke="#0F172A" stroke-width="2.5" fill="none" />
    </g>
  </g>

  <!-- Foreground: ER Doctor (Dr. Banerjee) Giving Thumbs-Up -->
  <g id="doctor_banerjee" transform="translate(80, 240)">
    <path d="M 140 280 L 210 280 L 210 500 L 140 500 Z" class="scrubs-teal" />
    <path d="M 140 280 L 175 330 L 210 280 Z" class="scrubs-teal" />

    <path d="M 90 280 Q 175 250 260 280 L 290 680 L 60 680 Z" class="labcoat-white" />
    <path d="M 90 280 L 150 400 L 110 400 Z" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2" />
    <path d="M 260 280 L 200 400 L 240 400 Z" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2" />
    <path d="M 130 260 Q 110 370 140 430 Q 160 480 175 490" class="stethoscope" />
    <path d="M 220 260 Q 240 370 210 430" class="stethoscope" />
    <circle cx="175" cy="495" r="14" fill="#334155" stroke="#64748B" stroke-width="3" />

    <rect x="150" y="190" width="50" height="70" rx="12" class="skin-doc" />
    <circle cx="175" cy="130" r="68" class="skin-doc" />
    <path d="M 115 120 Q 125 50 210 60 Q 240 85 240 140 Q 210 90 150 100 Z" fill="#0F172A" />

    <rect x="130" y="115" width="34" height="24" rx="6" fill="none" stroke="#334155" stroke-width="3" />
    <rect x="186" y="115" width="34" height="24" rx="6" fill="none" stroke="#334155" stroke-width="3" />
    <line x1="164" y1="125" x2="186" y2="125" stroke="#334155" stroke-width="3" />

    <circle cx="147" cy="127" r="4.5" fill="#0F172A" />
    <circle cx="203" cy="127" r="4.5" fill="#0F172A" />
    <path d="M 155 165 Q 175 180 195 165" stroke="#0F172A" stroke-width="3.5" fill="none" stroke-linecap="round" />

    <g transform="translate(240, 360)">
      <circle cx="35" cy="40" r="22" class="skin-doc" />
      <rect x="25" y="0" width="18" height="35" rx="9" class="skin-doc" />
      <rect x="35" y="25" width="25" height="12" rx="6" fill="#DFAB88" />
      <rect x="35" y="38" width="23" height="12" rx="6" fill="#DFAB88" />
      <rect x="35" y="51" width="20" height="12" rx="6" fill="#DFAB88" />
    </g>

    <g transform="translate(30, 420)">
      <rect width="90" height="130" rx="10" fill="#0F172A" stroke="#334155" stroke-width="3" />
      <rect x="6" y="6" width="78" height="118" rx="6" fill="#064E3B" />
      <path d="M 25 60 L 40 75 L 65 45" stroke="#34D399" stroke-width="5" fill="none" stroke-linecap="round" />
      <text x="12" y="105" font-size="9" class="text-title" fill="#A7F3D0">OTP 4892 OK</text>
    </g>
  </g>

  <!-- Simplified Emotionally Resonant Dialogue Bubble (Doctor - Relief) -->
  <g transform="translate(420, 160)">
    <path d="M 0,0 L 500,0 Q 520,0 520,20 L 520,110 Q 520,130 500,130 L 140,130 L 110,160 L 120,130 L 20,130 Q 0,130 0,110 Z" class="bubble-bg" />
    <text x="24" y="38" font-size="17" class="text-title" fill="#0F172A">Dr. Arindam Banerjee (ER Lead):</text>
    <text x="24" y="68" font-size="17" class="text-title" fill="#059669">"You got her here in the Golden Hour.</text>
    <text x="24" y="94" font-size="17" class="text-title" fill="#059669"> She's completely safe now."</text>
  </g>

  <!-- Bottom Context Banner -->
  <g transform="translate(60, 920)">
    <rect width="880" height="45" rx="10" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
    <text x="25" y="28" font-size="14" class="text-body" fill="#475569">
      <tspan font-weight="700" fill="#0F172A">Scene 5 • The Golden Hour Won:</tspan> Total transit 42 minutes. Verbal OTP 4892 verified at 100m geofence gate in 1.8 seconds. Door-to-balloon time saved.
    </text>
  </g>
</svg>
"""

# -----------------------------------------------------------------------------
# SVG SCENE 6: Clinical Authority &amp; Nationwide Scaling Endorsement
# -----------------------------------------------------------------------------
scene6_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <defs>
    <style>
      .bg { fill: #FFFFFF; }
      .skin-doc { fill: #E8BA96; }
      .labcoat-white { fill: #FFFFFF; stroke: #CBD5E1; stroke-width: 2.5; }
      .scrubs-teal { fill: #14B8A6; }
      .stethoscope { fill: none; stroke: #0F172A; stroke-width: 5; }
      .bubble-bg { fill: #FFFFFF; stroke: #0D9488; stroke-width: 2.5; filter: drop-shadow(0 4px 12px rgba(13,148,136,0.15)); }
      .badge-auth { fill: #F0FDFA; stroke: #0D9488; stroke-width: 1.5; }
      .text-title { font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif; font-weight: 700; }
      .text-body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
    </style>
  </defs>

  <rect width="1000" height="1000" class="bg" />

  <!-- Top Header Pill -->
  <g transform="translate(60, 45)">
    <rect width="480" height="42" rx="21" fill="#F0FDFA" stroke="#0D9488" stroke-width="1.5" />
    <circle cx="24" cy="21" r="7" fill="#0D9488" />
    <text x="42" y="27" font-size="16" class="text-title" fill="#0F766E">⚡ CLINICAL RESEARCH DATA ORIGIN &amp; SCALABILITY</text>
  </g>

  <!-- Authority Badges Grid on Left -->
  <g transform="translate(60, 120)">
    <g transform="translate(0, 0)">
      <rect width="260" height="60" rx="10" class="badge-auth" />
      <text x="16" y="25" font-size="13" class="text-title" fill="#0F766E">AHRQ ESI v4 TRIAGE</text>
      <text x="16" y="46" font-size="11" class="text-body" fill="#334155">Deterministic 5-Tier Acuity</text>
    </g>
    <g transform="translate(0, 75)">
      <rect width="260" height="60" rx="10" class="badge-auth" />
      <text x="16" y="25" font-size="13" class="text-title" fill="#0F766E">ISCCM NURSE RATIOS</text>
      <text x="16" y="46" font-size="11" class="text-body" fill="#334155">1:1 ICU Staffed Bed Engine</text>
    </g>
    <g transform="translate(0, 150)">
      <rect width="260" height="60" rx="10" class="badge-auth" />
      <text x="16" y="25" font-size="13" class="text-title" fill="#0F766E">ERC / AIIMS PROTOCOLS</text>
      <text x="16" y="46" font-size="11" class="text-body" fill="#334155">Semi-Fowler 45° &amp; Aspirin</text>
    </g>
    <g transform="translate(0, 225)">
      <rect width="260" height="60" rx="10" class="badge-auth" />
      <text x="16" y="25" font-size="13" class="text-title" fill="#0F766E">ABDM NATIONAL REGISTRY</text>
      <text x="16" y="46" font-size="11" class="text-body" fill="#334155">10,000 Hospital Nodes</text>
    </g>
  </g>

  <!-- Dr. Banerjee Standing Center-Right with National Tablet -->
  <g id="doctor_scaled" transform="translate(360, 180)">
    <path d="M 120 300 L 200 300 L 200 680 L 120 680 Z" class="scrubs-teal" />
    <path d="M 120 300 L 160 350 L 200 300 Z" class="scrubs-teal" />

    <path d="M 70 300 Q 160 270 250 300 L 270 700 L 50 700 Z" class="labcoat-white" />
    <path d="M 70 300 L 130 420 L 90 420 Z" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2" />
    <path d="M 250 300 L 190 420 L 230 420 Z" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2" />

    <path d="M 110 280 Q 90 390 120 450 Q 140 500 155 510" class="stethoscope" />
    <path d="M 210 280 Q 230 390 200 450" class="stethoscope" />
    <circle cx="155" cy="515" r="14" fill="#334155" stroke="#64748B" stroke-width="3" />

    <rect x="135" y="210" width="50" height="70" rx="12" class="skin-doc" />
    <circle cx="160" cy="150" r="68" class="skin-doc" />
    <path d="M 100 140 Q 110 70 195 80 Q 225 105 225 160 Q 195 110 135 120 Z" fill="#0F172A" />

    <rect x="115" y="135" width="34" height="24" rx="6" fill="none" stroke="#334155" stroke-width="3" />
    <rect x="171" y="135" width="34" height="24" rx="6" fill="none" stroke="#334155" stroke-width="3" />
    <line x1="149" y1="145" x2="171" y2="145" stroke="#334155" stroke-width="3" />

    <circle cx="132" cy="147" r="4.5" fill="#0F172A" />
    <circle cx="188" cy="147" r="4.5" fill="#0F172A" />
    <path d="M 140 185 Q 160 200 180 185" stroke="#0F172A" stroke-width="3.5" fill="none" stroke-linecap="round" />

    <g transform="translate(190, 420)">
      <rect width="160" height="220" rx="14" fill="#0F172A" stroke="#334155" stroke-width="3" />
      <rect x="8" y="8" width="144" height="204" rx="8" fill="#064E3B" />
      <path d="M 40 90 L 65 115 L 115 65" stroke="#34D399" stroke-width="7" fill="none" stroke-linecap="round" />
      <text x="22" y="150" font-size="13" class="text-title" fill="#FFFFFF">ABDM VERIFIED</text>
      <text x="20" y="172" font-size="11" class="text-title" fill="#6EE7B7">10,000 NODES</text>
      <text x="24" y="194" font-size="10" class="text-body" fill="#A7F3D0">$0 API Capex</text>
    </g>
  </g>

  <!-- Simplified Endorsement Speech Bubble -->
  <g transform="translate(420, 60)">
    <path d="M 0,0 L 500,0 Q 520,0 520,20 L 520,110 Q 520,130 500,130 L 140,130 L 110,160 L 120,130 L 20,130 Q 0,130 0,110 Z" class="bubble-bg" />
    <text x="24" y="38" font-size="17" class="text-title" fill="#0F172A">Dr. Arindam Banerjee (National Clinical Lead):</text>
    <text x="24" y="68" font-size="17" class="text-title" fill="#0D9488">"Evidence-based protocols saved her life—</text>
    <text x="24" y="94" font-size="17" class="text-title" fill="#0D9488"> scalable across 10,000 hospitals</text>
    <text x="24" y="118" font-size="17" class="text-title" fill="#0D9488"> nationwide."</text>
  </g>

  <!-- Bottom Context Banner -->
  <g transform="translate(60, 920)">
    <rect width="880" height="45" rx="10" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
    <text x="25" y="28" font-size="14" class="text-body" fill="#475569">
      <tspan font-weight="700" fill="#0F172A">Slide 6 Authority Anchor:</tspan> Grounded in AHRQ ESI v4, ISCCM staffing standards, ERC guidelines, and ABDM national interoperability.
    </text>
  </g>
</svg>
"""

svg_assets = {
    "scene1_crisis.svg": scene1_svg,
    "scene2_panicked_reality.svg": scene2_svg,
    "scene3_smart_solution.svg": scene3_svg,
    "scene4_transit_void.svg": scene4_svg,
    "scene5_resuscitation_relief.svg": scene5_svg,
    "scene6_authority_endorsement.svg": scene6_svg,
}

for fname, content in svg_assets.items():
    filepath = os.path.join(OUTPUT_DIR, fname)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"Generated {fname} ({len(content)} bytes)")

print("All SVG assets successfully generated in:", OUTPUT_DIR)
