/**
 * CLINICAL NURSE-TO-BED STAFFING ALLOCATION ENGINE
 * 
 * Clinical Rationale & Standards:
 * - Indian Society of Critical Care Medicine (ISCCM) / European Resuscitation Council (ERC)
 * - Standard Ratios:
 *     - General Ward: 1 Nurse : 6 Beds (1:6)
 *     - ICU (Adult, Cardiac, Pediatric): 1 Nurse : 1 Bed (1:1 standard)
 * - Priority Shedding Rule:
 *     - ICU beds are life-critical resuscitation resources (STEMI, acute trauma, stroke).
 *     - When staff is reduced, normal general ward beds are shed FIRST to protect ICU capacity.
 * - Emergency Stretch Protocol (Low-Staff Contingency):
 *     - When nurse staffing drops to critically low levels, hard-capping ICU beds at 1:1
 *       causes premature gate rejections for dying emergency victims.
 *     - In low-staff surge states, the ICU ratio stretches to 1 Nurse : 2 Beds (1:2).
 *     - 1 critical-care nurse monitors 2 adjacent telemetry beds, doubling ICU admission capacity.
 */

export interface WardStaffingInput {
  adult_icu: number;
  cardiac_icu: number;
  pediatric_icu: number;
  general_ward: number;
}

export interface WardStaffingResult {
  adult_icu: number;
  cardiac_icu: number;
  pediatric_icu: number;
  general_ward: number;
  total_available: number;
  is_low_staff: boolean;
  is_stretched: boolean;
  icu_ratio_label: '1:1' | '1:2';
  nurses_in_icu: number;
  nurses_in_gen: number;
  unstaffed_ghost_beds: number;
}

export function computeStaffedWardBeds(
  totalNurses: number,
  physicalCapacity: WardStaffingInput
): WardStaffingResult {
  const totalPhysIcu =
    (physicalCapacity.adult_icu || 0) +
    (physicalCapacity.cardiac_icu || 0) +
    (physicalCapacity.pediatric_icu || 0);
  const totalPhysGen = physicalCapacity.general_ward || 0;
  const totalPhysical = totalPhysIcu + totalPhysGen;

  if (totalNurses <= 0) {
    return {
      adult_icu: 0,
      cardiac_icu: 0,
      pediatric_icu: 0,
      general_ward: 0,
      total_available: 0,
      is_low_staff: true,
      is_stretched: false,
      icu_ratio_label: '1:1',
      nurses_in_icu: 0,
      nurses_in_gen: 0,
      unstaffed_ghost_beds: totalPhysical,
    };
  }

  // 1. Determine if Low-Staff Emergency Stretch is Triggered
  // Standard nurses needed for full capacity = (ICU * 1) + ceil(Gen / 6)
  const standardNursesNeeded = totalPhysIcu + Math.ceil(totalPhysGen / 6);
  const isLowStaff = totalNurses < standardNursesNeeded;

  // Emergency 1:2 Stretch activates when nurses are <= physical ICU or <= 4
  const isStretched = totalNurses <= totalPhysIcu || totalNurses <= 4;
  const icuRatio = isStretched ? 2 : 1; // 1 nurse covers 2 ICU beds in stretch

  // 2. Nurses needed for ICU under current ratio
  const nursesForFullIcu = Math.ceil(totalPhysIcu / icuRatio);

  let nIcu = 0;
  let nGen = 0;

  if (totalNurses <= nursesForFullIcu) {
    // Extreme low staff: ALL nurses allocated to ICU to prevent cardiac/trauma deaths
    // Normal beds are deducted FIRST down to 0
    nIcu = totalNurses;
    nGen = 0;
  } else {
    // ICU capacity is fully protected; leftover nurses allocated to General Ward
    nIcu = nursesForFullIcu;
    nGen = totalNurses - nIcu;
  }

  // 3. Calculate Staffed ICU Beds
  const maxStaffedIcu = Math.min(totalPhysIcu, nIcu * icuRatio);

  // Distribute ICU staffed beds across Adult, Cardiac, Pediatric
  // Priority: Adult ICU -> Cardiac ICU -> Pediatric ICU
  let remIcu = maxStaffedIcu;
  const staffedAdult = Math.min(physicalCapacity.adult_icu || 0, remIcu);
  remIcu -= staffedAdult;

  const staffedCardiac = Math.min(physicalCapacity.cardiac_icu || 0, remIcu);
  remIcu -= staffedCardiac;

  const staffedPediatric = Math.min(physicalCapacity.pediatric_icu || 0, remIcu);
  remIcu -= staffedPediatric;

  // 4. Calculate Staffed General Beds (1 nurse : 6 beds)
  const staffedGen = Math.min(totalPhysGen, nGen * 6);

  const totalAvailable = staffedAdult + staffedCardiac + staffedPediatric + staffedGen;
  const unstaffedGhost = Math.max(0, totalPhysical - totalAvailable);

  return {
    adult_icu: staffedAdult,
    cardiac_icu: staffedCardiac,
    pediatric_icu: staffedPediatric,
    general_ward: staffedGen,
    total_available: totalAvailable,
    is_low_staff: isLowStaff,
    is_stretched: isStretched,
    icu_ratio_label: isStretched ? '1:2' : '1:1',
    nurses_in_icu: nIcu,
    nurses_in_gen: nGen,
    unstaffed_ghost_beds: unstaffedGhost,
  };
}
