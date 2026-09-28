import requests

SUPABASE_URL = "https://bvdxpticernfggvaczdb.supabase.co"
SUPABASE_ANON_KEY = "sb_publishable_ELEmxIw9Nde-WWvhhj4CZg_4Mh4QdTZ"

headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    "Content-Type": "application/json"
}

res = requests.get(f"{SUPABASE_URL}/rest/v1/admitted_patients?select=*", headers=headers)
print("=== Admitted Patients ===")
print(res.json())
