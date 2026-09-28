import os
from supabase import create_client

url = "https://bvdxpticernfggvaczdb.supabase.co"
key = "sb_publishable_ELEmxIw9Nde-WWvhhj4CZg_4Mh4QdTZ"

supabase = create_client(url, key)

res = supabase.from_('active_holds').update({'status': 'CANCELLED'}).eq('status', 'ACTIVE').execute()
print("Cancelled all active holds in Supabase:", len(res.data or []))
