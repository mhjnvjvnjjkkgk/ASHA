import { SeverityLevel, WardCode, DetailedSymptom } from '../types';

export interface TriageClassification {
  severity: SeverityLevel;
  recommended_ward: WardCode;
  protocol_key: string;
  matched_keywords: string[];
  score: number;
  explanation: string;
  blood_needed?: {
    group?: string;
    component?: string;
  };
  offer_hold: boolean;
}

export interface BengaliTranslationResult {
  translatedEnglish: string;
  detectedLanguage: string;
  englishSummary: string;
  isTranslated: boolean;
  matched_symptom_id?: string;
  protocol_key?: string;
}

/**
 * Robust Bengali script & spoken phrase to English medical translation engine
 */
/**
 * Robust Bengali script, Romanized Benglish, and spoken emergency phrase to English medical translation engine
 */
export function translateBengaliToEnglish(query: string): BengaliTranslationResult {
  const raw = (query || '').trim();
  const text = raw.toLowerCase();
  const hasBengaliScript = /[\u0980-\u09FF]/.test(raw);
  const hasBenglishWords = /\b(betha|byatha|batha|baatha|beta|bheta|vyatha|vatha|jontrona|yontrona|peerha|dard|bukh|bukhe|buke|buker|bhuk|bhukh|bhook|bhookh|chhati|chhatir|chhatite|saash|saas|sash|shash|shaash|shas|shwas|shwaas|shwash|nishash|dam|dom|nite\s*parchena|nite\s*parche|nite\s*kosto|dam\s*bondho|dom\s*bondho|dam\s*atke|dom\s*atke|haphani|hapaani|behosh|behoshi|agyan|oggan|gyan|sara\s*dichena|sara\s*dichhena|nari|mukhe\s*baka|mukh\s*beke|haath\s*sunn|pa\s*sunn|kotha\s*bolte|katha\s*bolte|rokto|khoon|finki|bhenge|bhanga|haddi|darate\s*parchena|sape|saap|keteche|kamreche|donson|bish|kheyeche|pure|agun|fule|jor|baccha|bacchar|prosob|bedona|ghoom|matha|bomi|khichuni|dadu|dida|thakurma|kaku|mashi|pishi|amar|amader|rogi|dorkar|lagbe)\b/i.test(raw);

  // If input contains NO Bengali Unicode script and NO Benglish phonetic words, it is pure English!
  if (!hasBengaliScript && !hasBenglishWords) {
    return {
      translatedEnglish: raw,
      detectedLanguage: 'English',
      englishSummary: raw,
      isTranslated: false,
    };
  }

  // Normalize Benglish phonetics into standard tokens for easy pattern matching
  const norm = text
    // Strip family prefixes and possessives so core symptom is exposed
    .replace(/\b(dadur|dadu-r|dadu|dida-r|didar|dida|thakurmar|thakurma|babar|baba-r|baba|mayer|ma-er|ma|kakur|kaku|jethur|jethu|mashir|mashi|pishir|pishi|amar|amader|or|onar|rogi-r|rogir|rogi|patient|patient-er)\b/g, '')
    // Chest variations: bukh e, buk e, buke, buker, bhukh, bhuk, book, chhati, etc.
    .replace(/\b(bukh\s*e|buk\s*e|bukhe|buke|buker|bukh|buk|bhook|bhookh|bhuk|bhukh|bhukke|book\s*e|book\s*a|booke|boke|boka|buka|chhati|chhatir|chhatite)\b/g, 'chest')
    // Pain variations: betha, byatha, batha, baatha, jontrona, ossojho betha, khub betha, etc.
    .replace(/\b(byatha|betha|batha|baatha|beta|bheta|vyatha|vatha|jontrona|yontrona|peerha|dard|khub\s*betha|ossojho\s*betha|prochur\s*betha|marattok\s*betha)\b/g, 'pain')
    // Breath variations: saash, saas, sash, shash, shaash, shas, shwas, shwaas, nishash, dam, dom
    .replace(/\b(saash|saas|sash|shash|shaash|shas|shwas|shwaas|shwash|nishash|dam|dom)\b/g, 'breath')
    // Inability to breathe: nite parchena, nite parche na, nite kosto, dam atke, etc.
    .replace(/\b(nite\s*parchena|nite\s*parche\s*na|nite\s*parchina|nite\s*parchi\s*na|nite\s*kosto|nite\s*koshto|shash\s*nite|dam\s*bondho|dom\s*bondho|haphani|hapaani)\b/g, 'distress')
    // Unresponsive: behosh, agyan, oggan, gyan nei, sara dichhena
    .replace(/\b(behosh|behoshi|agyan|oggan|gyan\s*nei|sara\s*dichena|sara\s*dichhena|pulse\s*nei|nari\s*cholchena)\b/g, 'unresponsive')
    // Stroke: mukhe baka, mukh beke, hath sunn, katha bolte parchena
    .replace(/\b(mukhe\s*baka|mukh\s*beke|mukh\s*beba|haath\s*sunn|pa\s*sunn|kotha\s*bolte\s*parchena|katha\s*bolte\s*parchena)\b/g, 'stroke')
    // Bleeding: rokto, khoon, rokto porchhe
    .replace(/\b(rokto\s*porchhe|rokto\s*porche|rokto\s*berocche|rokto|khoon)\b/g, 'bleeding')
    // Fracture: bhenge geche, bhaanga, etc.
    .replace(/\b(bhenge\s*geche|bhenge|darate\s*parchena|haddi\s*toot)\b/g, 'fracture')
    // Clean multiple spaces
    .replace(/\s+/g, ' ')
    .trim();

  // 1. SNAKE BITE / ENVENOMATION / ANIMAL BITES (Highest etiology priority)
  if (
    /(সাপ|সাপের|বিষাক্ত\s*সাপ|বিষধর).*(কেটে|কামড়ে|কামড়|দংশন)|সাপে\s*কেটে|সাপের\s*কামড়|চন্দ্রবোড়া|গোখরো|কালাচ|মৌমাছির\s*হুল|বিষাক্ত\s*পোকা|কুকুরে\s*কামড়ে/i.test(text) ||
    /\b(sape\s*keteche|saap\s*kamreche|snake\s*bite|snakebite|venomous\s*snake)\b/i.test(text)
  ) {
    return {
      translatedEnglish: 'snake bite snakebite envenomation venomous sting sape keteche',
      detectedLanguage: hasBengaliScript ? 'Bengali (বাংলা)' : 'Benglish (বাংলা in Roman Script)',
      englishSummary: 'Snakebite envenomation / suspected neurotoxic venom',
      isTranslated: true,
      matched_symptom_id: 'sym-pti-02',
      protocol_key: 'poison',
    };
  }

  // 2. POISONING / CHEMICAL INGESTION / OVERDOSE (Excluding purely dietary food poisoning)
  if (
    (!text.includes('খাদ্য') && /বিষ.*(খেয়েছে|খেয়ে|পান|ক্রিয়া)|কীটনাশক|ওষুধ\s*বেশি|ঘুমের\s*ওষুধ|অ্যাসিড\s*খেয়েছে|কেরোসিন|ইঁদুর\s*মারার\s*বিষ/i.test(text)) ||
    /\b(bish\s*kheyeche|poison|chemical\s*ingestion|overdose|toxic\s*substance)\b/i.test(text)
  ) {
    return {
      translatedEnglish: 'acute poisoning organophosphate chemical ingestion overdose bish kheyeche',
      detectedLanguage: hasBengaliScript ? 'Bengali (বাংলা)' : 'Benglish (বাংলা in Roman Script)',
      englishSummary: 'Acute chemical ingestion / suspected poisoning or overdose',
      isTranslated: true,
      matched_symptom_id: 'sym-pti-01',
      protocol_key: 'poison',
    };
  }

  // 3. BURNS / FIRE / CHEMICAL / SCALDS / INHALATION
  if (
    /পুড়ে|আগুনে|গরম\s*(তেল|জল)|অ্যাসিড\s*পড়েছে|ফোসকা|ফোস্কা|চামড়া\s*পুড়ে|বিদ্যুতের\s*শক|ধোঁয়ায়\s*শ্বাস/i.test(text) ||
    /\b(pure\s*geche|agun\s*lege|burns|scald|acid\s*burn|thermal\s*burn)\b/i.test(text)
  ) {
    return {
      translatedEnglish: 'severe thermal burn fire chemical acid burn scald pure geche',
      detectedLanguage: hasBengaliScript ? 'Bengali (বাংলা)' : 'Benglish (বাংলা in Roman Script)',
      englishSummary: 'Severe thermal or chemical burns / inhalation injury',
      isTranslated: true,
      matched_symptom_id: 'sym-ts-07',
      protocol_key: 'burns',
    };
  }

  // 4. ALLERGY / ANAPHYLAXIS
  if (
    /অ্যালার্জি|এলার্জি|চুলকানি|ঠোঁট\s*ফুলে|গলা\s*ফুলে|ফুসকুড়ি|সারা\s*শরীর\s*চুলকাচ্ছে|চোখ\s*মুখ\s*ফুলে/i.test(text) ||
    /\b(allergy|anaphylaxis|throat\s*swelling|fule\s*geche|urticaria)\b/i.test(text)
  ) {
    return {
      translatedEnglish: 'severe anaphylaxis allergic reaction throat swelling allergy',
      detectedLanguage: hasBengaliScript ? 'Bengali (বাংলা)' : 'Benglish (বাংলা in Roman Script)',
      englishSummary: 'Acute allergic reaction / suspected anaphylaxis with angioedema',
      isTranslated: true,
      matched_symptom_id: 'sym-ts-02',
      protocol_key: 'allergy',
    };
  }

  // 5. PEDIATRIC & MATERNITY EMERGENCIES (Child, Infant, Neonate, or Pregnant Labor)
  if (
    /(বাচ্চা|বাচ্চার|শিশু|শিশুর|নবজাতক).*(জ্বর|শ্বাসকষ্ট|খিঁচুনি|নিস্তেজ|বমি|কাঁদছে|নীল|দুধ|কেরোসিন)|বাচ্চার\s*জ্বর|শিশুর\s*জ্বর|নবজাতক|১০৪\s*ডিগ্রি\s*জ্বর|প্রসব.*(বেদনা|শুরু)|গর্ভবতী.*(রক্ত|রক্তক্ষরণ)|জল\s*ভেঙে\s*গেছে/i.test(text) ||
    /\b(bacchar\s*jor|baccha\s*jor|khub\s*jor|prochur\s*jor|high\s*fever|fever|tezz\s*bukhar|pediatric|prosob\s*bedona|water\s*broke|labor\s*pain)\b/i.test(text)
  ) {
    const isLabor = /প্রসব|গর্ভবতী|জল\s*ভেঙে|labor|delivery/i.test(text);
    return {
      translatedEnglish: isLabor
        ? 'precipitous active labor obstetric emergency water broke'
        : 'high fever febrile seizure severe hyperpyrexia pediatric emergency bacchar jor',
      detectedLanguage: hasBengaliScript ? 'Bengali (বাংলা)' : 'Benglish (বাংলা in Roman Script)',
      englishSummary: isLabor
        ? 'Active precipitous labor / obstetric emergency'
        : 'High grade pediatric fever / febrile emergency / child distress',
      isTranslated: true,
      matched_symptom_id: 'sym-exp-15',
      protocol_key: 'pediatric',
    };
  }

  // 6. METABOLIC COLLAPSE / DIABETIC HYPOGLYCEMIA / HEAT EXHAUSTION
  if (
    /সুগার.*(কমে|ফল|বেশি)|ডায়াবেটিক|ঘেমে\s*একাকার|হিট\s*স্ট্রোক|রোদে\s*(অজ্ঞান|পড়ে)/i.test(text) ||
    /\b(sugar\s*kome|hypoglycemia|heat\s*stroke)\b/i.test(text)
  ) {
    return {
      translatedEnglish: 'acute diabetic emergency hypoglycemia heat exhaustion severe dehydration collapse',
      detectedLanguage: hasBengaliScript ? 'Bengali (বাংলা)' : 'Benglish (বাংলা in Roman Script)',
      englishSummary: 'Severe hypoglycemia / heat exhaustion / metabolic collapse',
      isTranslated: true,
      matched_symptom_id: 'sym-cr-03',
      protocol_key: 'general',
    };
  }

  // 7. SEVERE CRANIAL & SPINAL TRAUMA (Checked before limb hemorrhage)
  if (
    /(মাথা|খুলি|ঘাড়|ঘাড়ে|মেরুদণ্ড|ব্রেন|মস্তিষ্ক).*(আঘাত|চোট|ফেটে|রক্ত|ভাঙা|বাজ|অজ্ঞান)|মাথা\s*ঘুরে.*(পড়ে|অজ্ঞান)|খুলি\s*ফেটে|ঘাড়ে.*চোট|মেরুদণ্ডে|কানে.*রক্ত|নাকে.*রক্ত|স্মৃতিশক্তি\s*হারিয়েছে|তীব্র\s*মাথা\s*ব্যথা/i.test(text) ||
    /\b(matha\s*ghurche|matha\s*betha|headache|severe\s*headache|head\s*injury|skull\s*fracture)\b/i.test(text)
  ) {
    const hasBleeding = /রক্ত|bleed|hemorrhage|khoon/i.test(text);
    if (hasBleeding) {
      return {
        translatedEnglish: 'severe cranial trauma skull laceration head injury arterial hemorrhage rokto porche matha fete',
        detectedLanguage: hasBengaliScript ? 'Bengali (বাংলা)' : 'Benglish (বাংলা in Roman Script)',
        englishSummary: 'Severe head trauma with acute bleeding / skull laceration',
        isTranslated: true,
        matched_symptom_id: 'sym-ts-01',
        protocol_key: 'trauma',
      };
    }
    return {
      translatedEnglish: 'thunderclap severe headache closed head injury acute cranial trauma matha betha',
      detectedLanguage: hasBengaliScript ? 'Bengali (বাংলা)' : 'Benglish (বাংলা in Roman Script)',
      englishSummary: 'Severe cranial trauma / skull laceration or thunderclap headache',
      isTranslated: true,
      matched_symptom_id: 'sym-ns-02',
      protocol_key: 'stroke',
    };
  }

  // 8. SEIZURE / CONVULSIONS / FITS (Checked before cardiac arrest)
  if (
    /খিঁচুনি|খিচুনী|ফিট|দাঁত\s*লেগে|কাঁপছে|মুখ\s*দিয়ে\s*ফেনা|মৃগীরোগ|হাত\s*পা\s*শক্ত|আক্ষেপ/i.test(text) ||
    /\b(khichuni|fit\s*hoyche|daat\s*lege\s*geche|seizure|convulsions|fits|status\s*epilepticus)\b/i.test(text)
  ) {
    return {
      translatedEnglish: 'generalized tonic clonic seizure convulsions status epilepticus khichuni fit',
      detectedLanguage: hasBengaliScript ? 'Bengali (বাংলা)' : 'Benglish (বাংলা in Roman Script)',
      englishSummary: 'Acute convulsions / active seizure / status epilepticus',
      isTranslated: true,
      matched_symptom_id: 'sym-ns-03',
      protocol_key: 'seizure',
    };
  }

  // 9. COMPOUND CRITICAL: CHEST PAIN + BREATHING DISTRESS (Requires both chest pain AND breathing distress)
  const hasChestIndicator =
    norm.includes('chest') ||
    /(বুক|বুকে|বুকের|বক্ষ)/.test(text) ||
    /chest|angina|cardiac|heart/.test(text) ||
    /buke|buker|bukh|bhuk|bhukke/.test(text);

  const hasPainIndicator =
    norm.includes('pain') ||
    /(ব্যথা|ব্যাথা|ব্যেথা|বেথা|যন্ত্রণা|কষ্ট|চাপ|ভারী|জ্বালা|পোড়া|ধুকধুক|ধড়ফড়|ধড়ফড়|ধরফর|ফাটা|ছুঁচ|কামড়ানো|কামড়াচ্ছে|চেপে)/.test(text) ||
    /betha|byatha|batha|chap|jwala|pressure|tightness|pain/.test(text);

  const hasBreathIndicator =
    norm.includes('breath') ||
    norm.includes('distress') ||
    /(শ্বাস|দম|নিঃশ্বাস|হাঁপানি|শ্বাসকষ্ট|হাপানি|হাঁপাচ্ছে|নীল)/.test(text) ||
    /saash|saas|sash|shash|shas|shwas|breath|dyspnea|asthma|choking|dam\s*atke|dom\s*atke|nite\s*parche/.test(text);

  if (hasChestIndicator && hasPainIndicator && hasBreathIndicator) {
    return {
      translatedEnglish: 'acute crushing chest pain severe shortness of breath respiratory distress heart attack stemi buke betha shash koshto',
      detectedLanguage: hasBengaliScript ? 'Bengali (বাংলা)' : 'Benglish (বাংলা in Roman Script)',
      englishSummary: 'Acute chest pain with severe respiratory distress / Suspected Heart Attack (STEMI)',
      isTranslated: true,
      matched_symptom_id: 'sym-cr-01',
      protocol_key: 'cardiac',
    };
  }

  // 10. FRACTURE / ORTHOPEDIC TRAUMA (Checked before general limb pain)
  if (
    norm.includes('fracture') ||
    /(হাড়|হাত|পা|কোমর|কব্জি|হাঁটু|পাঁজর|মেরুদণ্ড|গাঁট).*(ভাঙা|ভেঙে|মচকে|বেরিয়ে|মটকে|স্থানচ্যুত|গুঁড়ো|ফ্র্যাকচার)|স্থানচ্যুত|ফ্র্যাকচার/i.test(text) ||
    /\b(pa\s*bhenge|hath\s*bhenge|bone\s*fracture|broken\s*leg|broken\s*bone|broken\s*arm|bhenge\s*geche|darate\s*parchena)\b/i.test(text)
  ) {
    return {
      translatedEnglish: 'acute bone fracture compound trauma broken leg fracture pa bhenge had bhanga',
      detectedLanguage: hasBengaliScript ? 'Bengali (বাংলা)' : 'Benglish (বাংলা in Roman Script)',
      englishSummary: 'Acute compound bone fracture / severe orthopedic trauma',
      isTranslated: true,
      matched_symptom_id: 'sym-ts-leg-pain',
      protocol_key: 'trauma',
    };
  }

  // 11. ACUTE LEG PAIN / CALF PAIN / LOWER EXTREMITY TRAUMA / DVT (Checked before chest pain)
  if (
    /(পায়ে|পায়ের|পায়েতে|পায়ের|গোড়ালি|গোড়ালিতে|হাঁটু|হাঁটুতে|উরুতে|উরু|পেশি|পায়ের\s*ডিম|\bপা\b|পা(?![শনিথা\w])).*(ব্যথা|ব্যাথা|ব্যেথা|বেথা|যন্ত্রণা|কষ্ট|টান|ফুলে|ফোলা|জ্বালা|ছিঁড়ে|খিল|ভারী|ভর\s*দিতে|চোট|আঘাত|ঝিঁঝিঁ|মচকে)/i.test(text) ||
    /(পায়ে\s*ব্যথা|পায়ে\s*ব্যাথা|পায়ের\s*ব্যথা|পা\s*ব্যথা|পা\s*ব্যথা\s*করছে|পায়ে\s*যন্ত্রণা|পায়ে\s*অসহ্য\s*যন্ত্রণা|হাঁটুতে\s*ব্যথা|হাঁটুর\s*ব্যথা|হাঁটু\s*ফুলে|গোড়ালিতে\s*ব্যথা|গোড়ালির\s*ব্যথা|উরুতে\s*ব্যথা|পায়ে\s*টান|পা\s*ফুলে|পায়ে\s*খিল|পা\s*ফেলতে\s*পারছে\s*না|পায়ের\s*ডিম\s*ফুলে|পা\s*অবশ|পা\s*ঝিঁঝিঁ|ভর\s*দিতে\s*পারছে\s*না|পা\s*মচকে|পায়ে\s*চোট|পায়ে\s*আঘাত)/i.test(text) ||
    /\b(pae\s*betha|paaye\s*betha|paer\s*betha|pa\s*betha|pa\s*dard|taang\s*dard|leg\s*pain|calf\s*pain|knee\s*pain|thigh\s*pain|ankle\s*pain|swollen\s*leg|leg\s*swelling|dvt)\b/i.test(text)
  ) {
    return {
      translatedEnglish: 'acute leg pain lower extremity trauma suspected dvt paaye betha',
      detectedLanguage: hasBengaliScript ? 'Bengali (বাংলা)' : 'Benglish (বাংলা in Roman Script)',
      englishSummary: 'Acute leg pain / suspected DVT or lower extremity trauma',
      isTranslated: true,
      matched_symptom_id: 'sym-ts-leg-pain',
      protocol_key: 'trauma',
    };
  }

  // 12. CHEST PAIN / CARDIAC / HEART ATTACK
  if (
    (hasChestIndicator && hasPainIndicator) ||
    /(বুক|বুকে|বুকের|বক্ষ).*(ব্যথা|ব্যাথা|ব্যেথা|বেথা|যন্ত্রণা|কষ্ট|চাপ|ভারী|জ্বালা|পোড়া|ধুকধুক|ধড়ফড়|ধড়ফড়|ধরফর|ফাটা|ছুঁচ|কামড়ানো|কামড়াচ্ছে|চেপে|চিনচিন)|বুকে\s*ব্যথা|বুক\s*ব্যথা|বুকের\s*ব্যথা|বুকে\s*চাপ|বুক\s*ধড়ফড়|বুক\s*ধড়ফড়|বুক\s*ধুকপুক|বুকে\s*জ্বালা|বুকে\s*ভারি|হার্ট\s*(অ্যাটাক|ফেল|স্ট্রোক|সমস্যা|পেইন|অসুখ)|হার্টের\s*অসুখ|হৃদরোগ|হৃদযন্ত্র|এনজাইনা|বাম\s*হাতে\s*(ব্যথা|ছড়িয়ে)/i.test(text) ||
    /\b(heart\s*attack|angina|cardiac|chest\s*pain|buke\s*betha|buk\s*betha|buker\s*betha|bukh\s*e\s*betha|bukhe\s*betha|buke\s*chap|buke\s*jwala|buk\s*dhorphor)\b/i.test(text)
  ) {
    return {
      translatedEnglish: 'acute chest pain heart attack cardiac angina buke betha buker byatha',
      detectedLanguage: hasBengaliScript ? 'Bengali (বাংলা)' : 'Benglish (বাংলা in Roman Script)',
      englishSummary: 'Acute chest pain / suspected heart attack or angina',
      isTranslated: true,
      matched_symptom_id: 'sym-cr-01',
      protocol_key: 'cardiac',
    };
  }

  // 12. UNRESPONSIVE / CARDIAC ARREST / COLLAPSE (Highest resuscitation priority before dyspnea)
  if (
    norm.includes('unresponsive') ||
    /অচেতন|অজ্ঞান|বেহুশ|বেহুঁশ|জ্ঞান\s*(হারিয়েছে|নেই|হারাচ্ছে)|সাড়া\s*(দিচ্ছে\s*না|শব্দ\s*নেই)|পালস\s*(নেই|পাওয়া)|নাড়ি\s*(চলছে\s*না|নেই)|হার্ট\s*বন্ধ|নিস্পন্দ|চোখ\s*উল্টে|শ্বাস-প্রশ্বাস\s*নেই|পড়ে\s*গিয়ে\s*অচেতন/i.test(text) ||
    /\b(behosh|agyan|oggan|gyan\s*নেই|sara\s*dichena|pulse\s*nei|nari\s*nei|unresponsive|cardiac\s*arrest|no\s*pulse|cpr|collapsed)\b/i.test(text)
  ) {
    return {
      translatedEnglish: 'cardiac arrest unresponsive no pulse cpr collapsed ocheton behosh agyan',
      detectedLanguage: hasBengaliScript ? 'Bengali (বাংলা)' : 'Benglish (বাংলা in Roman Script)',
      englishSummary: 'Unresponsive patient / suspected cardiac arrest / CPR required',
      isTranslated: true,
      matched_symptom_id: 'sym-cr-02',
      protocol_key: 'arrest',
    };
  }

  // 13. BREATHING DISTRESS / ASTHMA / RESPIRATORY / CHOKING
  if (
    hasBreathIndicator ||
    /呼吸|শ্বাস.*(কষ্ট|নিতে|বন্ধ|আটকানো|আটকে|ফেলা|টান|প্রশ্বাস)|দম.*(বন্ধ|আটকানো|আটকে|ফুরিয়ে|নিতে)|নিঃশ্বাস|হাঁপানি|শ্বাসকষ্ট|হাপানি|হাঁপাচ্ছে|গলায়.*(আটকে|আটকানো|খাবার)|সাঁই\s*সাঁই|নীল\s*হয়ে\s*গেছে|ফুসফুসে\s*সংক্রমণ|কাশতে\s*কাশতে\s*দম/i.test(text) ||
    /\b(saash|saas|sash|shash|shas|shwas|shwaas|haphani|hapaani|dam\s*bondho|dom\s*bondho|dam\s*atke|dom\s*atke|nite\s*parchena|nite\s*parche\s*না|breathless|shortness\s*of\s*breath|asthma|choking|wheezing)\b/i.test(text)
  ) {
    return {
      translatedEnglish: 'severe shortness of breath respiratory distress asthma choking shash koshto dam bondho',
      detectedLanguage: hasBengaliScript ? 'Bengali (বাংলা)' : 'Benglish (বাংলা in Roman Script)',
      englishSummary: 'Severe shortness of breath / acute respiratory distress or asthma',
      isTranslated: true,
      matched_symptom_id: 'sym-cr-07',
      protocol_key: 'respiratory',
    };
  }

  // 14. STROKE / PARALYSIS / NEUROLOGICAL / FACIAL DROOP
  if (
    norm.includes('stroke') ||
    /স্ট্রোক|প্যারালাইসিস|প্যারালাইজড|হেমিপ্লেজিয়া|মুখ.*(বাঁকা|বেঁকে|বেকে)|(এক\s*পাশ|হাত|পা|শরীর).*(অবশ|অসাড়|তুলতে\s*পারছে\s*না|কাজ\s*করছে\s*না)|কথা.*(বলতে\s*পারছে\s*না|জড়িয়ে|আটকে|অস্পষ্ট)|জিভ\s*জড়িয়ে|চোখে\s*অন্ধকার|হঠাৎ\s*অবশ|মাথা\s*ঘুরে\s*পড়ে/i.test(text) ||
    /\b(mukhe\s*baka|mukh\s*beke|paralysis|stroke|face\s*droop|slurred\s*speech|haath\s*sunn|pa\s*sunn|kotha\s*joriye)\b/i.test(text)
  ) {
    return {
      translatedEnglish: 'acute stroke paralysis facial droop slurred speech FAST protocol mukh beke geche',
      detectedLanguage: hasBengaliScript ? 'Bengali (বাংলা)' : 'Benglish (বাংলা in Roman Script)',
      englishSummary: 'Acute stroke symptoms / FAST protocol (facial droop, arm weakness, speech slurring)',
      isTranslated: true,
      matched_symptom_id: 'sym-ns-01',
      protocol_key: 'stroke',
    };
  }

  // 15. ARTERIAL BLEEDING / MASSIVE TRAUMA / ACCIDENT
  if (
    norm.includes('bleeding') ||
    /রক্ত.*(পড়ছে|পাত|ক্ষরণ|বের|ঝরছে|থামছে\s*না|বন্ধ\s*হচ্ছে\s*না|ফিনকি|বমি)|(পা|হাত|মাথা|শরীর|ধমনী).*(কেটে|ফেটে|ক্ষত).*রক্ত|রক্তপাত|রক্তক্ষরণ|অ্যাক্সিডেন্ট|দুর্ঘটনা|মারাত্মক\s*রক্তক্ষরণ|গভীর\s*ক্ষত/i.test(text) ||
    /\b(rokto|khoon|bleeding|blood\s*loss|arterial\s*bleed|trauma|paaye\s*theke\s*rokto|paer\s*rokto|finki\s*diye\s*rokto)\b/i.test(text)
  ) {
    const isLegBleed = /(পা|পায়ে|পায়ের|পায়ের|উরু|উরুতে|\bleg\b|thigh|calf)/i.test(text);
    return {
      translatedEnglish: isLegBleed
        ? 'arterial leg bleeding lower extremity hemorrhage trauma rokto'
        : 'arterial bleeding massive blood loss trauma hemorrhage rokto porchhe',
      detectedLanguage: hasBengaliScript ? 'Bengali (বাংলা)' : 'Benglish (বাংলা in Roman Script)',
      englishSummary: isLegBleed
        ? 'Profuse arterial leg bleeding / lower extremity hemorrhage'
        : 'Profuse arterial bleeding / traumatic hemorrhage',
      isTranslated: true,
      matched_symptom_id: isLegBleed ? 'sym-ts-leg-bleeding' : 'sym-ts-01',
      protocol_key: 'trauma',
    };
  }

  // 16. SEIZURE / CONVULSIONS / FITS
  if (
    /খিঁচুনি|খিচুনী|ফিট|দাঁত\s*লেগে|কাঁপছে|মুখ\s*দিয়ে\s*ফেনা|মৃগীরোগ|হাত\s*পা\s*শক্ত|আক্ষেপ|চোখ\s*উল্টে\s*খিঁচুনি/i.test(text) ||
    /\b(khichuni|fit\s*hoyche|daat\s*lege\s*geche|seizure|convulsions|fits|status\s*epilepticus)\b/i.test(text)
  ) {
    return {
      translatedEnglish: 'generalized tonic clonic seizure convulsions status epilepticus khichuni fit',
      detectedLanguage: hasBengaliScript ? 'Bengali (বাংলা)' : 'Benglish (বাংলা in Roman Script)',
      englishSummary: 'Acute convulsions / active seizure / status epilepticus',
      isTranslated: true,
      matched_symptom_id: 'sym-ns-03',
      protocol_key: 'seizure',
    };
  }

  // 17. ACUTE ABDOMINAL / STOMACH PAIN / VOMITING
  if (
    /পেট.*(ব্যথা|ব্যাথা|যন্ত্রণা|কামড়াচ্ছে|মোচড়|খারাপ|ফুলে|শক্ত)|বমি.*(হচ্ছে|করছে|রক্ত)|ডায়রিয়া|পাতলা\s*পায়খানা|অ্যাপেন্ডিসাইটিস|খাদ্য\s*বিষক্রিয়া/i.test(text) ||
    /\b(pete\s*betha|pet\s*betha|bomi\s*hocche|stomach\s*pain|abdominal\s*pain|vomiting|acute\s*abdomen)\b/i.test(text)
  ) {
    return {
      translatedEnglish: 'severe stomach pain acute abdominal pain vomiting pete betha',
      detectedLanguage: hasBengaliScript ? 'Bengali (বাংলা)' : 'Benglish (বাংলা in Roman Script)',
      englishSummary: 'Severe abdominal pain / acute abdomen or persistent vomiting',
      isTranslated: true,
      matched_symptom_id: 'sym-gm-01',
      protocol_key: 'abdominal',
    };
  }

  // 18. BLOOD REQUIREMENT
  if (
    /রক্ত.*(দরকার|লাগবে|প্রয়োজন|চাই)|ব্লাড.*(দরকার|লাগবে)|প্লাটিলেট.*(দরকার|লাগবে)|(ও|এ|বি|এবি)\s*(পজিটিভ|নেগেটিভ)\s*রক্ত|রক্তদাতা/i.test(text) ||
    /\b(rokto\s*dorkar|blood\s*needed|rakt|platelet\s*lagbe|prbc)\b/i.test(text)
  ) {
    return {
      translatedEnglish: 'blood needed emergency PRBC transfusion rokto dorkar',
      detectedLanguage: hasBengaliScript ? 'Bengali (বাংলা)' : 'Benglish (বাংলা in Roman Script)',
      englishSummary: 'Urgent PRBC or platelet blood transfusion requirement',
      isTranslated: true,
      matched_symptom_id: 'sym-ts-01',
      protocol_key: 'blood',
    };
  }

  // 19. NEAREST HOSPITAL / EMERGENCY SEARCH
  if (
    /হাসপাতাল|জরুরি\s*বিভাগ|ডাক্তার|ইমার্জেন্সি|অ্যাম্বুলেন্স|আইসিইউ\s*বেড/i.test(text) ||
    /\b(hospital|doctor|emergency|kacher\s*hospital|ambulance)\b/i.test(text)
  ) {
    return {
      translatedEnglish: 'nearest hospital closest emergency room ambulance',
      detectedLanguage: hasBengaliScript ? 'Bengali (বাংলা)' : 'Benglish (বাংলা in Roman Script)',
      englishSummary: 'Locating nearest emergency hospital and critical care bed',
      isTranslated: true,
      protocol_key: 'general',
    };
  }

  // Generic fallback if Bengali script detected but no specific pattern matched
  if (hasBengaliScript) {
    return {
      translatedEnglish: `emergency medical condition ${raw}`,
      detectedLanguage: 'Bengali (বাংলা)',
      englishSummary: `Urgent Emergency Evaluation: "${raw}"`,
      isTranslated: true,
      protocol_key: 'general',
    };
  }

  return {
    translatedEnglish: raw,
    detectedLanguage: 'English',
    englishSummary: raw,
    isTranslated: false,
  };
}

/**
 * Creates a rich, medically structured DetailedSymptom dynamically on-the-fly
 * for any natural language input or translated Bengali voice query.
 * Ensures the user NEVER gets dumped into an empty search directory!
 */
export function createDynamicSymptomFromTriage(
  rawQuery: string,
  translation: BengaliTranslationResult,
  aiResult: any,
  protocol: any
): DetailedSymptom {
  const isBengali = translation.isTranslated || /[\u0980-\u09FF]/.test(rawQuery);
  const name = aiResult?.detected_symptom
    ? aiResult.detected_symptom
    : isBengali && translation.englishSummary
    ? translation.englishSummary
    : rawQuery.length > 0
    ? `Emergency Triage: "${rawQuery}"`
    : 'Acute Emergency Medical Evaluation';

  const overview =
    aiResult?.problem_overview ||
    protocol?.immediate_action?.instruction ||
    'The patient requires immediate emergency evaluation to stabilize vital signs and rule out life-threatening internal complications.';

  const conditions =
    Array.isArray(aiResult?.possible_conditions) && aiResult.possible_conditions.length > 0
      ? aiResult.possible_conditions
      : [translation.englishSummary || 'Acute Medical Emergency requiring ER evaluation'];

  const actions =
    Array.isArray(aiResult?.immediate_solution) && aiResult.immediate_solution.length > 0
      ? aiResult.immediate_solution
      : Array.isArray(protocol?.protocol_steps) && protocol.protocol_steps.length > 0
      ? protocol.protocol_steps
      : [
          'Keep the patient seated or resting comfortably with back supported.',
          'Loosen any tight clothing around the neck, chest, or waistline.',
          'Monitor consciousness, pulse rate, and breathing ease continuously.',
          'Call 108 Emergency Ambulance or proceed immediately to nearest emergency department.',
        ];

  const doNots =
    Array.isArray(aiResult?.what_not_to_do) && aiResult.what_not_to_do.length > 0
      ? aiResult.what_not_to_do
      : Array.isArray(protocol?.do_nots) && protocol.do_nots.length > 0
      ? protocol.do_nots
      : [
          '❌ Do NOT force the patient to walk or exert strenuous physical effort.',
          '❌ Do NOT give strong unprescribed painkillers or heavy food/drinks prior to doctor assessment.',
        ];

  return {
    id: `sym-dyn-${Date.now()}`,
    name,
    category: protocol?.category || 'Emergency Medicine',
    severity: (aiResult?.severity as any) || 'RED',
    esi_level: aiResult?.esi_level || protocol?.esi_acuity || 'ESI-1 (Immediate Resuscitation)',
    target_ward: (aiResult?.recommended_ward as any) || protocol?.target_ward || 'adult_icu',
    problem_overview: overview,
    possible_conditions: conditions,
    immediate_actions: actions,
    what_not_to_do: doNots,
    what_to_check: {
      vital_signs: [
        'Heart Rate / Radial Pulse (Rate and Rhythm)',
        'Respiration Rate & Depth (Gasping vs Normal)',
        'Mental Alertness & Response to Verbal Commands',
      ],
      red_flags: [
        'Sudden loss of consciousness or unresponsiveness',
        'Severe breathlessness, gasping, or blue-tinted lips (cyanosis)',
        'Sudden severe chest pressure, radiating pain, or profuse cold sweats',
      ],
      physical_signs: [
        'Assess skin temperature (cold and clammy indicates shock)',
        'Look for asymmetrical facial droop or unilateral limb weakness',
      ],
    },
    home_care_or_triage: 'Transit immediately to the nearest equipped emergency department. Keep vitals monitored.',
    hospital_prep: 'Gather active medications, government ID, and previous medical discharge summaries.',
    urgency_note:
      aiResult?.urgency_note ||
      'Golden Hour critical window: immediate bedside resuscitation and clinical diagnostic workup recommended.',
  };
}

export function normalizeBengaliPhonetics(query: string): string {
  // First, check if pure Bengali script needs translation
  const translation = translateBengaliToEnglish(query);
  let text = translation.translatedEnglish.toLowerCase().trim();

  // Map Bengali script words to Benglish equivalents
  text = text
    .replace(/বুকে\s*ব্যথা\s*করছে|বুকে\s*ব্যাথা\s*করছে|বুক\s*ব্যথা\s*করছে|বুক\s*ব্যাথা\s*করছে|বুকে\s*ব্যেথা\s*করছে/g, 'buke betha korche')
    .replace(/বুকে\s*ব্যথা|বুকে\s*ব্যাথা|বুক\s*ব্যথা|বুক\s*ব্যাথা|বুকে\s*বেথা|বুকে\s*ব্যেথা/g, 'buke betha')
    .replace(/বুকে\s*চাপ|বুকে\s*ভারী|বুকে\s*কষ্ট/g, 'buke chap')
    .replace(/বুক\s*ধুকধুক|বুক\s*ফাটা/g, 'buk dhukdhuk')
    .replace(/বুকে\s*জ্বালা/g, 'buke jwala')
    .replace(/অজ্ঞান|বেহুশ|জ্ঞান\s*হারিয়েছে/g, 'behosh')
    .replace(/পায়ে\s*থেকে\s*রক্ত|পা\s*কেটে\s*গেছে|রক্ত\s*পড়ছে|রক্ত\s*পাত/g, 'paaye theke rokto')
    .replace(/পায়ের\s*ব্যথা|পায়ে\s*ব্যথা/g, 'paaye betha')
    .replace(/মাথা\s*ঘুরছে/g, 'matha ghurche')
    .replace(/শ্বাসকষ্ট|হাঁপানি|দম\s*আটকানো/g, 'haphani')
    .replace(/মুখে\s*বাঁকা|মুখ\s*বেঁকে\s*গেছে/g, 'mukhe baka');

  // Multi-word phrase normalizations for Speech-to-Text misheard dictations
  text = text
    .replace(/\bbook\s+a\s+betha\b/g, 'buke betha')
    .replace(/\bbook\s+a\s+batha\b/g, 'buke betha')
    .replace(/\bbook\s+a\s+beta\b/g, 'buke betha')
    .replace(/\bbook\s+a\s+byatha\b/g, 'buke betha')
    .replace(/\bbook\s+a\b/g, 'buke')
    .replace(/\bbhukke\s+betha\b/g, 'buke betha')
    .replace(/\bbhukke\s+batha\b/g, 'buke betha')
    .replace(/\bbhukke\s+beta\b/g, 'buke betha')
    .replace(/\bbhukke\b/g, 'buke')
    .replace(/\bbhuk\s+betha\b/g, 'buke betha')
    .replace(/\bbhuk\s+batha\b/g, 'buke betha')
    .replace(/\bbook\s+betha\b/g, 'buke betha')
    .replace(/\bbook\s+batha\b/g, 'buke betha')
    .replace(/\bbooke\s+betha\b/g, 'buke betha')
    .replace(/\bbooke\s+batha\b/g, 'buke betha')
    .replace(/\bboke\s+betha\b/g, 'buke betha')
    .replace(/\bboke\s+batha\b/g, 'buke betha')
    .replace(/\bboka\s+betha\b/g, 'buke betha')
    .replace(/\bboka\s+batha\b/g, 'buke betha');

  // Phonetic correction for speech recognition typos in Benglish (Chest / Buke variations)
  text = text
    .replace(/\bbuike\b/g, 'buke')
    .replace(/\bbukey\b/g, 'buke')
    .replace(/\bbuker\b/g, 'buke')
    .replace(/\bbhukke\b/g, 'buke')
    .replace(/\bbhuke\b/g, 'buke')
    .replace(/\bbhuker\b/g, 'buke')
    .replace(/\bbhuk\b/g, 'buke')
    .replace(/\bbhook\b/g, 'buke')
    .replace(/\bbhookh\b/g, 'buke')
    .replace(/\bbooke\b/g, 'buke')
    .replace(/\bbooker\b/g, 'buke')
    .replace(/\bbooka\b/g, 'buke')
    .replace(/\bbook\b/g, 'buke')
    .replace(/\bboke\b/g, 'buke')
    .replace(/\bboka\b/g, 'buke')
    .replace(/\bbokey\b/g, 'buke')
    .replace(/\bbok\b/g, 'buke')
    .replace(/\bbuka\b/g, 'buke')
    .replace(/\bbuki\b/g, 'buke')
    .replace(/\bchhati\b/g, 'buke')
    .replace(/\bchhatir\b/g, 'buke');

  // Pain / Betha variations
  text = text
    .replace(/\bbyatha\b/g, 'betha')
    .replace(/\bbatha\b/g, 'betha')
    .replace(/\bbaatha\b/g, 'betha')
    .replace(/\bbaata\b/g, 'betha')
    .replace(/\bbheta\b/g, 'betha')
    .replace(/\bbeta\b/g, 'betha')
    .replace(/\bvyatha\b/g, 'betha')
    .replace(/\bvatha\b/g, 'betha')
    .replace(/\bbethaa\b/g, 'betha')
    .replace(/\bbethha\b/g, 'betha')
    .replace(/\bbittha\b/g, 'betha')
    .replace(/\bbitha\b/g, 'betha')
    .replace(/\bbita\b/g, 'betha')
    .replace(/\bbada\b/g, 'betha')
    .replace(/\bbyaka\b/g, 'betha');

  // Action / Korche variations
  text = text
    .replace(/\bkorchhe\b/g, 'korche')
    .replace(/\bkoche\b/g, 'korche')
    .replace(/\bkorchey\b/g, 'korche')
    .replace(/\bkorce\b/g, 'korche')
    .replace(/\bkorchei\b/g, 'korche')
    .replace(/\bkhorche\b/g, 'korche');

  // Combined fallback: If query has any chest word (buke) AND any pain word (betha/pain/chap),
  // automatically append 'buke betha' so rule 2 ALWAYS matches ESI-1 Cardiac RED triage!
  if (text.includes('buke') && (text.includes('betha') || text.includes('pain') || text.includes('chap') || text.includes('jwala'))) {
    if (!text.includes('buke betha')) {
      text = text + ' buke betha';
    }
  }

  return text;
}

export function classifyEmergency(query: string, patientAge?: number): TriageClassification {
  const translation = translateBengaliToEnglish(query);
  const rawNormalized = (translation.isTranslated ? translation.translatedEnglish : query).toLowerCase().trim();
  const normalized = normalizeBengaliPhonetics(rawNormalized);

  // Blood group detection
  const bloodMatch = normalized.match(/\b(o-|o\+|a-|a\+|b-|b\+|ab-|ab\+)\b/i);
  const bloodKeyword =
    normalized.includes('blood') ||
    normalized.includes('prbc') ||
    normalized.includes('platelet') ||
    normalized.includes('plasma') ||
    normalized.includes('rokto');

  let bloodNeeded: { group?: string; component?: string } | undefined = undefined;
  if (bloodMatch || bloodKeyword) {
    bloodNeeded = {
      group: bloodMatch ? bloodMatch[1].toUpperCase() : 'O-',
      component: normalized.includes('platelet')
        ? 'PLATELETS'
        : normalized.includes('plasma')
        ? 'PLASMA'
        : 'PRBC',
    };
  }

  // Check Negations
  const isNegated =
    normalized.includes('no chest pain') ||
    normalized.includes('not breathless') ||
    normalized.includes('no bleeding') ||
    normalized.includes('fine now') ||
    normalized.includes('just acidity') ||
    normalized.includes('normal');

  if (isNegated && !normalized.includes('severe') && !normalized.includes('unresponsive')) {
    return {
      severity: 'GREEN',
      recommended_ward: 'general_oxygen',
      protocol_key: 'general',
      matched_keywords: ['ruled out critical symptoms'],
      score: 15,
      explanation: 'No critical acute telemetry flags detected. Safe for outpatient clinic or oral antacid evaluation.',
      offer_hold: false,
    };
  }

  // Direct fast path for translated clinical emergencies
  if (translation.isTranslated && translation.protocol_key) {
    if (translation.protocol_key === 'arrest') {
      return {
        severity: 'RED',
        recommended_ward: 'adult_icu',
        protocol_key: 'arrest',
        matched_keywords: ['unresponsive', 'cardiac arrest / pulseless'],
        score: 100,
        explanation: 'Loss of responsiveness and respiratory collapse requires immediate CPR & Level-1 Resuscitation Bay.',
        offer_hold: true,
        blood_needed: bloodNeeded,
      };
    }

    if (translation.protocol_key === 'cardiac') {
      const isCompound = translation.englishSummary.toLowerCase().includes('respiratory distress');
      return {
        severity: 'RED',
        recommended_ward: 'cardiac_icu',
        protocol_key: 'cardiac',
        matched_keywords: isCompound
          ? ['acute chest pain', 'severe respiratory distress', 'suspected STEMI']
          : ['acute chest pain', 'cardiac angina / heart attack'],
        score: isCompound ? 99 : 96,
        explanation: isCompound
          ? 'Crushing chest pain with respiratory distress indicates high-risk STEMI. Immediate Cath Lab activation mandatory.'
          : 'Acute chest pain indicating coronary ischemia. Immediate ECG & Cardiac ICU bed hold.',
        offer_hold: true,
        blood_needed: bloodNeeded,
      };
    }

    if (translation.protocol_key === 'respiratory') {
      return {
        severity: 'RED',
        recommended_ward: 'general_oxygen',
        protocol_key: 'respiratory',
        matched_keywords: ['severe shortness of breath', 'asthma / respiratory distress'],
        score: 92,
        explanation: 'Severe dyspnea / bronchospasm requires immediate high-flow oxygen and nebulization.',
        offer_hold: true,
        blood_needed: bloodNeeded,
      };
    }

    if (translation.protocol_key === 'stroke') {
      return {
        severity: 'RED',
        recommended_ward: 'adult_icu',
        protocol_key: 'stroke',
        matched_keywords: ['acute stroke / paralysis', 'FAST protocol alert'],
        score: 95,
        explanation: 'Acute neurological deficit within thrombolytic window. Immediate non-contrast CT and Neuro-ICU team alerted.',
        offer_hold: true,
        blood_needed: bloodNeeded,
      };
    }

    if (translation.protocol_key === 'trauma') {
      if (translation.matched_symptom_id === 'sym-ts-leg-pain') {
        return {
          severity: 'YELLOW',
          recommended_ward: 'adult_icu',
          protocol_key: 'trauma',
          matched_keywords: ['acute leg pain / lower extremity trauma', 'suspected DVT'],
          score: 80,
          explanation: 'Acute lower extremity pain or swelling. Doppler ultrasound and orthopedic evaluation indicated.',
          offer_hold: true,
          blood_needed: bloodNeeded,
        };
      }
      return {
        severity: 'RED',
        recommended_ward: 'adult_icu',
        protocol_key: 'trauma',
        matched_keywords: ['arterial bleeding', 'massive hemorrhage'],
        score: 95,
        explanation: 'Active arterial blood loss requires immediate pressure/tourniquet and massive transfusion protocol.',
        offer_hold: true,
        blood_needed: bloodNeeded,
      };
    }

    if (translation.protocol_key === 'seizure') {
      return {
        severity: 'RED',
        recommended_ward: 'adult_icu',
        protocol_key: 'seizure',
        matched_keywords: ['active seizure', 'status epilepticus risk'],
        score: 92,
        explanation: 'Active convulsions require immediate airway protection, lateral positioning, and IV anticonvulsants.',
        offer_hold: true,
        blood_needed: bloodNeeded,
      };
    }

    if (translation.protocol_key === 'pediatric') {
      return {
        severity: 'RED',
        recommended_ward: 'pediatric_icu',
        protocol_key: 'pediatric',
        matched_keywords: ['pediatric emergency', 'high fever / febrile fit'],
        score: 90,
        explanation: 'Pediatric emergency requiring specialized PICU observation and pediatric specialist care.',
        offer_hold: true,
        blood_needed: bloodNeeded,
      };
    }

    if (translation.protocol_key === 'burns') {
      return {
        severity: 'RED',
        recommended_ward: 'adult_icu',
        protocol_key: 'burns',
        matched_keywords: ['thermal injury', 'burns / fluid loss risk'],
        score: 88,
        explanation: 'Thermal shock and airway edema risk. Parkland formula resuscitation and sterile burn bay required.',
        offer_hold: true,
        blood_needed: bloodNeeded,
      };
    }

    if (translation.protocol_key === 'poison') {
      return {
        severity: 'RED',
        recommended_ward: 'adult_icu',
        protocol_key: 'poison',
        matched_keywords: ['toxic ingestion', 'envenomation / snakebite'],
        score: 95,
        explanation: 'Acute envenomation or toxic ingestion. Immediate antivenom / gastric decontamination indicated.',
        offer_hold: true,
        blood_needed: bloodNeeded,
      };
    }

    if (translation.protocol_key === 'allergy') {
      return {
        severity: 'RED',
        recommended_ward: 'adult_icu',
        protocol_key: 'allergy',
        matched_keywords: ['anaphylaxis', 'laryngeal swelling'],
        score: 90,
        explanation: 'Severe systemic hypersensitivity with airway compromise. Immediate IM Epinephrine required.',
        offer_hold: true,
        blood_needed: bloodNeeded,
      };
    }

    if (translation.protocol_key === 'abdominal') {
      return {
        severity: 'YELLOW',
        recommended_ward: 'adult_icu',
        protocol_key: 'abdominal',
        matched_keywords: ['acute abdomen', 'severe gastrointestinal pain'],
        score: 75,
        explanation: 'Acute abdominal guarding or intractable vomiting. Emergency ultrasound and surgical consult advised.',
        offer_hold: true,
        blood_needed: bloodNeeded,
      };
    }

    if (translation.protocol_key === 'blood') {
      return {
        severity: 'RED',
        recommended_ward: 'adult_icu',
        protocol_key: 'trauma',
        matched_keywords: ['blood transfusion required', 'PRBC / Platelet hold'],
        score: 90,
        explanation: 'Emergency blood bank reservation activated for uncrossmatched resuscitation.',
        offer_hold: true,
        blood_needed: bloodNeeded || { group: 'O-', component: 'PRBC' },
      };
    }
  }

  // 1. CARDIAC ARREST / UNRESPONSIVE
  if (
    normalized.includes('cardiac arrest') ||
    normalized.includes('no pulse') ||
    normalized.includes('stopped breathing') ||
    normalized.includes('unresponsive') ||
    normalized.includes('cpr') ||
    normalized.includes('collapsed') ||
    normalized.includes('behosh') ||
    normalized.includes('agyan')
  ) {
    return {
      severity: 'RED',
      recommended_ward: 'adult_icu',
      protocol_key: 'arrest',
      matched_keywords: ['unresponsive', 'cardiac arrest / no pulse'],
      score: 100,
      explanation: 'Loss of responsiveness and respiratory collapse requires immediate CPR & Level-1 Resuscitation Bay.',
      offer_hold: true,
      blood_needed: bloodNeeded,
    };
  }

  // 1.5 COMPOUND CRITICAL: ACUTE CHEST PAIN + RESPIRATORY DISTRESS / STEMI (Highest Priority ESI-1)
  if (
    (normalized.includes('chest pain') || normalized.includes('buke betha') || normalized.includes('heart attack') || normalized.includes('cardiac') || normalized.includes('angina')) &&
    (normalized.includes('respiratory distress') || normalized.includes('shortness of breath') || normalized.includes('breath') || normalized.includes('shash') || normalized.includes('distress') || normalized.includes('stemi') || normalized.includes('haphani'))
  ) {
    return {
      severity: 'RED',
      recommended_ward: 'cardiac_icu',
      protocol_key: 'cardiac',
      matched_keywords: ['acute chest pain', 'severe respiratory distress', 'suspected STEMI'],
      score: 99,
      explanation: 'Compound Critical Emergency: Crushing chest pain accompanied by respiratory distress indicates high-risk STEMI / acute cardiogenic decompensation. Immediate Cath Lab & Resuscitation Bay activation mandatory.',
      offer_hold: true,
      blood_needed: bloodNeeded,
    };
  }

  // 2. SEVERE CHEST PAIN / HEART ATTACK
  if (
    normalized.includes('chest pain') ||
    normalized.includes('heart attack') ||
    normalized.includes('angina') ||
    normalized.includes('cardiac') ||
    normalized.includes('left arm pain') ||
    normalized.includes('jaw pain') ||
    normalized.includes('buke betha') ||
    normalized.includes('buk betha') ||
    normalized.includes('buke chap') ||
    normalized.includes('buk dhukdhuk') ||
    normalized.includes('buke jwala')
  ) {
    return {
      severity: 'RED',
      recommended_ward: 'cardiac_icu',
      protocol_key: 'cardiac',
      matched_keywords: ['buke betha korche', 'chest pain / cardiac symptoms'],
      score: 95,
      explanation: 'Acute coronary syndrome presentation. Requires urgent Cath Lab & Cardiac ICU monitored bed.',
      offer_hold: true,
      blood_needed: bloodNeeded,
    };
  }

  // 3. STROKE / PARALYSIS / FAST
  if (
    normalized.includes('stroke') ||
    normalized.includes('paralysis') ||
    normalized.includes('face droop') ||
    normalized.includes('slurred speech') ||
    normalized.includes('arm weakness') ||
    normalized.includes('brain attack') ||
    normalized.includes('mouth crooked') ||
    normalized.includes('mukhe baka')
  ) {
    return {
      severity: 'RED',
      recommended_ward: 'adult_icu',
      protocol_key: 'stroke',
      matched_keywords: ['stroke symptoms', 'FAST protocol positive'],
      score: 95,
      explanation: 'Acute neurological deficit within active thrombolysis window. Emergency CT Brain priority.',
      offer_hold: true,
      blood_needed: bloodNeeded,
    };
  }

  // 4. ARTERIAL BLEEDING / MASSIVE TRAUMA
  if (
    normalized.includes('bleeding') ||
    normalized.includes('blood loss') ||
    normalized.includes('accident') ||
    normalized.includes('spurting') ||
    normalized.includes('stab') ||
    normalized.includes('khoon') ||
    normalized.includes('rokto') ||
    normalized.includes('trauma') ||
    normalized.includes('leg bleeding') ||
    normalized.includes('paaye theke rokto') ||
    normalized.includes('paer rokto') ||
    normalized.includes('taang se khoon') ||
    normalized.includes('paav se khoon') ||
    normalized.includes('cut on leg')
  ) {
    return {
      severity: 'RED',
      recommended_ward: 'adult_icu',
      protocol_key: 'trauma',
      matched_keywords: ['arterial bleeding', 'massive blood loss', 'lower extremity trauma / bleeding'],
      score: 90,
      explanation: 'Critical vascular compromise & acute hemorrhage. Direct compression and trauma surgery readiness alerted.',
      offer_hold: true,
      blood_needed: bloodNeeded || { group: 'O-', component: 'PRBC' },
    };
  }

  // 4B. ACUTE LEG PAIN / LOWER LIMB TRAUMA / DVT / FRACTURE
  if (
    normalized.includes('leg pain') ||
    normalized.includes('calf pain') ||
    normalized.includes('thigh pain') ||
    normalized.includes('knee pain') ||
    normalized.includes('shin pain') ||
    normalized.includes('broken leg') ||
    normalized.includes('fracture') ||
    normalized.includes('bone pain') ||
    normalized.includes('leg injury') ||
    normalized.includes('dvt') ||
    normalized.includes('swollen leg') ||
    normalized.includes('leg cramp') ||
    normalized.includes('paaye betha') ||
    normalized.includes('payer betha') ||
    normalized.includes('taang mein dard') ||
    normalized.includes('paer dard')
  ) {
    return {
      severity: 'YELLOW',
      recommended_ward: 'general_oxygen',
      protocol_key: 'general',
      matched_keywords: ['acute leg pain', 'suspected DVT / fracture / lower extremity trauma'],
      score: 82,
      explanation: 'Acute lower extremity pain requires urgent evaluation for DVT, fracture, compartment syndrome, or acute limb ischemia.',
      offer_hold: true,
      blood_needed: bloodNeeded,
    };
  }

  // 5. PEDIATRIC CONVULSION / FEVER
  if (
    (patientAge !== undefined && patientAge <= 12) ||
    normalized.includes('child') ||
    normalized.includes('baby') ||
    normalized.includes('baccha') ||
    normalized.includes('bacha') ||
    normalized.includes('shishu') ||
    normalized.includes('pediatric') ||
    normalized.includes('pedia')
  ) {
    return {
      severity: 'RED',
      recommended_ward: 'pediatric_icu',
      protocol_key: 'pediatric',
      matched_keywords: ['pediatric emergency', 'child high fever/fit'],
      score: 88,
      explanation: 'Pediatric urgent distress. Auto-routed to dedicated Pediatric ICU & Neonatal Care Unit.',
      offer_hold: true,
      blood_needed: bloodNeeded,
    };
  }

  // 6. RESPIRATORY DISTRESS / ASTHMA / CHOKING
  if (
    normalized.includes('asthma') ||
    normalized.includes('breathless') ||
    normalized.includes('breathing') ||
    normalized.includes('shortness of breath') ||
    normalized.includes('saans') ||
    normalized.includes('sash') ||
    normalized.includes('wheezing') ||
    normalized.includes('oxygen') ||
    normalized.includes('choking') ||
    normalized.includes('stridor') ||
    normalized.includes('suffocation')
  ) {
    return {
      severity: 'RED',
      recommended_ward: 'general_oxygen',
      protocol_key: 'respiratory',
      matched_keywords: ['respiratory distress', 'hypoxic wheezing', 'dyspnea'],
      score: 85,
      explanation: 'Acute airway constriction and hypoxic stress. High-flow oxygen support with continuous SpO2 nebulization required.',
      offer_hold: true,
      blood_needed: bloodNeeded,
    };
  }

  // 7. BURNS / FIRE / SCALDS
  if (
    normalized.includes('burn') ||
    normalized.includes('fire') ||
    normalized.includes('scald') ||
    normalized.includes('acid') ||
    normalized.includes('electric shock') ||
    normalized.includes('electrocution')
  ) {
    return {
      severity: 'RED',
      recommended_ward: 'adult_icu',
      protocol_key: 'burn',
      matched_keywords: ['thermal injury', 'burns / fluid loss risk'],
      score: 85,
      explanation: 'Thermal shock and airway edema risk. Fluid resuscitation using Parkland formula and sterile burn bay required.',
      offer_hold: true,
      blood_needed: bloodNeeded,
    };
  }

  // 8. FRACTURES / BONE INJURY / FALL
  if (
    normalized.includes('fracture') ||
    normalized.includes('broken bone') ||
    normalized.includes('broken arm') ||
    normalized.includes('broken leg') ||
    normalized.includes('dislocation') ||
    normalized.includes('fall from height')
  ) {
    return {
      severity: 'YELLOW',
      recommended_ward: 'general_oxygen',
      protocol_key: 'general',
      matched_keywords: ['orthopedic trauma', 'skeletal injury'],
      score: 75,
      explanation: 'Acute skeletal trauma requiring digital X-ray, neurovascular integrity check, and limb splinting.',
      offer_hold: true,
      blood_needed: bloodNeeded,
    };
  }

  // 9. MATERNITY / PREGNANCY / LABOR
  if (
    normalized.includes('pregnancy') ||
    normalized.includes('pregnant') ||
    normalized.includes('labor') ||
    normalized.includes('delivery') ||
    normalized.includes('contractions') ||
    normalized.includes('water broke')
  ) {
    return {
      severity: 'RED',
      recommended_ward: 'general_oxygen',
      protocol_key: 'maternity',
      matched_keywords: ['active labor', 'obstetric emergency'],
      score: 88,
      explanation: 'Active labor or obstetric complication. Emergency delivery suite with neonatal resuscitation prep required.',
      offer_hold: true,
      blood_needed: bloodNeeded,
    };
  }

  // 10. POISON / SNAKE BITE / OVERDOSE
  if (
    normalized.includes('snake') ||
    normalized.includes('poison') ||
    normalized.includes('overdose') ||
    normalized.includes('insecticide') ||
    normalized.includes('toxin')
  ) {
    return {
      severity: 'RED',
      recommended_ward: 'adult_icu',
      protocol_key: 'arrest',
      matched_keywords: ['toxic ingestion', 'envenomation risk'],
      score: 92,
      explanation: 'Acute toxidrome / venomous bite. Immediate antivenom titration or gastric lavage and ICU monitoring required.',
      offer_hold: true,
      blood_needed: bloodNeeded,
    };
  }

  // 11. BLOOD REQUEST ONLY
  if (bloodNeeded) {
    return {
      severity: 'YELLOW',
      recommended_ward: 'general_oxygen',
      protocol_key: 'general',
      matched_keywords: [`Blood group ${bloodNeeded.group}`, 'transfusion protocol'],
      score: 80,
      explanation: `Immediate transfusion requirement for group ${bloodNeeded.group}. Filtering hospitals with crossmatched reserve units.`,
      offer_hold: true,
      blood_needed: bloodNeeded,
    };
  }

  // 12. NEAREST HOSPITAL / GENERAL EMERGENCY
  if (
    normalized.includes('nearest') ||
    normalized.includes('closest') ||
    normalized.includes('hospital') ||
    normalized.includes('emergency') ||
    normalized.includes('doctor')
  ) {
    return {
      severity: 'YELLOW',
      recommended_ward: 'general_oxygen',
      protocol_key: 'general',
      matched_keywords: ['closest emergency triage'],
      score: 70,
      explanation: 'Proximity-optimized routing to the nearest hospital with 24/7 emergency response and staffed triage capacity.',
      offer_hold: true,
      blood_needed: bloodNeeded,
    };
  }

  // Default: General Emergency Clinical Assessment
  return {
    severity: 'YELLOW',
    recommended_ward: 'general_oxygen',
    protocol_key: 'general',
    matched_keywords: ['acute symptoms requiring evaluation'],
    score: 70,
    explanation: 'Clinical symptoms require urgent bedside assessment, continuous vital monitoring, and diagnostic imaging.',
    offer_hold: true,
    blood_needed: bloodNeeded,
  };
}
