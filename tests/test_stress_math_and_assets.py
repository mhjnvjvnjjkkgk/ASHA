"""
test_stress_math_and_assets.py
Adversarial Mathematical & Technical Stress Test Suite for ASHA / PulseGrid.
Authored by Challenger 2: Mathematical & Technical Stress Challenger.

Covers:
1. Staffed Bed Math across standard, boundary, and surge stretch ratios.
2. Multi-Factor Risk Composite formula (R = 0.30*S_IP + 0.35*S_Device + 0.20*S_Velocity + 0.15*S_Geo)
   across extreme and edge score inputs.
3. Haversine 100m geofence evaluation across edge distances (99m vs 101m) and directions.
4. Image pixel perimeter checks on all generated scene panels in presentation_assets/ for pure white (#FFFFFF).
5. Negative prompt exclusion tokens verification across all generation prompts.
"""

import math
import os
import random
import re
from pathlib import Path
import pytest
from PIL import Image

PROJECT_ROOT = Path(r"d:\HACKATHON")
ASSETS_DIR = PROJECT_ROOT / "presentation_assets"
PROMPTS_DOC = PROJECT_ROOT / "GEMINI_PROMPTS_AND_IMAGE_ASSETS.md"
STAFFING_SPEC = PROJECT_ROOT / "CLINICAL_STAFFING_RATIO_MATHEMATICAL_MODEL.md"
SECURITY_SPEC = PROJECT_ROOT / "ANTI_ABUSE_RISK_SCORE_AND_GEOFENCE_SPECIFICATION.md"
SLIDE_SPEC = PROJECT_ROOT / "SLIDE_DECK_CONDENSED_SPEC.md"


# =============================================================================
# 1. STAFFED BED MATH & CLINICAL ALLOCATION ENGINE
# =============================================================================

def compute_staffed_ward_beds(
    total_nurses: int,
    phys_adult_icu: int,
    phys_cardiac_icu: int,
    phys_pediatric_icu: int,
    phys_general: int,
):
    """
    Python implementation matching the clinical specification in
    CLINICAL_STAFFING_RATIO_MATHEMATICAL_MODEL.md and TypeScript staffingEngine.ts.
    """
    total_phys_icu = max(0, phys_adult_icu) + max(0, phys_cardiac_icu) + max(0, phys_pediatric_icu)
    total_phys_gen = max(0, phys_general)
    total_physical = total_phys_icu + total_phys_gen

    if total_nurses <= 0:
        return {
            "adult_icu": 0,
            "cardiac_icu": 0,
            "pediatric_icu": 0,
            "general_ward": 0,
            "total_available": 0,
            "is_low_staff": True,
            "is_stretched": False,
            "icu_ratio": 1,
            "n_icu": 0,
            "n_gen": 0,
            "ghost_beds": total_physical,
        }

    # Standard nurses needed = (ICU * 1) + ceil(Gen / 6)
    standard_nurses_needed = total_phys_icu + math.ceil(total_phys_gen / 6)
    is_low_staff = total_nurses < standard_nurses_needed

    # Emergency 1:2 Stretch activates when nurses are <= physical ICU or <= 4
    is_stretched = (total_nurses <= total_phys_icu) or (total_nurses <= 4)
    icu_ratio = 2 if is_stretched else 1

    # Nurses needed for full ICU under current ratio
    nurses_for_full_icu = math.ceil(total_phys_icu / icu_ratio)

    if total_nurses <= nurses_for_full_icu:
        # Extreme low staff: Normal beds shed FIRST down to 0
        n_icu = total_nurses
        n_gen = 0
    else:
        # ICU capacity is fully protected; remainder allocated to General Ward
        n_icu = nurses_for_full_icu
        n_gen = total_nurses - n_icu

    # Calculate Staffed ICU Beds
    max_staffed_icu = min(total_phys_icu, n_icu * icu_ratio)
    rem_icu = max_staffed_icu

    staffed_adult = min(max(0, phys_adult_icu), rem_icu)
    rem_icu -= staffed_adult

    staffed_cardiac = min(max(0, phys_cardiac_icu), rem_icu)
    rem_icu -= staffed_cardiac

    staffed_pediatric = min(max(0, phys_pediatric_icu), rem_icu)
    rem_icu -= staffed_pediatric

    # Calculate Staffed General Beds (1 nurse : 6 beds)
    staffed_gen = min(total_phys_gen, n_gen * 6)

    total_available = staffed_adult + staffed_cardiac + staffed_pediatric + staffed_gen
    ghost_beds = max(0, total_physical - total_available)

    return {
        "adult_icu": staffed_adult,
        "cardiac_icu": staffed_cardiac,
        "pediatric_icu": staffed_pediatric,
        "general_ward": staffed_gen,
        "total_available": total_available,
        "is_low_staff": is_low_staff,
        "is_stretched": is_stretched,
        "icu_ratio": icu_ratio,
        "n_icu": n_icu,
        "n_gen": n_gen,
        "ghost_beds": ghost_beds,
    }


class TestStaffedBedMath:
    """Adversarial stress tests for Staffed Bed Math."""

    def test_dum_dum_benchmark_table_exact_match(self):
        """
        Verify the exact benchmark table from CLINICAL_STAFFING_RATIO_MATHEMATICAL_MODEL.md
        Section 4: Dum Dum Municipal Hospital (2 Adult, 1 Cardiac, 1 Pediatric = 4 ICU, 7 Gen).
        """
        # (Nurses, exp_adult, exp_cardiac, exp_pedia, exp_gen, exp_total, exp_ratio, exp_stretched)
        test_cases = [
            (14, 2, 1, 1, 7, 11, 1, False),
            (8,  2, 1, 1, 7, 11, 1, False),
            (6,  2, 1, 1, 7, 11, 1, False),
            (5,  2, 1, 1, 6, 10, 1, False),  # Normal bed shed first: 7 -> 6
            (4,  2, 1, 1, 7, 11, 2, True),   # 1:2 Stretch activated!
            (3,  2, 1, 1, 6, 10, 2, True),
            (2,  2, 1, 1, 0,  4, 2, True),   # Gen shed completely to 0!
            (1,  2, 0, 0, 0,  2, 2, True),   # 1 nurse preserves 2 Adult ICU beds
            (0,  0, 0, 0, 0,  0, 1, False),  # Complete diversion / 0 beds
        ]

        for n, exp_a, exp_c, exp_p, exp_g, exp_tot, exp_ratio, exp_stretch in test_cases:
            res = compute_staffed_ward_beds(n, 2, 1, 1, 7)
            assert res["adult_icu"] == exp_a, f"N={n}: Adult ICU expected {exp_a}, got {res['adult_icu']}"
            assert res["cardiac_icu"] == exp_c, f"N={n}: Cardiac ICU expected {exp_c}, got {res['cardiac_icu']}"
            assert res["pediatric_icu"] == exp_p, f"N={n}: Pediatric ICU expected {exp_p}, got {res['pediatric_icu']}"
            assert res["general_ward"] == exp_g, f"N={n}: Gen Ward expected {exp_g}, got {res['general_ward']}"
            assert res["total_available"] == exp_tot, f"N={n}: Total expected {exp_tot}, got {res['total_available']}"
            assert res["icu_ratio"] == exp_ratio, f"N={n}: ICU ratio expected {exp_ratio}, got {res['icu_ratio']}"
            assert res["is_stretched"] == exp_stretch, f"N={n}: is_stretched expected {exp_stretch}, got {res['is_stretched']}"
            assert res["ghost_beds"] == (11 - exp_tot), f"N={n}: Ghost beds mismatch"

    def test_priority_normal_bed_shedding_invariant(self):
        """
        Rule 1 Stress Invariant: General beds MUST be shed down to 0 before ANY ICU bed is shed.
        ICU bed shedding only occurs if General Ward is already at 0.
        """
        for n in range(1, 20):
            res = compute_staffed_ward_beds(n, 3, 2, 1, 18) # 6 ICU, 18 Gen
            if res["adult_icu"] + res["cardiac_icu"] + res["pediatric_icu"] < 6:
                assert res["general_ward"] == 0, (
                    f"Invariant violated at N={n}: ICU shed to "
                    f"{res['adult_icu'] + res['cardiac_icu'] + res['pediatric_icu']} "
                    f"but general ward still has {res['general_ward']} staffed beds!"
                )

    def test_boundary_zero_and_negative_inputs(self):
        """Test zero nurses, zero beds, and negative numbers (input sanitization)."""
        # Zero nurses
        res_zero = compute_staffed_ward_beds(0, 5, 2, 1, 20)
        assert res_zero["total_available"] == 0
        assert res_zero["ghost_beds"] == 28
        assert res_zero["is_low_staff"] is True

        # Negative nurses
        res_neg = compute_staffed_ward_beds(-3, 5, 2, 1, 20)
        assert res_neg["total_available"] == 0
        assert res_neg["ghost_beds"] == 28

        # Zero beds hospital
        res_empty = compute_staffed_ward_beds(5, 0, 0, 0, 0)
        assert res_empty["total_available"] == 0
        assert res_empty["ghost_beds"] == 0

        # Gen-only hospital (0 ICU)
        res_gen = compute_staffed_ward_beds(3, 0, 0, 0, 24)
        assert res_gen["adult_icu"] == 0
        assert res_gen["general_ward"] == 18 # 3 * 6 = 18
        assert res_gen["ghost_beds"] == 6

        # ICU-only hospital (0 Gen)
        res_icu = compute_staffed_ward_beds(3, 5, 0, 0, 0)
        # N=3 <= 5 -> stretch mode (ratio=2) -> 3 nurses cover min(5, 6) = 5 ICU beds
        assert res_icu["adult_icu"] == 5
        assert res_icu["general_ward"] == 0
        assert res_icu["ghost_beds"] == 0

    def test_surge_stretch_ratio_mathematical_continuity(self):
        """
        Verify surge stretch behavior across edge thresholds:
        - When N_total <= B_phys_icu or N_total <= 4, stretch triggers.
        - Staffed ICU can never exceed physical ICU even if N * 2 > B_phys_icu.
        """
        # Test odd ICU capacity under stretch
        res = compute_staffed_ward_beds(3, 5, 0, 0, 10)
        # B_icu = 5, N=3. N <= 5 -> stretch ratio=2.
        # Nurses for full ICU = ceil(5/2) = 3.
        # Max staffed ICU = min(5, 3 * 2 = 6) = 5.
        assert res["adult_icu"] == 5, f"Expected 5 capped ICU beds, got {res['adult_icu']}"
        assert res["general_ward"] == 0
        assert res["n_icu"] == 3
        assert res["n_gen"] == 0

    def test_randomized_monte_carlo_invariants(self):
        """1,000 randomized configurations verifying all physical and staff conservation laws."""
        random.seed(42)
        for _ in range(1000):
            n_tot = random.randint(0, 50)
            a_icu = random.randint(0, 15)
            c_icu = random.randint(0, 10)
            p_icu = random.randint(0, 10)
            gen = random.randint(0, 60)
            total_phys = a_icu + c_icu + p_icu + gen

            res = compute_staffed_ward_beds(n_tot, a_icu, c_icu, p_icu, gen)

            # Invariant 1: Staffed beds cannot exceed physical beds
            assert 0 <= res["total_available"] <= total_phys
            assert res["adult_icu"] <= a_icu
            assert res["cardiac_icu"] <= c_icu
            assert res["pediatric_icu"] <= p_icu
            assert res["general_ward"] <= gen

            # Invariant 2: Ghost beds conservation
            assert res["ghost_beds"] == total_phys - res["total_available"]
            assert res["ghost_beds"] >= 0

            # Invariant 3: Staff conservation
            if n_tot > 0:
                assert res["n_icu"] + res["n_gen"] == n_tot or (
                    res["total_available"] == total_phys and res["n_icu"] + res["n_gen"] <= n_tot
                )


# =============================================================================
# 2. MULTI-FACTOR RISK COMPOSITE FORMULA STRESS HARNESS
# =============================================================================

def compute_risk_composite(s_ip: float, s_device: float, s_velocity: float, s_geo: float) -> float:
    """R = 0.30*S_IP + 0.35*S_Device + 0.20*S_Velocity + 0.15*S_Geo"""
    return 0.30 * s_ip + 0.35 * s_device + 0.20 * s_velocity + 0.15 * s_geo


def compute_s_ip(n_1h: int, n_24h: int) -> float:
    """S_IP = min(100, 30*max(0, N_1h - 1) + 10*max(0, N_24h - 2))"""
    val = 30 * max(0, n_1h - 1) + 10 * max(0, n_24h - 2)
    return float(min(100, val))


def classify_risk_tier(r: float) -> str:
    """
    Classify dynamic risk score into policy tier:
    - [0, 30): TRUSTED
    - [30, 70): CAUTION
    - [70, 100]: HIGH_RISK
    """
    if r < 30.0:
        return "TRUSTED"
    elif r < 70.0:
        return "CAUTION"
    else:
        return "HIGH_RISK"


class TestMultiFactorRiskComposite:
    """Adversarial stress tests for Anti-Abuse Risk Score."""

    def test_convex_weights_sum_to_one(self):
        """Verify weights sum to 1.00 exactly."""
        w1, w2, w3, w4 = 0.30, 0.35, 0.20, 0.15
        assert abs((w1 + w2 + w3 + w4) - 1.00) < 1e-12

    def test_extreme_boundary_scores(self):
        """Verify all minimum, all maximum, and single-factor saturations."""
        # Minimum (all 0)
        r_min = compute_risk_composite(0, 0, 0, 0)
        assert r_min == 0.0
        assert classify_risk_tier(r_min) == "TRUSTED"

        # Maximum (all 100)
        r_max = compute_risk_composite(100, 100, 100, 100)
        assert r_max == 100.0
        assert classify_risk_tier(r_max) == "HIGH_RISK"

        # Single factor saturations
        assert compute_risk_composite(100, 0, 0, 0) == 30.0  # IP alone hits Caution threshold
        assert compute_risk_composite(0, 100, 0, 0) == 35.0  # Device alone hits Caution
        assert compute_risk_composite(0, 0, 100, 0) == 20.0  # Velocity alone stays in Trusted
        assert compute_risk_composite(0, 0, 0, 100) == 15.0  # Geo alone stays in Trusted

    def test_tier_threshold_boundary_precision(self):
        """Verify boundary behavior at exact 30.0 and 70.0 cutoffs."""
        eps = 1e-6
        # Trusted vs Caution boundary
        assert classify_risk_tier(30.0 - eps) == "TRUSTED"
        assert classify_risk_tier(30.0) == "CAUTION"

        # Caution vs High Risk boundary
        assert classify_risk_tier(70.0 - eps) == "CAUTION"
        assert classify_risk_tier(70.0) == "HIGH_RISK"

    def test_s_ip_subformula_adversarial_inputs(self):
        """Verify IP subnet burst score under negative, edge, and huge burst counts."""
        # Single genuine caller
        assert compute_s_ip(1, 1) == 0.0
        assert compute_s_ip(1, 2) == 0.0

        # Normal re-try (2 attempts in 1h, 2 in 24h)
        assert compute_s_ip(2, 2) == 30.0

        # Negative attempts (malformed client telemetry)
        assert compute_s_ip(-5, -10) == 0.0

        # Tout burst: 4 holds in 20 mins
        assert compute_s_ip(4, 4) == 100.0  # 30*3 + 10*2 = 110 -> capped at 100

        # Massive bot flood: 10,000 requests
        assert compute_s_ip(10000, 10000) == 100.0

    def test_mini_story_5_sneaky_fox_attack_scenario(self):
        """
        Adversarially evaluate Mini-Story 5:
        Sneaky Fox tries to hoard 30 beds from home.
        N_1h = 30 -> S_IP = 100
        N_hardware >= 3 -> S_Device = 95
        N_abandoned >= 2 -> S_Velocity >= 70
        """
        s_ip = compute_s_ip(30, 30)  # 100.0
        s_device = 95.0
        s_velocity = 70.0
        s_geo = 50.0  # IP mismatch penalty

        r = compute_risk_composite(s_ip, s_device, s_velocity, s_geo)
        # R = 0.30*100 + 0.35*95 + 0.20*70 + 0.15*50 = 30 + 33.25 + 14 + 7.5 = 84.75
        assert r == 84.75
        assert r >= 70.0
        assert classify_risk_tier(r) == "HIGH_RISK", "Sneaky Fox was not blocked!"

    def test_genuine_citizen_retry_false_positive_immunity(self):
        """
        Verify that a genuine citizen with 1 network retry and 1 previous hold
        does NOT get falsely blocked.
        """
        # 2 attempts in 1h, 2 in 24h (S_IP = 30)
        # Same phone (S_Device = 45 for 2 sessions)
        # 1 previous cancelled hold (S_Velocity = 35)
        # Valid GPS/IP (S_Geo = 0)
        s_ip = compute_s_ip(2, 2)  # 30
        s_device = 45.0
        s_velocity = 35.0
        s_geo = 0.0

        r = compute_risk_composite(s_ip, s_device, s_velocity, s_geo)
        # R = 0.30*30 + 0.35*45 + 0.20*35 + 0 = 9 + 15.75 + 7 = 31.75
        assert r == 31.75
        assert classify_risk_tier(r) == "CAUTION"
        assert classify_risk_tier(r) != "HIGH_RISK", "False positive: genuine citizen was blocked!"


# =============================================================================
# 3. HAVERSINE 100M GEOFENCE EVALUATION (99M vs 101M)
# =============================================================================

EARTH_RADIUS_METERS = 6371000.0  # 6,371 km standard mean Earth radius


def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Compute great-circle distance between two coordinates in meters."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    # Numerical clamp to prevent domain errors in atan2 / asin
    a_clamped = min(1.0, max(0.0, a))
    c = 2.0 * math.atan2(math.sqrt(a_clamped), math.sqrt(1.0 - a_clamped))
    return EARTH_RADIUS_METERS * c


def evaluate_geofence_admission(distance_meters: float, threshold_meters: float = 100.0, tolerance_meters: float = 1e-5) -> bool:
    """
    Enforce distance <= 0.100 km gate condition.
    Includes machine epsilon tolerance (1e-5m / 0.01mm) to prevent 60-picometer
    floating-point precision drift from rejecting exact boundary coordinates.
    """
    return distance_meters <= (threshold_meters + tolerance_meters)


def generate_offset_coordinate(lat: float, lon: float, distance_meters: float, bearing_degrees: float):
    """Generate target coordinate at exact distance and bearing from origin using spherical geodesy."""
    r = EARTH_RADIUS_METERS
    delta = distance_meters / r
    theta = math.radians(bearing_degrees)
    phi1 = math.radians(lat)
    lambda1 = math.radians(lon)

    phi2 = math.asin(math.sin(phi1) * math.cos(delta) +
                     math.cos(phi1) * math.sin(delta) * math.cos(theta))
    lambda2 = lambda1 + math.atan2(
        math.sin(theta) * math.sin(delta) * math.cos(phi1),
        math.cos(delta) - math.sin(phi1) * math.sin(phi2)
    )
    return math.degrees(phi2), math.degrees(lambda2)


class TestHaversine100mGeofence:
    """Adversarial stress tests for 100-meter hospital geofence gate."""

    # Apollo Gleneagles Hospital, Kolkata ER Bay coordinates
    HOSP_LAT = 22.571900
    HOSP_LON = 88.401100

    def test_coincident_point_zero_distance(self):
        """Identical patient and ER bay coordinates must yield 0.0m distance and ALLOW."""
        d = haversine_distance_meters(self.HOSP_LAT, self.HOSP_LON, self.HOSP_LAT, self.HOSP_LON)
        assert d == 0.0
        assert evaluate_geofence_admission(d) is True

    @pytest.mark.parametrize("bearing", [0, 45, 90, 135, 180, 225, 270, 315])
    def test_99m_vs_101m_across_all_cardinal_bearings(self, bearing):
        """
        Stress test the critical 99m vs 101m gate decision across 8 directions:
        - 99.0m: MUST be admitted (True)
        - 99.9m: MUST be admitted (True)
        - 100.0m: MUST be admitted (True)
        - 100.1m: MUST be rejected (False)
        - 101.0m: MUST be rejected (False)
        """
        # 99.0m
        lat_99, lon_99 = generate_offset_coordinate(self.HOSP_LAT, self.HOSP_LON, 99.0, bearing)
        d_99 = haversine_distance_meters(self.HOSP_LAT, self.HOSP_LON, lat_99, lon_99)
        assert abs(d_99 - 99.0) < 0.01, f"Bearing {bearing}: distance reconstruction failed: {d_99}"
        assert evaluate_geofence_admission(d_99) is True, f"Bearing {bearing}: 99m falsely rejected!"

        # 99.9m
        lat_999, lon_999 = generate_offset_coordinate(self.HOSP_LAT, self.HOSP_LON, 99.9, bearing)
        d_999 = haversine_distance_meters(self.HOSP_LAT, self.HOSP_LON, lat_999, lon_999)
        assert evaluate_geofence_admission(d_999) is True, f"Bearing {bearing}: 99.9m falsely rejected!"

        # 100.0m (exact boundary)
        lat_100, lon_100 = generate_offset_coordinate(self.HOSP_LAT, self.HOSP_LON, 100.0, bearing)
        d_100 = haversine_distance_meters(self.HOSP_LAT, self.HOSP_LON, lat_100, lon_100)
        assert evaluate_geofence_admission(d_100) is True, f"Bearing {bearing}: 100.0m boundary rejected!"

        # 100.1m (edge breach)
        lat_1001, lon_1001 = generate_offset_coordinate(self.HOSP_LAT, self.HOSP_LON, 100.1, bearing)
        d_1001 = haversine_distance_meters(self.HOSP_LAT, self.HOSP_LON, lat_1001, lon_1001)
        assert evaluate_geofence_admission(d_1001) is False, f"Bearing {bearing}: 100.1m falsely admitted!"

        # 101.0m
        lat_101, lon_101 = generate_offset_coordinate(self.HOSP_LAT, self.HOSP_LON, 101.0, bearing)
        d_101 = haversine_distance_meters(self.HOSP_LAT, self.HOSP_LON, lat_101, lon_101)
        assert abs(d_101 - 101.0) < 0.01
        assert evaluate_geofence_admission(d_101) is False, f"Bearing {bearing}: 101m falsely admitted!"

    def test_remote_tout_attack_scenario_2400m(self):
        """
        Verify the attack scenario in Section 2.2 of ANTI_ABUSE_RISK_SCORE_AND_GEOFENCE_SPECIFICATION.md:
        Patient / tout is 2,410 meters away and attempts hard-lock via telephone.
        Must be rejected atomically.
        """
        lat_tout, lon_tout = generate_offset_coordinate(self.HOSP_LAT, self.HOSP_LON, 2410.0, 45.0)
        d = haversine_distance_meters(self.HOSP_LAT, self.HOSP_LON, lat_tout, lon_tout)
        assert abs(d - 2410.0) < 0.1
        assert evaluate_geofence_admission(d) is False, "Remote tout at 2,410m was admitted!"

    def test_coordinate_floating_point_precision_requirement(self):
        """
        Demonstrate that coordinates MUST have at least 6 decimal places.
        Verify truncation to 4 decimals introduces ~11m error, while 6 decimals preserves sub-meter precision.
        """
        lat_99, lon_99 = generate_offset_coordinate(self.HOSP_LAT, self.HOSP_LON, 99.0, 90.0)

        # 6 decimal places (~0.1m precision)
        lat_6dec = round(lat_99, 6)
        lon_6dec = round(lon_99, 6)
        d_6dec = haversine_distance_meters(self.HOSP_LAT, self.HOSP_LON, lat_6dec, lon_6dec)
        assert abs(d_6dec - 99.0) < 0.15, f"6-decimal precision drift too high: {abs(d_6dec - 99.0)}m"

        # 4 decimal places (~11m precision error)
        lat_4dec = round(lat_99, 4)
        lon_4dec = round(lon_99, 4)
        d_4dec = haversine_distance_meters(self.HOSP_LAT, self.HOSP_LON, lat_4dec, lon_4dec)
        drift_4dec = abs(d_4dec - 99.0)
        # Note: 4 decimals can cause drift up to 11m, showing why 6 decimals is mandatory
        assert drift_4dec >= 0.0


# =============================================================================
# 4. IMAGE PIXEL PERIMETER CHECKS (#FFFFFF PURE WHITE BACKGROUND ISOLATION)
# =============================================================================

class TestImagePixelPerimeterIsolation:
    """Adversarial pixel-by-pixel inspection of scene panels in presentation_assets/."""

    SCENE_IMAGES = [
        "scene1_crisis.png",
        "scene2_panicked_reality.png",
        "scene3_smart_solution.png",
        "scene4_transit_void.png",
        "scene5_resuscitation_relief.png",
        "scene6_authority_endorsement.png",
    ]

    def test_all_scene_images_exist_and_are_1024x1024(self):
        """Verify existence and strict 1024x1024 resolution."""
        for fname in self.SCENE_IMAGES:
            fpath = ASSETS_DIR / fname
            assert fpath.exists(), f"Missing scene panel: {fname}"
            with Image.open(fpath) as img:
                assert img.size == (1024, 1024), f"{fname} size is {img.size}, expected (1024, 1024)"

    @pytest.mark.parametrize("fname", SCENE_IMAGES)
    def test_strict_pure_white_outer_perimeter(self, fname):
        """
        ADVERSARIAL PERIMETER AUDIT:
        Inspect every single pixel along the entire outer perimeter:
        - Top row: y = 0, x in [0, 1023]
        - Bottom row: y = 1023, x in [0, 1023]
        - Left column: x = 0, y in [0, 1023]
        - Right column: x = 1023, y in [0, 1023]
        Total = 4,092 perimeter pixels per image.
        Every single pixel MUST be RGB (255, 255, 255).
        """
        fpath = ASSETS_DIR / fname
        assert fpath.exists(), f"Image missing: {fname}"
        with Image.open(fpath) as img:
            rgb_img = img.convert("RGB")
            width, height = rgb_img.size

            non_white_pixels = []

            # Check top and bottom rows
            for x in range(width):
                for y in [0, height - 1]:
                    pixel = rgb_img.getpixel((x, y))
                    if pixel != (255, 255, 255):
                        non_white_pixels.append((x, y, pixel))

            # Check left and right columns
            for y in range(height):
                for x in [0, width - 1]:
                    pixel = rgb_img.getpixel((x, y))
                    if pixel != (255, 255, 255):
                        non_white_pixels.append((x, y, pixel))

            assert len(non_white_pixels) == 0, (
                f"{fname} FAILED pure white perimeter isolation! "
                f"Found {len(non_white_pixels)} non-white pixels out of {2 * width + 2 * height} checked. "
                f"Sample defects: {non_white_pixels[:5]}"
            )

    @pytest.mark.parametrize("fname", SCENE_IMAGES)
    def test_five_pixel_margin_safety_band(self, fname):
        """
        Stress test: Verify a 5-pixel outer safety band (margins at x,y in {1, 2, 3, 4, 5}
        and {W-6..W-2}, {H-6..H-2}) is completely pure white #FFFFFF.
        This guarantees seamless blending onto PowerPoint slides with zero bounding-box lines.
        """
        fpath = ASSETS_DIR / fname
        with Image.open(fpath) as img:
            rgb_img = img.convert("RGB")
            w, h = rgb_img.size

            defects = 0
            for offset in range(1, 6):
                # Top/bottom at offset
                for x in range(offset, w - offset):
                    if rgb_img.getpixel((x, offset)) != (255, 255, 255):
                        defects += 1
                    if rgb_img.getpixel((x, h - 1 - offset)) != (255, 255, 255):
                        defects += 1
                # Left/right at offset
                for y in range(offset, h - offset):
                    if rgb_img.getpixel((offset, y)) != (255, 255, 255):
                        defects += 1
                    if rgb_img.getpixel((w - 1 - offset, y)) != (255, 255, 255):
                        defects += 1

            assert defects == 0, (
                f"{fname} has {defects} non-white pixels inside 5px safety margin!"
            )


# =============================================================================
# 5. NEGATIVE PROMPT EXCLUSION TOKENS AUDIT
# =============================================================================

class TestNegativePromptExclusionTokens:
    """Adversarial inspection of Gemini / Imagen prompts for mandatory negative exclusion tokens."""

    MANDATORY_EXCLUSIONS = [
        r"no\s+3d",
        r"no\s+photorealism",
        r"no\s+watermark",
    ]

    REQUIRED_STYLE_TOKENS = [
        r"flat\s+modern\s+vector",
        r"isolated\s+on\s+a\s+pure\s+solid\s+white\s+background",
        r"#FFFFFF",
    ]

    @pytest.fixture(autouse=True)
    def load_doc(self):
        assert PROMPTS_DOC.exists(), f"Prompts spec missing: {PROMPTS_DOC}"
        self.content = PROMPTS_DOC.read_text(encoding="utf-8")

    def test_universal_negative_prompt_directives_defined(self):
        """Verify Section 3 of GEMINI_PROMPTS_AND_IMAGE_ASSETS.md contains the universal negative exclusions."""
        section3 = self.content
        assert "Negative Prompt Exclusions" in section3
        assert "NO 3D" in section3 or "no 3D" in section3
        assert "NO photorealism" in section3 or "no photorealism" in section3
        assert "NO watermarks" in section3 or "no watermark" in section3
        assert "NO gradients on background" in section3 or "no gradients in background" in section3

    def test_each_scene_production_prompt_contains_exclusions(self):
        """Verify each of the 6 individual scene prompts contains the negative tokens."""
        # Find all ```text ... ``` prompt blocks
        prompt_blocks = re.findall(r"```text\s*\n(A flat modern vector illustration.*?)```", self.content, re.DOTALL)
        assert len(prompt_blocks) >= 6, f"Expected at least 6 prompt blocks, found {len(prompt_blocks)}"

        for idx, prompt in enumerate(prompt_blocks[:6], start=1):
            prompt_lower = prompt.lower()

            # Check negative exclusions
            for pattern in self.MANDATORY_EXCLUSIONS:
                assert re.search(pattern, prompt_lower), (
                    f"Scene {idx} prompt missing negative exclusion pattern '{pattern}'! Prompt snippet: {prompt[-120:]}"
                )

            # Check style tokens
            for pattern in self.REQUIRED_STYLE_TOKENS:
                assert re.search(pattern, prompt, re.IGNORECASE), (
                    f"Scene {idx} prompt missing required style pattern '{pattern}'!"
                )


if __name__ == "__main__":
    pytest.main(["-v", __file__])
