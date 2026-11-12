/**
 * API client to communicate with the Express server endpoints
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendChatMessage(messages: ChatMessage[], userProfile?: any): Promise<{ reply: string; source?: string }> {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, userProfile }),
  });
  if (!res.ok) {
    throw new Error(`Chat API error: ${res.statusText}`);
  }
  return res.json();
}

export async function analyzeReportWithAi(payload: {
  reportText?: string;
  reportType?: string;
  imageData?: { base64: string; mimeType: string };
  userContext?: any;
}): Promise<any> {
  const res = await fetch('/api/ai/analyze-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Analyze report error: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchNutritionAdvice(payload: {
  age?: number;
  dietPreference?: string;
  allergies?: string[];
  healthConditions?: string[];
}): Promise<any> {
  const res = await fetch('/api/ai/nutrition-advice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Nutrition advice error: ${res.statusText}`);
  }
  return res.json();
}

export async function prepareDoctorBriefing(payload: {
  profile: any;
  activeConditions: string[];
  medications: any[];
  recentReadings: any;
  concernNotes: string;
}): Promise<any> {
  const res = await fetch('/api/ai/doctor-prep', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Doctor prep error: ${res.statusText}`);
  }
  return res.json();
}
