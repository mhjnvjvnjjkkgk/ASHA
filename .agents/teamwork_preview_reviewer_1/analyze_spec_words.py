import json

with open(r"d:\HACKATHON\.agents\teamwork_preview_worker_m1\slide_deck_condensed.json", "r", encoding="utf-8") as f:
    d = json.load(f)

for s in d['slides']:
    s_num = s['slide_number']
    reported = s['word_count']
    bullets = []
    titles = []
    if 'zones' in s:
        for c in s['zones'].get('zone_b_content_cards', []):
            titles.append(c.get('title', ''))
            for b in c.get('bullets', []):
                bullets.append(b.get('lead', '') + ": " + b.get('text', ''))
    b_words = sum(len(b.split()) for b in bullets)
    t_words = sum(len(t.split()) for t in titles)
    h_title = len(s.get('title', '').split()) + len(s.get('subtitle', '').split())
    print(f"Slide {s_num}: reported={reported}, bullets={b_words}, card_titles={t_words}, header={h_title}, sum={b_words + t_words + h_title}")

print(f"Deck metadata actual_total_words: {d['deck_metadata']['actual_total_words']}")
