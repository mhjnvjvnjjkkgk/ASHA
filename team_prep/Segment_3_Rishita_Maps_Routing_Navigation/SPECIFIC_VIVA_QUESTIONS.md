# 🎯 Specific Viva Questions & Winning Answers: Rishita
**Segment:** Segment 3: Geospatial Routing, Road Snapping & Emergency Navigation  
**Role:** Geospatial Routing & Navigation Specialist

Practice answering these questions out loud. Each answer is designed to be punchy, technically unassailable, and medically grounded.

---

### Q1. "Why Leaflet and OpenStreetMap instead of the Google Maps JavaScript API?"
**Winning Answer:** Google Maps API imposes heavy per-query billing, rate-limiting during surge events, and requires credit card verification. Leaflet with OpenStreetMap and self-hostable OSRM provides zero-cost, lightweight vector mapping that renders in under 200ms on low-end smartphones.

### Q2. "What is road snapping and why is it essential for emergency navigation?"
**Winning Answer:** In urban high-density corridors like Newtown or Dum Dum, raw GPS signals bounce off high-rise buildings (multipath drift), placing coordinates 20–40 meters away inside buildings or water bodies. OSRM `/nearest/v1/driving` snaps the raw pin onto the nearest drivable road segment so driving routes and turn-by-turn navigation start from real asphalt.

### Q3. "How do you eliminate ETA recalculation jitter/flickering?"
**Winning Answer:** We implemented movement threshold filtering and debounced OSRM route fetches. The app only recalculates routing geometry if the user moves more than 50 meters from their previous snapped waypoint, eliminating random 9-to-12 minute ETA jumps.

### Q4. "How do you calculate accurate urban emergency driving times?"
**Winning Answer:** We apply a two-stage pipeline: instant Haversine straight-line screening (<2ms) across all 30 Kolkata hospitals, followed by OSRM turn-by-turn road geometry calibrated with a 1.35x urban winding factor and a 25 km/h average emergency traffic speed.
