# Viva Preparation Guide: Frontend & Real-Time Sync Engineer

**Role:** "I built the interactive full-screen Leaflet map canvas, OSRM road snapping engine, and dynamic post-booking UI."

**Elevator Pitch:**
"I engineered ASHA's frontend performance and geospatial mapping stack using React 18, TypeScript, and Leaflet.js. I implemented OSRM road-snapping to eliminate urban GPS multipath jitter, calibrated urban emergency driving ETAs, and built the post-booking drawer interface that transforms to show quick-dial ambulance links and Situational First-Aid protocols."

## Code Walkthrough: `App.tsx`, `HospitalPeekDrawer.tsx`, `distance.ts`
- **Full-Screen Leaflet Canvas:** Fixed viewport background with CartoDB Dark Matter vector tiles, custom SVG government (saffron) and private (green) hospital markers, and pulsing user radar pin.
- **OSRM Road Snapping (`snapToNearestRoad`):** Queries `/nearest/v1/driving` to project raw smartphone GPS coordinates onto the nearest drivable road segment, eliminating building/water body placement errors.
- **Calibrated Urban Driving ETA:** Applies Haversine screening ($<2\text{ms}$) followed by OSRM route geometry with a $1.35\times$ urban winding factor and $25\text{ km/h}$ average emergency traffic speed.
- **Post-Booking Action Drawer:** Replaces the booking button with one-tap quick-dial buttons: "Call 108 Ambulance" (`tel:108`), "Call Hospital ER", and "Open Google Maps Navigation".

## Tough Judge Questions & Winning Answers

**1. "Why Leaflet and OpenStreetMap instead of the Google Maps JavaScript API?"**
*Answer:* The Google Maps API has strict billing limits, high per-query costs, and can be blocked by rate limits during traffic spikes. Leaflet with OpenStreetMap and self-hostable OSRM provides zero-cost, lightweight vector mapping that loads in $<300\text{ms}$ on low-end smartphones.

**2. "How do you prevent ETA recalculation jitter/flickering?"**
*Answer:* We implemented debounced OSRM route fetches and movement threshold filtering. The app only recalculates routing geometry if the user moves more than 50 meters from their previous snapped waypoint, eliminating random 9-to-12 minute ETA jumps.

**3. "How does the citizen app update when the nurse admits the patient?"**
*Answer:* We listen to Supabase WebSocket `UPDATE` events on the `active_holds` table. When the nurse enters the 4-digit OTP, the status changes to `'ADMITTED'`, instantly triggering our celebratory Green Bed Hard-Locked Admission Success modal on the citizen's phone.

**4. "How fast does the map render and route?"**
*Answer:* Initial Leaflet canvas renders in $<200\text{ms}$. Straight-line Haversine filtering across 30 Kolkata hospitals takes $<2\text{ms}$, and OSRM turn-by-turn route generation completes in $<420\text{ms}$.

**5. "How does the app handle background polling without auto-scrolling?"**
*Answer:* We eliminated aggressive `scrollIntoView` calls and isolated state updates to sub-components using React memoization, ensuring smooth background inventory sync without jumping the user's viewport.

**6. "How does the persistent top floating banner handle admin cancellations and re-routing?"**
*Answer:* We bind the top persistent banner (`bookingAlert` state) directly to the active hold lifecycle. When an ER nurse cancels a hold from their desk, the real-time cloud listener automatically identifies the next closest emergency center, routes navigation to it, and immediately calls `setBookingAlert` with the newly assigned hospital's name, address, and freshly generated 4-digit OTP—guaranteeing that the user always sees the correct destination and OTP on their screen!
