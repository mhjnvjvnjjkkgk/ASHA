# 🎯 Specific Viva Questions & Winning Answers: Vishwaroop
**Segment:** Segment 4: Cloud Real-Time Replication & Hospital ER Command Desk  
**Role:** Cloud Realtime & ER Command Desk Engineer

Practice answering these questions out loud. Each answer is designed to be punchy, technically unassailable, and medically grounded.

---

### Q1. "How do you prevent race conditions on the last available ICU bed?"
**Winning Answer:** We execute atomic row-level mutex transactions (`SELECT FOR UPDATE`) in PostgreSQL. When a soft-lock is placed, the bed counter is decremented atomically inside the transaction. If available beds reach zero, concurrent requests receive an immediate rejection, guaranteeing that two users can never book the same physical bed.

### Q2. "Why Supabase PostgreSQL instead of MongoDB or Firebase?"
**Winning Answer:** Hospital inventory and patient triage are deeply relational. PostgreSQL provides strict ACID compliance, relational foreign keys, row-level security (RLS), and native geospatial querying. Supabase gives us built-in WebSockets directly on PostgreSQL WAL (Write-Ahead Log) changes with zero extra backend boilerplate.

### Q3. "How many hospitals can be managed in the Admin Portal and how do nurses use it?"
**Winning Answer:** All 10 major Kolkata emergency hospitals have dedicated credentials and management desks. The portal is designed for zero cognitive overhead: nurses don't fill out multi-step forms—they adjust staffed beds and nurses using 1-tap `+`/`-` buttons and verify patient arrivals by entering 4 digits in under 2 seconds.

### Q4. "What happens if an ER nurse clicks 'Cancel / Re-Route'?"
**Winning Answer:** The desk publishes an update setting `status = 'CANCELLED'`. The citizen's phone intercepts this in real time via WebSockets, automatically finds the next closest hospital with staffed beds, calculates the new route, generates a fresh 4-digit OTP, and immediately synchronizes the top floating banner with the new hospital and OTP!
