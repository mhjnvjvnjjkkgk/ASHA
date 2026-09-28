# System Architecture Flowchart (Balanced 2-Tier Layout for Slide Placement)

### Why this fixes the slide overflow issue:
In a single-line `flowchart LR`, all 9 nodes were placed side-by-side, creating an extreme **11:1 aspect ratio** that stretched horizontally across the slide and collided with the mobile phone mockup.

This updated version uses a **2-tier balanced grid (`flowchart TB` with horizontal rows)**:
- **Top Row (4 nodes):** Citizen Client $\rightarrow$ Bengali NLP $\rightarrow$ Triage Acuity $\rightarrow$ First-Aid Sheet.
- **Bottom Row (5 nodes):** OSRM Router $\rightarrow$ Staffed Bed Check $\rightarrow$ Supabase Sync $\rightarrow$ Citizen HUD $\rightarrow$ Hospital ER Desk.
- **Aspect Ratio:** **~2.6 : 1**, which matches the physical **8.35" × 2.90"** white card area on the slide.
- **Font:** Uses **`Agency FB`** (condensed, high-contrast typography).
- **Styling:** Pure white background, clean dark navy outlines (`#0F172A`), no effects, subtle logical shapes (stadium pill, subroutine, hexagon, rounded box, diamond, cylinder).

---

## 📋 Recommended Code (Pure Nodes, Invisible Subgraph Containers)

```mermaid
%%{init: {'theme': 'default', 'themeVariables': { 'fontFamily': 'Agency FB, sans-serif', 'fontSize': '16px', 'background': '#FFFFFF', 'mainBkg': '#FFFFFF', 'nodeBorder': '#0F172A', 'lineColor': '#0F172A', 'textColor': '#0F172A', 'edgeLabelBackground': '#FFFFFF' }}}%%
flowchart TB
    %% Row 1: Ingestion & Clinical Triage (Horizontal)
    subgraph Row1 [" "]
        direction LR
        A(["📱 Citizen Web Client<br/>React 19 • Vite"]) -->|"Voice (2.2s debounce)"| B[["🧠 Bengali NLP Engine<br/>0ms In-Memory"]]
        B -->|"Clinical Tokens"| C{{"🩺 Triage Acuity<br/>AHRQ ESI 1–5"}}
        C -->|"Immediate Directives"| D("📋 First-Aid Sheet<br/>Semi-Fowler 45°")
    end

    %% Row 2: Geospatial Routing, Staffed Bed Math & Dual Terminals (Horizontal)
    subgraph Row2 [" "]
        direction LR
        E[["🗺️ OSRM Router<br/>C++ Engine • 1.35x"]] -->|"<420ms Route"| F{"Staffed Bed Check<br/>min(Beds, Nurses × Ratio)"}
        F -->|"15-min Soft Lock"| G[("⚡ Supabase Sync<br/>PostgreSQL WAL")]
        G -->|"<50ms WebSockets"| H("📱 Citizen Active HUD<br/>Live ETA & OTP 4892")
        G -->|"Incoming Triage"| I(["🏥 Hospital ER Desk<br/>100m Geofence Gate"])
    end

    %% Balanced Cross-Row Connections
    A -->|"GPS Stream"| E
    C -->|"Ward Acuity"| E
    H -.->|"10s Vector Loop"| E
    H -.->|"Verbal OTP"| I

    %% Invisible Subgraph Containers
    style Row1 fill:none,stroke:none
    style Row2 fill:none,stroke:none
```

---

## 🎨 Alternative: 3-Tier Categorized Stack (With Labeled Section Tiers)

```mermaid
%%{init: {'theme': 'default', 'themeVariables': { 'fontFamily': 'Agency FB, sans-serif', 'fontSize': '16px', 'background': '#FFFFFF', 'mainBkg': '#FFFFFF', 'nodeBorder': '#0F172A', 'lineColor': '#0F172A', 'textColor': '#0F172A', 'edgeLabelBackground': '#FFFFFF' }}}%%
flowchart TB
    subgraph Tier1 ["1. Client Ingestion & Clinical Triage"]
        direction LR
        A(["📱 Citizen Web Client<br/>React 19 • Vite"]) -->|"Voice"| B[["🧠 Bengali NLP Engine<br/>0ms In-Memory"]]
        B -->|"Tokens"| C{{"🩺 Triage Acuity<br/>AHRQ ESI 1–5"}}
        C -->|"Actions"| D("📋 First-Aid Sheet<br/>Semi-Fowler 45°")
    end

    subgraph Tier2 ["2. Geospatial Routing & Bed Reservation"]
        direction LR
        E[["🗺️ OSRM Router<br/>C++ Engine • 1.35x"]] -->|"<420ms Route"| F{"Staffed Bed Check<br/>min(Beds, Nurses × Ratio)"}
        F -->|"15-min Soft Lock"| G[("⚡ Supabase Sync<br/>PostgreSQL WAL")]
    end

    subgraph Tier3 ["3. Real-Time Operational Terminals"]
        direction LR
        H("📱 Citizen Active HUD<br/>Live ETA & OTP 4892")
        I(["🏥 Hospital ER Desk<br/>100m Geofence Gate"])
        H -.->|"Verbal OTP & Geofence"| I
    end

    A -->|"GPS"| E
    C -->|"Ward Acuity"| E
    G -->|"<50ms WebSockets"| H
    G -->|"Incoming Triage"| I
    H -.->|"10s Vector Loop"| E

    style Tier1 fill:#FFFFFF,stroke:#CBD5E1,stroke-width:1.5px,stroke-dasharray: 4 4
    style Tier2 fill:#FFFFFF,stroke:#CBD5E1,stroke-width:1.5px,stroke-dasharray: 4 4
    style Tier3 fill:#FFFFFF,stroke:#CBD5E1,stroke-width:1.5px,stroke-dasharray: 4 4
```
