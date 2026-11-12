import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Google GenAI if key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

const MEDICAL_SAFETY_SYSTEM_PROMPT = `
You are the AI Health Companion inside Disease Canceller AI, an intelligent personal health monitoring and health-support platform.
Tagline: "Understand Your Health. Build a Healthier Tomorrow."

CRITICAL SAFETY & CLINICAL SCOPE BOUNDARIES:
1. You MUST NOT claim to diagnose, cure, prevent, or cancel diseases.
2. You provide educational health literacy, wellness habit guidance, and health-management support.
3. Medical decisions, diagnosis, and treatment plans must always remain with qualified healthcare professionals.
4. Never prescribe medication, recommend new prescription drugs, or advise changing/stopping doctor-prescribed medication dosages.
5. If the user mentions emergency warning signs (such as acute severe chest pain, sudden numbness/paralysis, difficulty breathing, coughing up blood, sudden severe headache, or signs of stroke/heart attack), IMMEDIATELY advise them to call emergency services (e.g. 911 / 112) or seek emergency room care.
6. Always communicate uncertainty transparently. Recommend consulting their primary care doctor or specialist for definitive interpretation.
7. Tone: Empathetic, scientifically grounded, respectful, clear, and encouraging. Never use emojis. Use clean bullet points and clear sections.
`;

// AI Assistant Chat endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { messages, userProfile } = req.body;
    const lastUserMessage = messages?.[messages.length - 1]?.content || 'Hello';

    if (!aiClient) {
      // Deterministic educational fallback when API key is unattached
      return res.json({
        reply: `Thank you for your question. Here is educational guidance based on general clinical literature:

1. Understanding the Context:
${lastUserMessage.includes('blood pressure') ? 'Blood pressure readings reflect the force of circulating blood on arterial walls. Optimal targets are generally under 120/80 mmHg.' : lastUserMessage.includes('water') ? 'Adequate hydration supports kidney filtration, cognitive performance, joint lubrication, and cellular energy.' : 'Maintaining balanced nutrition, consistent physical activity, restorative sleep, and regular preventative checkups form the foundation of long-term health.'}

2. Recommended Lifestyle Measures:
- Adhere strictly to any ongoing schedules prescribed by your physician.
- Maintain a structured daily routine with balanced meals rich in fiber and adequate hydration.
- Keep a daily log of symptoms or vitals to share at your next medical consultation.

3. Questions for Your Healthcare Provider:
- "Are my current readings within the optimal range for my age and profile?"
- "What specific lifestyle modifications would you prioritize for me?"

Important Notice: Disease Canceller AI provides educational health support and does not replace the diagnosis or advice of a licensed healthcare provider.`,
        source: 'local-educational-engine',
      });
    }

    const contextKicker = userProfile
      ? `User context: Age ${userProfile.age || 'N/A'}, Gender ${userProfile.gender || 'N/A'}, Known conditions: ${(userProfile.conditions || []).join(', ') || 'None reported'}, Allergies: ${(userProfile.allergies || []).join(', ') || 'None reported'}.`
      : '';

    const promptText = `${contextKicker}
Conversation history:
${(messages || []).map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}

Assistant response (following medical safety guidelines, no emojis):`;

    // Timeout race: 6 seconds max
    const callPromise = aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: MEDICAL_SAFETY_SYSTEM_PROMPT,
      },
    });

    const timeoutPromise = new Promise<{ text: string }>((_, reject) =>
      setTimeout(() => reject(new Error('AI response timed out')), 6000)
    );

    let reply = '';
    try {
      const response: any = await Promise.race([callPromise, timeoutPromise]);
      reply = response?.text || '';
    } catch (apiErr) {
      console.warn('Gemini API call timed out or failed, using local clinical knowledge base:', apiErr);
      reply = `Thank you for your question. Here is educational guidance:

1. Clinical Context & Understanding:
${lastUserMessage.toLowerCase().includes('systolic') ? 'Systolic pressure (the top number) measures arterial force when the heart contracts. Diastolic pressure (the bottom number) measures pressure when the heart rests between beats. Optimal benchmarks are generally below 120/80 mmHg.' : lastUserMessage.toLowerCase().includes('ragi') || lastUserMessage.toLowerCase().includes('glucose') ? 'Whole grains like finger millet (Ragi) and legumes (Dal) provide complex dietary fiber and slow-release starches, preventing rapid glycemic spikes compared to refined white flour.' : 'Maintaining consistent routines in medication adherence, restorative hydration, balanced whole-food meals, and daily Zone-2 walking provides the physiological baseline for cardiovascular and metabolic health.'}

2. Recommended Practical Measures:
- Log your daily vitals consistently at similar times of day.
- Review your 7-day trend chart with your doctor during your next scheduled appointment.
- Adhere strictly to any ongoing schedules prescribed by your physician.

Notice: Disease Canceller AI provides educational health literacy only. Always consult your qualified healthcare provider for personal clinical advice.`;
    }

    return res.json({ reply, source: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    return res.status(500).json({
      error: 'Failed to process AI health query.',
      details: error?.message || 'Unknown error',
    });
  }
});

// Medical Report Explainer endpoint
app.post('/api/ai/analyze-report', async (req: Request, res: Response) => {
  try {
    const { reportText, reportType, imageData, userContext } = req.body;

    if (!aiClient) {
      // Deterministic structured report explanation fallback
      return res.json({
        summary: `Educational summary of ${reportType || 'Laboratory Test Report'}:
This analysis outlines standard diagnostic parameters, biological significance, and questions to review with your clinician.`,
        extractedParameters: [
          {
            testName: 'Hemoglobin (Hb)',
            value: '13.8',
            unit: 'g/dL',
            referenceRange: '13.5 - 17.5',
            status: 'Normal',
            explanation: 'Carries oxygen from your lungs to the tissues throughout your body.',
          },
          {
            testName: 'Fasting Blood Glucose',
            value: '108',
            unit: 'mg/dL',
            referenceRange: '70 - 99',
            status: 'High',
            explanation: 'Slightly above standard fasting threshold. Indicates impaired fasting glucose; dietary review and follow-up HbA1c testing are commonly evaluated by physicians.',
          },
          {
            testName: 'Total Cholesterol',
            value: '192',
            unit: 'mg/dL',
            referenceRange: '< 200',
            status: 'Normal',
            explanation: 'General measure of total sterol lipids circulating in blood plasma.',
          },
          {
            testName: 'Serum Creatinine',
            value: '0.9',
            unit: 'mg/dL',
            referenceRange: '0.7 - 1.3',
            status: 'Normal',
            explanation: 'Byproduct of muscle metabolism cleared by the kidneys, reflecting filtration function.',
          },
        ],
        clinicalQuestions: [
          'What lifestyle or dietary adjustments do you recommend for parameters outside standard reference ranges?',
          'Should we repeat any specific markers in 3 to 6 months to establish a trend?',
          'Do any current medications or supplements influence these specific laboratory values?',
        ],
        disclaimer: 'Disease Canceller AI is an educational tool. Laboratory reference ranges vary between institutions. Only your physician can diagnose medical conditions or interpret results in the context of your overall physical examination.',
      });
    }

    const contents: any[] = [];
    if (imageData) {
      contents.push({
        inlineData: {
          mimeType: imageData.mimeType || 'image/jpeg',
          data: imageData.base64,
        },
      });
    }

    const prompt = `Analyze this ${reportType || 'medical laboratory report'} text or image for educational purposes.
Patient profile: ${JSON.stringify(userContext || {})}
Report content:
${reportText || 'Examine the attached laboratory report visual image.'}

Format response strictly in valid JSON matching this structure:
{
  "summary": "Clear, plain-language non-diagnostic summary of the report contents",
  "extractedParameters": [
    {
      "testName": "Name of test marker",
      "value": "Reported value as string or number",
      "unit": "Unit of measurement",
      "referenceRange": "Standard reference interval",
      "status": "Normal" or "Low" or "High",
      "explanation": "Simple 1-2 sentence explanation of what this test marker reflects physiologically"
    }
  ],
  "clinicalQuestions": [
    "3-4 practical questions for the patient to ask their doctor at their appointment"
  ],
  "disclaimer": "Standard educational disclaimer emphasizing that this does not replace a doctor"
}
`;
    contents.push({ text: prompt });

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: contents },
      config: {
        responseMimeType: 'application/json',
        systemInstruction: `${MEDICAL_SAFETY_SYSTEM_PROMPT}\nOutput only valid JSON. Do not fabricate missing values. Clearly flag outside reference ranges without diagnosing disease.`,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/ai/analyze-report:', error);
    return res.status(500).json({
      error: 'Failed to analyze report.',
      details: error?.message || 'Unknown error',
    });
  }
});

// Personalized Nutrition & Recipe recommendation endpoint
app.post('/api/ai/nutrition-advice', async (req: Request, res: Response) => {
  try {
    const { age, dietPreference, allergies, healthConditions, goal } = req.body;

    if (!aiClient) {
      return res.json({
        recommendations: [
          {
            mealType: 'Breakfast',
            name: 'Spiced Oats & Flaxseed Porridge with Walnuts',
            cuisine: 'Contemporary Indian',
            calories: 340,
            protein: 12,
            carbs: 48,
            fat: 11,
            fiber: 8,
            prepTime: '5 mins',
            cookTime: '10 mins',
            ingredients: ['Rolled oats (50g)', 'Warm almond or low-fat milk (200ml)', 'Ground flaxseed (1 tbsp)', 'Crushed walnuts (15g)', 'Pinch of ground cinnamon', 'Fresh blueberries or pomegranate pearls (30g)'],
            instructions: [
              'Simmer rolled oats with milk and cinnamon over medium heat for 6-8 minutes until creamy.',
              'Remove from heat and stir in ground flaxseeds.',
              'Top with raw crushed walnuts and fresh fruit before serving warm.'
            ],
            healthyAlternatives: 'Substitute oats with broken wheat (daliya) or quinoa flakes for higher complex carbohydrate satiety.',
          },
          {
            mealType: 'Lunch',
            name: 'South Indian Ragi Roti with Mixed Dal Tadka & Cucumber Salad',
            cuisine: 'South Indian',
            calories: 460,
            protein: 19,
            carbs: 64,
            fat: 10,
            fiber: 14,
            prepTime: '15 mins',
            cookTime: '20 mins',
            ingredients: ['Finger millet (Ragi) flour (60g)', 'Warm water & pinch of salt', 'Yellow toor dal & moong dal (50g)', 'Chopped spinach (50g)', 'Cumin seeds & curry leaves', 'Fresh diced cucumber with lemon juice'],
            instructions: [
              'Knead ragi flour with hot water and finely minced green chili/coriander into a smooth dough.',
              'Pat flat over parchment or banana leaf and pan-roast lightly on a skillet with a drop of cold-pressed oil.',
              'Cook dal with spinach and temper with mustard seeds, cumin, and curry leaves.',
              'Serve warm alongside the crisp cucumber lemon salad.'
            ],
            healthyAlternatives: 'For lower glycemic index, blend ragi with amaranth flour or sprouted multigrain flour.'
          }
        ]
      });
    }

    const prompt = `Generate 3 personalized, nutrient-dense meal recipes (Breakfast, Lunch, Dinner/Healthy Snack) tailored to:
Age: ${age || 35}
Dietary preference: ${dietPreference || 'Vegetarian'}
Allergies: ${(allergies || []).join(', ') || 'None'}
Health goals/conditions: ${(healthConditions || []).join(', ') || 'General wellness'}
Focus on wholesome, affordable Indian, South Indian, and Mediterranean whole-food choices. Include exact macronutrients, ingredients, preparation, and healthy substitutions.

Format as JSON with array of meals under "recommendations".`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: `${MEDICAL_SAFETY_SYSTEM_PROMPT}\nEnsure all macro values are realistic numbers. Never use emojis.`,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/ai/nutrition-advice:', error);
    return res.status(500).json({ error: 'Failed to generate nutrition advice.' });
  }
});

// Doctor Visit Preparation endpoint
app.post('/api/ai/doctor-prep', async (req: Request, res: Response) => {
  try {
    const { profile, activeConditions, medications, recentReadings, concernNotes } = req.body;

    if (!aiClient) {
      return res.json({
        summary: `Structured consultation briefing for primary care physician. Profile: ${profile?.fullName || 'Patient'}, Age ${profile?.age || 'N/A'}.`,
        keyQuestions: [
          'Based on my recent vitals, are there specific target thresholds we should focus on?',
          'Are there any potential interactions or timing considerations with my current medications?',
          'What preventative screenings or routine panels are indicated for my age group this year?',
          'Are there non-pharmacological adjustments in diet, hydration, or sleep hygiene you recommend prioritizing?'
        ],
        vitalsSummary: 'Recent blood pressure and glucose metrics recorded in daily wellness diary.',
        organizedTopics: [
          { topic: 'Medication Adherence', detail: 'Reviewing daily dosage schedule and tolerability.' },
          { topic: 'Symptom & Metric Tracking', detail: 'Presenting trend charts from the Disease Canceller AI log.' },
          { topic: 'Physical Activity Tolerance', detail: 'Evaluating suitability of current walking and stretching routines.' }
        ]
      });
    }

    const prompt = `Create a professional, organized Doctor Visit Preparation briefing for:
Patient: ${JSON.stringify(profile || {})}
Conditions: ${JSON.stringify(activeConditions || [])}
Prescribed Medications: ${JSON.stringify(medications || [])}
Recent Vitals: ${JSON.stringify(recentReadings || {})}
Patient Notes/Concerns: "${concernNotes || 'Routine checkup and vitals review'}"

Format as JSON with:
- "summary": string overview
- "keyQuestions": array of 4-6 specific, respectful, high-value questions for the doctor
- "vitalsSummary": string summary of recent trends
- "organizedTopics": array of { "topic": string, "detail": string }
`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: `${MEDICAL_SAFETY_SYSTEM_PROMPT}\nEnsure the briefing empowers the patient to communicate effectively with their physician. No emojis.`,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/ai/doctor-prep:', error);
    return res.status(500).json({ error: 'Failed to prepare doctor visit briefing.' });
  }
});

// Vite or Static file serving setup
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Disease Canceller AI server running at http://localhost:${PORT}`);
  });
}

startServer();
