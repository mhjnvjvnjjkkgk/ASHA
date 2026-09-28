import { AITriageResult, SeverityLevel, WardCode, DetailedSymptom } from '../types';
import { ALL_DETAILED_SYMPTOMS } from '../data/symptoms';
import { normalizeBengaliPhonetics, translateBengaliToEnglish } from './triageClassifier';

// Fast local clinical dictionary for Benglish and English
interface ClinicalRule {
  keywords: string[];
  detected_symptom: string;
  detected_language: string;
  english_translation: string;
  problem_overview: string;
  possible_conditions: string[];
  immediate_solution: string[];
  what_not_to_do: string[];
  severity: SeverityLevel;
  esi_level: string;
  recommended_ward: WardCode;
  urgency_note: string;
  matched_symptom_id: string;
}

const CLINICAL_RULES: ClinicalRule[] = [
  // 1. CHEST PAIN / CARDIAC (Bengali Script, Benglish, English)
  {
    keywords: [
      'buke betha korche',
      'buke betha',
      'buk betha',
      'buker betha',
      'bukh e khub betha',
      'buke khub betha',
      'bukh e betha',
      'bukh e',
      'buke saash nite parchena',
      'shash nite kosto',
      'stemi',
      'acute crushing chest pain',
      'buike betha',
      'buike batha',
      'buke batha',
      'buke byatha',
      'buker byatha',
      'bhukke betha',
      'bhukke batha',
      'bhukke beta',
      'bhukke',
      'book a betha',
      'book a batha',
      'book a beta',
      'book a',
      'book betha',
      'book batha',
      'booke betha',
      'boke betha',
      'boke batha',
      'boka betha',
      'buka betha',
      'bhuk betha',
      'bhook betha',
      'buke chap lagche',
      'buke chap',
      'buk dhukdhuk',
      'chhatir byatha',
      'chhati te betha',
      'buke jwala',
      'বুকে ব্যথা করছে',
      'বুকে ব্যথা',
      'বুক ব্যথা',
      'বুকে ব্যাথা',
      'বুক ব্যাথা',
      'বুকে চাপ',
      'বুক ধুকধুক',
      'বুকে জ্বালা',
      'বুকে খুব ব্যথা',
      'বুকের ব্যথা',
      'বুকে যন্ত্রণা',
      'বুকে অসহ্য যন্ত্রণা',
      'chest pain',
      'heart attack',
      'crushing chest pain',
      'angina',
      'cardiac pain',
      'substernal pain',
    ],
    detected_symptom: 'Acute Chest Pain / Suspected Cardiac Event',
    detected_language: 'Bengali (বাংলা) / Benglish / English',
    english_translation: 'Experiencing acute pain, tightness, or burning pressure in the chest',
    problem_overview:
      'You may be facing Acute Coronary Syndrome (such as a Heart Attack or Unstable Angina) where oxygen-rich blood flow to heart muscle is obstructed. Immediate medical evaluation is required to protect heart function.',
    possible_conditions: [
      'Acute Myocardial Infarction (Heart Attack)',
      'Unstable Angina Pectoris',
      'Coronary Artery Spasm',
      'Aortic Dissection or Pericarditis',
    ],
    immediate_solution: [
      'Keep patient seated upright leaning back at 45° with back firmly supported (Semi-Fowler position) to relieve cardiac preload.',
      'Have conscious patient chew one 300mg Soluble Aspirin immediately (if no documented NSAID allergy or active bleeding).',
      'Strictly prohibit any walking, standing, or climbing stairs (complete physical rest is essential).',
      'Loosen tight collar, buttons, tie, belt, or waistline to maximize ease of breathing.',
      'If patient has prescribed sublingual Sorbitrate or Nitroglycerin spray and systolic BP is above 100, administer one dose under tongue.',
      'Rush immediately to an emergency hospital with an active 24/7 Cardiac Cath Lab & ICU.',
    ],
    what_not_to_do: [
      '❌ Do NOT lie flat on the floor (this increases fluid backup into the lungs and triggers suffocation).',
      '❌ Do NOT allow the patient to walk or exert themselves under their own power.',
      '❌ Do NOT dismiss crushing pain as ordinary acidity, heartburn, or gas.',
    ],
    severity: 'RED',
    esi_level: 'ESI-1 (Immediate Resuscitation)',
    recommended_ward: 'cardiac_icu',
    urgency_note: 'Golden Hour: Door-to-balloon time window is <90 minutes. Rapid reperfusion preserves myocardium.',
    matched_symptom_id: 'sym-cr-01',
  },

  // 2. LEG BLEEDING / LOWER EXTREMITY TRAUMA (English, Benglish, Hinglish)
  {
    keywords: [
      'leg bleeding',
      'bleeding leg',
      'leg bleed',
      'paaye theke rokto porchhe',
      'paer rokto',
      'paaye boro cut',
      'paaye rokto',
      'pa kete geche',
      'paa theke rokto',
      'taang se khoon',
      'paav se khoon',
      'pair bleeding',
      'taang se bleeding',
      'pair se khoon',
      'thigh bleeding',
      'calf bleeding',
      'cut on leg',
      'arterial leg bleeding',
      'পা কেটে রক্ত',
      'পা থেকে রক্ত',
      'পায়ে রক্ত',
    ],
    detected_symptom: 'Severe Lower Extremity Bleeding & Trauma',
    detected_language: 'English / Benglish / Hinglish / Bengali (বাংলা)',
    english_translation: 'Profuse or active bleeding from the leg, thigh, or foot laceration',
    problem_overview:
      'You may be facing acute vascular compromise (such as injury to the femoral, popliteal, or tibial vessels) or deep soft tissue trauma. Rapid blood loss can cause hypovolemic shock within minutes if not arrested.',
    possible_conditions: [
      'Arterial or Venous Laceration of Lower Extremity',
      'Deep Soft Tissue Wound / Puncture',
      'Open / Compound Fracture with Vascular Involvement',
      'Traumatic Hemorrhage and Hypovolemic Shock',
    ],
    immediate_solution: [
      'Apply firm, continuous direct pressure directly over the bleeding wound using a clean cloth, sterile gauze, or trauma pad.',
      'Elevate the injured leg above the level of the heart (unless an obvious bone fracture is suspected) to reduce hydrostatic pressure.',
      'Do NOT remove blood-soaked cloths; layer additional clean gauze or cloth firmly on top of the original dressing.',
      'If blood is spurting pulsatile (arterial bleed), apply a pressure dressing or a high-thigh tourniquet 2-3 inches above the wound (never directly over a joint) and write the application time.',
      'Keep the patient lying down, warm, and covered with a blanket to prevent hypothermic trauma shock.',
      'Transport immediately to an emergency trauma center with crossmatched blood banking capacity.',
    ],
    what_not_to_do: [
      '❌ Do NOT remove or peel back the first dressing once applied (this disrupts the initial clot).',
      '❌ Do NOT wash deep, heavily bleeding wounds with tap water or harsh chemical antiseptics.',
      '❌ Do NOT allow the patient to walk or bear weight on the bleeding leg.',
    ],
    severity: 'RED',
    esi_level: 'ESI-1 (Immediate Resuscitation)',
    recommended_ward: 'adult_icu',
    urgency_note: 'Severe arterial leg wounds can cause life-threatening exsanguination in 3-5 minutes. Maintain direct pressure.',
    matched_symptom_id: 'sym-ts-leg-bleeding',
  },

  // 2B. ACUTE LEG PAIN / CALF PAIN / DVT / MUSCULOSKELETAL TRAUMA (Pure Bengali, Benglish, Hinglish, English)
  {
    keywords: [
      // Pure Bengali
      'পায়ে ব্যথা করছে',
      'পায়ে ব্যথা',
      'পায়ের ব্যথা',
      'পা ব্যথা করছে',
      'পা ব্যথা',
      'পায়ে ব্যাথা',
      'পায়ের ব্যাথা',
      'পায়ে যন্ত্রণা',
      'পায়ে খুব ব্যথা',
      'পা ফুলে গেছে',
      'পায়ে টান',
      'পায়ে খিল',
      'হাঁটুতে ব্যথা',
      'হাঁটুর ব্যথা',
      'উরুতে ব্যথা',
      'গোড়ালিতে ব্যথা',
      'পা ফেলতে পারছে না',
      // Benglish / Phonetic
      'pae betha korche',
      'pae betha',
      'pa e betha',
      'pa betha',
      'paaye betha',
      'payer betha',
      'paer betha',
      'paa betha',
      'paaye byatha',
      'pae byatha',
      'paaye jontrona',
      'pae jontrona',
      'paaye khub betha',
      'pae khub betha',
      'taang mein dard',
      'paer dard',
      // English
      'leg pain',
      'calf pain',
      'thigh pain',
      'shin pain',
      'knee pain',
      'broken leg',
      'leg injury',
      'dvt',
      'swollen leg',
      'leg cramp',
      'leg swelling',
      'bone pain leg',
      'cannot walk leg pain',
    ],
    detected_symptom: 'Acute Leg Pain & Suspected DVT / Fracture / Trauma',
    detected_language: 'English / Benglish / Hinglish',
    english_translation: 'Experiencing acute pain, swelling, tenderness, or trauma in the leg or calf',
    problem_overview:
      'You may be facing acute lower extremity injury, such as Deep Vein Thrombosis (blood clot in deep veins), a bone fracture, acute muscle rupture, or compartment syndrome. Urgent medical imaging is required to prevent blood clot migration or permanent nerve/vascular injury.',
    possible_conditions: [
      'Deep Vein Thrombosis (DVT)',
      'Lower Extremity Bone Fracture (Tibia/Fibula/Femur)',
      'Acute Compartment Syndrome',
      'Peripheral Arterial Ischemia',
      'Severe Muscle Tear or Ligament Rupture',
    ],
    immediate_solution: [
      'Keep the leg completely rested and elevated above heart level on pillows (unless acute arterial blockage is suspected, in which case keep flat).',
      'Do NOT attempt to walk, run, or bear weight on the injured or painful leg.',
      'If fracture or deformity is suspected, gently immobilize the leg with a soft pillow or splint without forcefully straightening it.',
      'Apply an ice pack wrapped in a cloth for 15-20 minutes to reduce local pain and acute swelling.',
      'Check the foot for warmth and pulse; ensure the toes have normal sensation and movement.',
      'Seek immediate hospital evaluation with emergency ultrasound or X-ray facilities.',
    ],
    what_not_to_do: [
      '❌ Strictly DO NOT vigorously massage, rub, or squeeze a painful swollen calf (can dislodge a deadly clot to the lungs).',
      '❌ Do NOT attempt to forcefully bend or manipulate a deformed leg or joint.',
      '❌ Do NOT apply hot water bags or hot balms to acute swelling or suspected thrombosis.',
    ],
    severity: 'YELLOW',
    esi_level: 'ESI-2 (Emergent)',
    recommended_ward: 'general_oxygen',
    urgency_note: 'Seek urgent evaluation within 60 minutes. If accompanied by sudden breathlessness, treat as a pulmonary embolism emergency.',
    matched_symptom_id: 'sym-ts-leg-pain',
  },

  // 3. GENERAL BLEEDING / TRAUMA / ACCIDENT
  {
    keywords: [
      'bleeding',
      'blood loss',
      'spurting blood',
      'rokto porchhe',
      'khoon beh raha hai',
      'accident',
      'stab wound',
      'arterial bleed',
      'gushing blood',
    ],
    detected_symptom: 'Acute Hemorrhage & Trauma Wound',
    detected_language: 'Multilingual Emergency Triage',
    english_translation: 'Active blood loss or penetrating trauma requiring immediate hemorrhage control',
    problem_overview:
      'Active hemorrhage requires immediate mechanical hemostasis to prevent profound blood volume loss and hemorrhagic shock.',
    possible_conditions: [
      'Traumatic Vascular Severance',
      'Deep Soft Tissue Laceration',
      'Hypovolemic Shock',
    ],
    immediate_solution: [
      'Apply continuous, unyielding direct pressure on the bleeding site with a clean cloth or sterile dressing.',
      'Pack deep cavity wounds firmly with gauze while maintaining direct palm pressure for at least 3 minutes.',
      'Elevate injured extremity above heart level if no fracture is present.',
      'Cover patient with warm blankets to guard against trauma triad of death (hypothermia, coagulopathy, acidosis).',
      'Proceed immediately to Level-1 Trauma bay.',
    ],
    what_not_to_do: [
      '❌ Do NOT use thin wire, string, or shoelaces as a makeshift tourniquet.',
      '❌ Do NOT pull out deeply embedded objects like glass or knives (they act as temporary plugs).',
    ],
    severity: 'RED',
    esi_level: 'ESI-1 (Immediate Resuscitation)',
    recommended_ward: 'adult_icu',
    urgency_note: 'Hemorrhage control takes precedence over all other non-airway interventions.',
    matched_symptom_id: 'sym-ts-01',
  },

  // 4. STROKE / NEUROLOGICAL (Benglish, Hinglish, English)
  {
    keywords: [
      'mukh beke geche',
      'mukhe baka',
      'katha bolte parchena',
      'haath uthte parchena',
      'ek paashe jhinjhin',
      'bolte oshubidha',
      'muh tedha',
      'bol nahi pa raha',
      'ek taraf sunn',
      'stroke',
      'paralysis',
      'face droop',
      'slurred speech',
      'arm weakness',
      'brain attack',
    ],
    detected_symptom: 'Acute Ischemic Stroke / Brain Attack (FAST Positive)',
    detected_language: 'Benglish / Hinglish / English',
    english_translation: 'Facial asymmetry, slurred speech, or unilateral limb weakness',
    problem_overview:
      'You may be facing an Acute Stroke (thromboembolic or hemorrhagic cerebral infarction). Every minute counts to preserve brain tissue within the thrombolytic golden window.',
    possible_conditions: [
      'Acute Ischemic Stroke (LVO or cortical infarct)',
      'Intracerebral Hemorrhage',
      'Transient Ischemic Attack (TIA)',
    ],
    immediate_solution: [
      'Note the exact time symptoms first started (critical for IV thrombolysis eligibility within 4.5 hours).',
      'Keep patient lying on their side with head elevated 15-30° (recovery position) if drowsy to safeguard airway.',
      'Check FAST: Face drooping, Arm weakness, Speech slurred, Time to call emergency hospital with CT scanner.',
      'Do not give anything to eat, drink, or swallow (dysphagia triggers fatal aspiration pneumonia).',
      'Rush immediately to an emergency hospital with an operational 24/7 Stroke CT Scanner.',
    ],
    what_not_to_do: [
      '❌ Do NOT give Aspirin, Disprin, or blood thinners before an emergency CT scan (fatal if stroke is hemorrhagic).',
      '❌ Do NOT give water, juice, or pills orally.',
      '❌ Do NOT wait for symptoms to "pass" or take a nap.',
    ],
    severity: 'RED',
    esi_level: 'ESI-1 (Immediate Resuscitation)',
    recommended_ward: 'adult_icu',
    urgency_note: 'Thrombolysis window: <4.5 hours. 1.9 million brain neurons die every minute during an ischemic stroke.',
    matched_symptom_id: 'sym-cr-02',
  },

  // 5. RESPIRATORY DISTRESS / ASTHMA / BREATHING
  {
    keywords: [
      'sash nite koshto',
      'shash koshto',
      'dam bondho hoye ashche',
      'hapaani',
      'saans lene mein takleef',
      'dam ghut raha hai',
      'saans phool rahi',
      'difficulty breathing',
      'shortness of breath',
      'asthma attack',
      'choking',
      'wheezing',
      'suffocation',
      'stridor',
    ],
    detected_symptom: 'Severe Respiratory Distress & Hypoxia',
    detected_language: 'Benglish / Hinglish / English',
    english_translation: 'Struggling to breathe, acute air hunger, or severe bronchospasm',
    problem_overview:
      'You may be facing acute respiratory insufficiency, severe bronchospasm, or pulmonary edema. Prompt high-flow oxygenation and bronchodilation are essential.',
    possible_conditions: [
      'Severe Acute Asthma / Status Asthmaticus',
      'Acute Pulmonary Edema / Cardiac Asthma',
      'COPD Exacerbation with Hypercapnic Failure',
      'Upper Airway Obstruction / Choking',
    ],
    immediate_solution: [
      'Sit patient completely upright leaning slightly forward with arms supported (tripod position) to optimize diaphragm mechanics.',
      'Administer Salbutamol / Budecort inhaler via spacer immediately (4-10 puffs if prescribed).',
      'Ensure maximum fresh airflow; open windows and remove crowds.',
      'Loosen all tight clothing around neck and chest.',
      'If choking: perform immediate Heimlich abdominal thrusts until object is expelled.',
      'Prepare for immediate high-flow oxygen and nebulization at nearest facility.',
    ],
    what_not_to_do: [
      '❌ Do NOT force patient to lie down (greatly worsens hypoxemia and increases work of breathing).',
      '❌ Do NOT offer oral fluids or food during rapid labored breathing.',
    ],
    severity: 'RED',
    esi_level: 'ESI-1 (Immediate Resuscitation)',
    recommended_ward: 'general_oxygen',
    urgency_note: 'Immediate high-flow oxygen and SpO2 monitoring required to prevent hypoxic arrest.',
    matched_symptom_id: 'sym-cr-03',
  },

  // 6. ACUTE ABDOMEN / SEVERE STOMACH PAIN (Benglish, Hinglish, English)
  {
    keywords: [
      'pete betha',
      'pet betha',
      'pete ossojho betha',
      'bomi hocche',
      'pet kharap',
      'pet mein tez dard',
      'ultiyan',
      'pet dard',
      'severe stomach pain',
      'abdominal pain',
      'vomiting blood',
      'acute abdomen',
    ],
    detected_symptom: 'Acute Abdomen & Severe Gastrointestinal Distress',
    detected_language: 'Benglish / Hinglish / English',
    english_translation: 'Severe abdominal cramping or excruciating abdominal tenderness and vomiting',
    problem_overview:
      'You may be facing acute peritonitis, appendicitis, bowel obstruction, or internal bleeding. Surgical triage and ultrasound/CT evaluation are critical.',
    possible_conditions: [
      'Acute Appendicitis or Cholecystitis',
      'Perforated Peptic Ulcer / Peritonitis',
      'Acute Pancreatitis',
      'Bowel Obstruction or Mesenteric Ischemia',
    ],
    immediate_solution: [
      'Place patient in a comfortable position with knees drawn up to relax abdominal wall muscles.',
      'Keep patient strictly Nil By Mouth (NPO) - do not give food, water, or oral pain medications.',
      'Monitor for abdominal rigidity (board-like hardness) or rebound tenderness.',
      'If vomiting, ensure head is turned to side to avoid aspiration.',
      'Rush to an emergency department with general surgical on-call support.',
    ],
    what_not_to_do: [
      '❌ Do NOT give laxatives, enemas, or heavy painkillers like Morphine/Tramadol before surgeon evaluation.',
      '❌ Do NOT apply hot water bottles or heating pads to the abdomen (accelerates appendiceal rupture).',
      '❌ Do NOT give solid food or liquids.',
    ],
    severity: 'YELLOW',
    esi_level: 'ESI-2 (Emergent)',
    recommended_ward: 'adult_icu',
    urgency_note: 'Emergency surgical consultation and abdominal imaging recommended within 2 hours.',
    matched_symptom_id: 'sym-gm-01',
  },

  // 7. PEDIATRIC EMERGENCY (Benglish, Hinglish, English)
  {
    keywords: [
      'bacchar jor',
      'baccha khachhe na',
      'bacha behosh',
      'baccha kashche',
      'bacche ko bukhar',
      'bacha ro raha',
      'child fever',
      'baby breathless',
      'pediatric emergency',
      'infant seizure',
    ],
    detected_symptom: 'Pediatric Acute Emergency & High Fever/Distress',
    detected_language: 'Benglish / Hinglish / English',
    english_translation: 'Infant or child with severe fever, breathing difficulty, or lethargy',
    problem_overview:
      'Children and infants can decompensate rapidly. Prompt pediatric evaluation is required to rule out febrile seizures, severe dehydration, or sepsis.',
    possible_conditions: [
      'Febrile Seizure / Pediatric Sepsis',
      'Acute Bronchiolitis or Croup',
      'Severe Dehydration',
    ],
    immediate_solution: [
      'Keep child calm and in parent arms.',
      'Sponge forehead, neck, and limbs with lukewarm (not ice cold) water to gently bring down high fever.',
      'Check respiratory effort: look for chest indrawing or nasal flaring.',
      'If child has a seizure: place on side, do not insert anything into mouth, protect head from hard surfaces.',
      'Route directly to a dedicated Pediatric Emergency & PICU facility.',
    ],
    what_not_to_do: [
      '❌ Do NOT use ice water or alcohol rubs (causes violent shivering and rapid core temp rebound).',
      '❌ Do NOT force solid food or heavy liquids into a drowsy child.',
    ],
    severity: 'RED',
    esi_level: 'ESI-1 (Immediate Resuscitation)',
    recommended_ward: 'pediatric_icu',
    urgency_note: 'Pediatric vitals can deteriorate swiftly. Dedicated pediatric specialist care advised.',
    matched_symptom_id: 'sym-pti-01',
  },
];

/**
 * Fast synchronous clinical analysis using high-accuracy Benglish/Hinglish/English dictionary
 */
export function analyzeSymptomFast(query: string): AITriageResult {
  const translation = translateBengaliToEnglish(query);
  const rawNorm = query.toLowerCase().trim();
  const translatedNorm = translation.translatedEnglish.toLowerCase().trim();
  const norm = normalizeBengaliPhonetics(rawNorm);

  // Find matching rule
  for (const rule of CLINICAL_RULES) {
    const isMatch =
      (translation.isTranslated && translation.matched_symptom_id && rule.matched_symptom_id === translation.matched_symptom_id) ||
      rule.keywords.some((kw) => norm.includes(kw) || rawNorm.includes(kw) || translatedNorm.includes(kw));
    if (isMatch) {
      return {
        query,
        detected_symptom: translation.isTranslated ? translation.englishSummary : rule.detected_symptom,
        detected_language: translation.isTranslated ? translation.detectedLanguage : rule.detected_language,
        english_translation: translation.isTranslated ? translation.englishSummary : rule.english_translation,
        problem_overview: rule.problem_overview,
        possible_conditions: rule.possible_conditions,
        immediate_solution: rule.immediate_solution,
        what_not_to_do: rule.what_not_to_do,
        severity: rule.severity,
        esi_level: rule.esi_level,
        recommended_ward: rule.recommended_ward,
        urgency_note: rule.urgency_note,
        matched_symptom_id: translation.matched_symptom_id || rule.matched_symptom_id,
        is_ai_generated: false,
      };
    }
  }

  // Fallback: Smart emergency synthesis
  return {
    query,
    detected_symptom: translation.isTranslated
      ? translation.englishSummary
      : `Clinical Emergency Evaluation: "${query}"`,
    detected_language: translation.isTranslated
      ? translation.detectedLanguage
      : 'Natural Input (English / Hinglish / Benglish)',
    english_translation: translation.isTranslated
      ? translation.englishSummary
      : `Triage assessment for symptom: ${query}`,
    problem_overview:
      'The described symptoms require urgent clinical triage and vital sign monitoring to rule out life-threatening internal or systemic complications.',
    possible_conditions: [
      translation.isTranslated ? translation.englishSummary : 'Acute Medical Condition requiring Bedside Evaluation',
      'Systemic Infection or Inflammation',
      'Musculoskeletal or Visceral Pain syndrome',
    ],
    immediate_solution: [
      'Keep the patient seated or resting in a quiet, supported position.',
      'Check vital signs (pulse, respiration, SpO2, and temperature) if instruments are available.',
      'Do not allow excessive physical exertion or strenuous walking.',
      'Have medical history and active medications ready for the emergency physician.',
      'Proceed to the nearest equipped emergency department for diagnostic workup.',
    ],
    what_not_to_do: [
      '❌ Do NOT administer unverified medications or strong analgesics before clinical diagnosis.',
      '❌ Do NOT leave an acutely ill or unstable patient unattended.',
    ],
    severity: translation.isTranslated && translation.matched_symptom_id ? 'RED' : 'YELLOW',
    esi_level: translation.isTranslated && translation.matched_symptom_id ? 'ESI-1 (Immediate Resuscitation)' : 'ESI-3 (General Triage)',
    recommended_ward: translation.isTranslated && translation.matched_symptom_id ? 'cardiac_icu' : 'general_oxygen',
    urgency_note: 'Immediate clinical assessment and triage vitals recommended.',
    matched_symptom_id: translation.matched_symptom_id,
    is_ai_generated: false,
  };
}

/**
 * Asynchronous deep analysis using server-side Gemini API (with seamless local fallback)
 */
export async function analyzeSymptomWithAI(query: string): Promise<AITriageResult> {
  const localResult = analyzeSymptomFast(query);

  try {
    const res = await fetch('/api/triage/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      return localResult;
    }

    const data = await res.json();
    if (data.success && data.analysis) {
      const a = data.analysis;
      return {
        query,
        detected_symptom: a.detected_symptom || localResult.detected_symptom,
        detected_language: a.detected_language || localResult.detected_language,
        english_translation: a.english_translation || localResult.english_translation,
        problem_overview: a.problem_overview || localResult.problem_overview,
        possible_conditions:
          Array.isArray(a.possible_conditions) && a.possible_conditions.length > 0
            ? a.possible_conditions
            : localResult.possible_conditions,
        immediate_solution:
          Array.isArray(a.immediate_solution) && a.immediate_solution.length > 0
            ? a.immediate_solution
            : localResult.immediate_solution,
        what_not_to_do:
          Array.isArray(a.what_not_to_do) && a.what_not_to_do.length > 0
            ? a.what_not_to_do
            : localResult.what_not_to_do,
        severity: (a.severity as SeverityLevel) || localResult.severity,
        esi_level: a.esi_level || localResult.esi_level,
        recommended_ward: (a.recommended_ward as WardCode) || localResult.recommended_ward,
        urgency_note: a.urgency_note || localResult.urgency_note,
        matched_symptom_id: a.matched_symptom_id || localResult.matched_symptom_id,
        is_ai_generated: true,
      };
    }
  } catch (err) {
    console.warn('Server Gemini triage unavailable, using clinical engine fallback:', err);
  }

  return localResult;
}
