import urllib.request
import json

SUPABASE_URL = 'https://bvdxpticernfggvaczdb.supabase.co'
SUPABASE_KEY = 'sb_publishable_ELEmxIw9Nde-WWvhhj4CZg_4Mh4QdTZ'

req = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/active_holds?select=*",
    headers={
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
)

try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        print(f"Total holds in Supabase: {len(data)}")
        for h in data:
            print(h)
except Exception as e:
    print("Error fetching from Supabase:", e)
