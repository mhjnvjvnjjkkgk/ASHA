import { DetailedSymptom } from '../../types';
import { CARDIO_RESPIRATORY_SYMPTOMS } from './symptoms_cardio_respiratory';
import { CARDIO_RESPIRATORY_SYMPTOMS_PART2 } from './symptoms_cardio_respiratory_part2';
import { NEURO_STROKE_SYMPTOMS } from './symptoms_neuro_stroke';
import { TRAUMA_SHOCK_SYMPTOMS } from './symptoms_trauma_shock';
import { GASTRO_METABOLIC_SYMPTOMS } from './symptoms_gastro_metabolic';
import { PEDIATRIC_TOXIC_INFECTIONS_SYMPTOMS } from './symptoms_pediatric_toxic_infections';
import { EXPANDED_SYMPTOMS_CATALOG } from './symptoms_directory_expanded';
import { SPECIALTY_SYMPTOMS_BATCH1 } from './symptoms_specialty_batch1';
import { SPECIALTY_SYMPTOMS_BATCH2 } from './symptoms_specialty_batch2';
import { SPECIALTY_SYMPTOMS_BATCH3 } from './symptoms_specialty_batch3';

// Combine all 165 symptoms into the definitive, master clinical symptom database
export const ALL_DETAILED_SYMPTOMS: DetailedSymptom[] = [
  ...CARDIO_RESPIRATORY_SYMPTOMS,
  ...CARDIO_RESPIRATORY_SYMPTOMS_PART2,
  ...NEURO_STROKE_SYMPTOMS,
  ...TRAUMA_SHOCK_SYMPTOMS,
  ...GASTRO_METABOLIC_SYMPTOMS,
  ...PEDIATRIC_TOXIC_INFECTIONS_SYMPTOMS,
  ...EXPANDED_SYMPTOMS_CATALOG,
  ...SPECIALTY_SYMPTOMS_BATCH1,
  ...SPECIALTY_SYMPTOMS_BATCH2,
  ...SPECIALTY_SYMPTOMS_BATCH3,
];

// Helper to get total count
export const TOTAL_SYMPTOMS_COUNT = ALL_DETAILED_SYMPTOMS.length;

// Helper to get distinct categories
export const SYMPTOM_CATEGORIES = Array.from(
  new Set(ALL_DETAILED_SYMPTOMS.map((s) => s.category))
).sort();

// Helper to search symptoms with robust fuzzy matching and accurate relevance ranking
export function searchSymptoms(query: string): DetailedSymptom[] {
  if (!query || query.trim() === '') {
    return ALL_DETAILED_SYMPTOMS;
  }

  const normalized = query.toLowerCase().trim();
  const queryTokens = normalized.split(/\s+/).filter((t) => t.length > 0);

  if (queryTokens.length === 0) {
    return ALL_DETAILED_SYMPTOMS;
  }

  // Pre-build regex for whole word or prefix matching
  const tokenRegexes = queryTokens.map((t) => {
    // escape regex special characters
    const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}`, 'i');
  });

  const scored = ALL_DETAILED_SYMPTOMS.map((symptom) => {
    let score = 0;
    const nameLower = symptom.name.toLowerCase();
    const keywords = (symptom.keywords || []).map((k) => k.toLowerCase());
    const conditions = (symptom.possible_conditions || []).map((c) => c.toLowerCase());
    const overview = (symptom.problem_overview || '').toLowerCase();

    // 1. Exact phrase matches (Highest priority)
    if (nameLower.includes(normalized)) {
      score += 150;
    }
    for (const kw of keywords) {
      if (kw === normalized) score += 120;
      else if (kw.includes(normalized)) score += 80;
    }

    // 2. Token-level matches with word boundary enforcement
    let tokensMatched = 0;
    for (const re of tokenRegexes) {
      let matchedThisToken = false;

      if (re.test(nameLower)) {
        score += 40;
        matchedThisToken = true;
      }
      for (const kw of keywords) {
        if (re.test(kw)) {
          score += 30;
          matchedThisToken = true;
          break;
        }
      }
      for (const cond of conditions) {
        if (re.test(cond)) {
          score += 15;
          matchedThisToken = true;
          break;
        }
      }
      if (re.test(overview)) {
        score += 8;
        matchedThisToken = true;
      }

      if (matchedThisToken) {
        tokensMatched++;
      }
    }

    // Boost if all tokens matched
    if (tokensMatched === queryTokens.length) {
      score += 25;
    }

    return { symptom, score, tokensMatched };
  });

  // Filter items that matched at least one token with positive score
  const matches = scored
    .filter((item) => item.score > 0 && item.tokensMatched > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.symptom);

  return matches;
}

// Find a single symptom by ID
export function getSymptomById(id: string): DetailedSymptom | undefined {
  return ALL_DETAILED_SYMPTOMS.find((s) => s.id === id);
}

// Filter symptoms by category
export function getSymptomsByCategory(category: string): DetailedSymptom[] {
  if (!category || category === 'ALL') {
    return ALL_DETAILED_SYMPTOMS;
  }
  return ALL_DETAILED_SYMPTOMS.filter((s) => s.category === category);
}

// Filter symptoms by severity (RED, YELLOW, GREEN)
export function getSymptomsBySeverity(severity: 'RED' | 'YELLOW' | 'GREEN'): DetailedSymptom[] {
  return ALL_DETAILED_SYMPTOMS.filter((s) => s.severity === severity);
}
