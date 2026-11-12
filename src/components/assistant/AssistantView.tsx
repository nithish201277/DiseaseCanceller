import React, { useState, useRef, useEffect } from 'react';
import { useHealth } from '../../context/HealthContext';
import { sendChatMessage, ChatMessage } from '../../services/api';
import {
  Bot,
  Send,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Stethoscope,
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'Explain systolic vs diastolic blood pressure in simple terms',
  'How do Indian meals like dal and ragi help balance glucose?',
  'Why is consistent timing crucial for blood pressure medications?',
  'What questions should I ask my doctor about borderline prediabetes?',
  'What are evidence-based habits for restorative sleep hygiene?',
];

export const AssistantView: React.FC = () => {
  const { activeProfile } = useHealth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello ${activeProfile.fullName.split(' ')[0]}. I am your Disease Canceller AI Health Companion.

I can help you understand medical report terminology, explore nutritious meal options (including wholesome Indian and South Indian recipes), review healthy activity guidelines, and organize questions for your doctor.

Important Safety Notice:
I provide educational information only and do not replace professional medical diagnosis, treatment, or prescription advice. If you are experiencing acute chest pain, shortness of breath, or any emergency symptoms, please contact emergency services immediately.

How may I assist your wellness routine today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(newMessages, {
        fullName: activeProfile.fullName,
        age: activeProfile.age,
        gender: activeProfile.gender,
        conditions: activeProfile.existingConditions,
        allergies: activeProfile.allergies,
        diet: activeProfile.dietaryPreference,
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: response.reply }]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I encountered a temporary connection issue. Please ensure your device is connected, or consult your healthcare provider directly.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Conversation restarted. How can I help you understand your health or daily wellness routines today, ${activeProfile.fullName.split(' ')[0]}?`,
      },
    ]);
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col glass-panel rounded-2xl border border-slate-800 overflow-hidden">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">AI Health Assistant</h2>
              <span className="text-[10px] font-mono uppercase bg-teal-950/60 text-teal-400 border border-teal-500/30 px-2 py-0.5 rounded">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Personalized health literacy companion for {activeProfile.fullName} ({activeProfile.ageCategory})
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Reset conversation"
          aria-label="Reset conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Emergency & Non-Diagnostic Banner */}
      <div className="bg-rose-950/30 border-b border-rose-500/20 px-4 py-2 text-[11px] text-rose-200 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
        <span>
          Emergency Notice: If experiencing chest pressure, stroke symptoms, or severe shortness of breath, call 911 / 112 immediately. This assistant cannot diagnose diseases or alter medication prescriptions.
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-teal-500 text-slate-950'
                    : 'bg-slate-800 border border-slate-700 text-teal-400'
                }`}
              >
                {isUser ? activeProfile.fullName.charAt(0) : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-teal-500/20 text-teal-100 border border-teal-500/30'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 shadow-sm'
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-teal-400 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span>Analyzing health context and clinical references...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Topic Chips */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 shrink-0">
            Suggested:
          </span>
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="text-[11px] whitespace-nowrap shrink-0 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 mt-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about vitals, nutrition, exercise, or lab test terminology..."
            className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-slate-950 font-bold transition-all shadow-md shadow-teal-500/20"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
