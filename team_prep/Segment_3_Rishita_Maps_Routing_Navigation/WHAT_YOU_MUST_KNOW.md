# 🧠 What You Must Know: Rishita
**Segment:** Segment 3: Geospatial Routing, Road Snapping & Emergency Navigation  
**Role:** Geospatial Routing & Navigation Specialist

This document breaks down everything you need to master your segment in clear, intuitive, plain English. Read this until you can explain these concepts naturally to anyone without hesitation.

---

## 🌟 The Big Picture: Why ASHA Exists
In India, **over 50,000 patients die every year** not because hospital beds don't exist, but because:
1. **Ambulances bounce across 2.4 hospitals** with dying patients before finding an open bed.
2. **Government dashboards show 'Ghost Beds'**—beds that exist as physical furniture but have zero nurses to staff them.
3. **The 30–45 minute transit period is a fatal void** where panicked families do nothing or commit fatal mistakes like pouring water down unconscious throats.

ASHA fixes this with a **zero-signup citizen web app** (`ashaien.vercel.app`) and a **zero-overhead hospital command desk** (`ashaien-admin.vercel.app`).

---

## 🔑 Core Concepts You Must Master for Your Segment:

### 1. Interactive Leaflet.js Canvas with CartoDB Dark Matter Vector Tiles
- **The 3 Telemetry States:** Analyzes velocity vector $v = \frac{\Delta d}{\Delta t}$ every 10 seconds. `TOWARD` (approaching): timer paused, live dynamic ETA shown. `STATIONARY` (idle at home): 15-minute countdown decrements. `AWAY` (wrong direction): alert triggered, hold auto-cancelled after consecutive checks.

### 2. OSRM Road Snapping (/nearest/v1/driving) to Eliminate GPS Multipath Jitter
- **Why OSRM Road Snapping:** Smartphone GPS in high-density urban areas drifts by 20–40 meters due to multipath reflections off concrete high-rises. OSRM `/nearest/v1/driving` projects the raw GPS pin onto the nearest drivable street so routing starts from real asphalt, not a swimming pool or rooftop.

### 3. Two-Stage Geospatial Pipeline: Haversine Screening (<2ms) + OSRM Routing
- Master the clinical, mathematical, and algorithmic principles governing Two-Stage Geospatial Pipeline: Haversine Screening (<2ms) + OSRM Routing.

### 4. Calibrated Urban Emergency ETA (1.35x winding factor & 25 km/h urban speed)
- Master the clinical, mathematical, and algorithmic principles governing Calibrated Urban Emergency ETA (1.35x winding factor & 25 km/h urban speed).

### 5. Movement Threshold Filtering to Prevent ETA Recalculation Flickering
- Master the clinical, mathematical, and algorithmic principles governing Movement Threshold Filtering to Prevent ETA Recalculation Flickering.

### 6. Turn-by-Turn Road Polylines & Interactive Hospital Peek Drawer
- Master the clinical, mathematical, and algorithmic principles governing Turn-by-Turn Road Polylines & Interactive Hospital Peek Drawer.

### 7. Cost Optimization: $0/month open-source stack vs Google Maps billing spikes
- Master the clinical, mathematical, and algorithmic principles governing Cost Optimization: $0/month open-source stack vs Google Maps billing spikes.

