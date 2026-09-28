import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Multilingual Triage Endpoint (Benglish, Hinglish, Bengali, Hindi, English)
  app.post('/api/triage/analyze', async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Missing query parameter' });
      }

      const ai = getGemini();
      if (!ai) {
        return res.json({
          fallback: true,
          message: 'GEMINI_API_KEY not configured, fallback to clinical rules',
        });
      }

      const prompt = `You are PulseGrid AI, an expert emergency medical triage engine for Indian emergency departments.
Analyze this emergency symptom query from a patient or bystander: "${query}".

The query may be in:
- Benglish (e.g. "buke betha korche" -> acute chest pain / possible cardiac event; "paaye theke rokto porchhe" -> leg bleeding; "matha ghurche" -> vertigo/stroke)
- Hinglish (e.g. "chhati mein dard ho raha hai" -> chest pain; "taang se khoon beh raha hai" -> leg bleeding)
- Bengali / Hindi / English.

Return a strictly valid JSON object with:
1. "detected_symptom": Clear, standard medical condition title (e.g. "Acute Chest Pain / Suspected Cardiac Event" or "Severe Lower Extremity Bleeding & Trauma")
2. "detected_language": e.g. "Benglish", "Hinglish", "English", "Bengali", or "Hindi"
3. "english_translation": Clear English translation of what the user is experiencing
4. "problem_overview": 2-3 clear, compassionate sentences explaining what issue they could be facing and why immediate care is needed.
5. "possible_conditions": array of 3-4 likely differential diagnoses
6. "immediate_solution": array of 4-5 immediate, actionable, life-saving step-by-step first-aid actions to take RIGHT NOW (e.g. for leg bleeding: apply firm direct pressure, elevate leg above heart, do not remove soaked cloth, apply tourniquet if arterial spurting, keep warm; for chest pain: sit upright 45°, chew soluble aspirin 300mg if not allergic, complete rest, loosen clothing, rush to Cath Lab)
7. "what_not_to_do": array of 2-3 critical mistakes to avoid
8. "severity": "RED" (life-threatening) or "YELLOW" (urgent evaluation) or "GREEN" (non-emergency)
9. "esi_level": e.g. "ESI-1 (Immediate Resuscitation)" or "ESI-2 (Emergent)"
10. "recommended_ward": one of ["cardiac_icu", "adult_icu", "pediatric_icu", "general_oxygen"]
11. "urgency_note": e.g. "Golden hour window: 60-90 minutes."
12. "matched_symptom_id": closest ID if known

Output raw JSON only.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      return res.json({ success: true, analysis: parsed });
    } catch (err: any) {
      console.error('Gemini triage error:', err);
      return res.status(200).json({ fallback: true, error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PulseGrid AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
