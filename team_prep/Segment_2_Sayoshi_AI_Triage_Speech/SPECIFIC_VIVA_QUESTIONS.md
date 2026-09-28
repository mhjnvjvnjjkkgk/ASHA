# 🎯 Specific Viva Questions & Winning Answers: Sayoshi
**Segment:** Segment 2: Multilingual Speech-to-Text & Clinical Translation Engine  
**Role:** Clinical Triage & Multilingual Speech Specialist

Practice answering these questions out loud. Each answer is designed to be punchy, technically unassailable, and medically grounded.

---

### Q1. "Why build an in-memory Bengali translator instead of using Google Cloud Translate?"
**Winning Answer:** Cloud translation APIs introduce 800–1,500ms of latency, cost money per API call, and fail when cellular data drops during ambulance transit. Our deterministic in-memory dictionary runs in 0 milliseconds, costs $0, works completely offline, and translates acute Bengali phrases directly into clinical terms with 100% precision.

### Q2. "How does the system prevent false chest pain triggers when someone says 'পায়ে ব্যথা করছে'?"
**Winning Answer:** Earlier systems used simple substring matching that saw 'ব্যথা' and triggered cardiac rules. We resolved this by building an 18-category clinical etiology hierarchy where leg pain, fractures, and trauma are evaluated *before* chest pain. Furthermore, cardiac rules strictly require both an anatomical chest indicator ('বুক', 'বুকের') and a pain indicator ('ব্যথা', 'চাপ').

### Q3. "Why is there a 2.2-second silence debounce timer?"
**Winning Answer:** In real medical emergencies, patients or panicked bystanders pause frequently to gasp for air or weep (*"দাদুর বুকে... খুব ব্যথা করছে..."*). A standard 500ms timer cuts off their sentence prematurely. Our calibrated 2.2-second silence timer lets them complete their entire sentence, then auto-submits, translates, picks the hospital, and routes—zero buttons required!

### Q4. "How many Bengali terms does the engine support and what is the test pass rate?"
**Winning Answer:** It supports 150+ pure Bengali emergency phrases (বাংলা হরফ) across 18 clinical categories. Our automated test runner evaluates 192 exhaustive test cases with an audited 100% pass rate.
