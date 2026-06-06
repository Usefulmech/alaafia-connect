import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryHeader from '../components/PrimaryHeader.jsx';
import BottomNav from '../components/BottomNav.jsx';

// --- Constants ------------------------------------------------------------------------------------------------------------------

// System prompt is handled by the backend

const DEMO_RESPONSES = [
  "Thank you for sharing that. On a scale of 1 to 10, how severe is the discomfort? And how long have you had this symptom?",
  "I understand - are you coping okay? Does the symptom get worse at any particular time of day, or after eating, physical activity, or rest?",
  "That's helpful to know. Have you experienced this before, or is this the first time? Do you have any pre-existing conditions such as diabetes, hypertension, or asthma?\n\nTRIAGE: SEE_DOCTOR_TODAY  Based on your reported symptoms, I recommend you see a qualified doctor within 24 hours for a proper clinical examination.",
];

const TRIAGE_CONFIG = {
  EMERGENCY: {
    label: 'Emergency - Seek Immediate Care',
    color: 'bg-red-50 border-red-400',
    headerBg: 'bg-red-500',
    badgeBg: 'bg-red-100 text-red-700',
    actionColor: 'bg-red-600 hover:bg-red-700 active:bg-red-800',
    action: 'CALL 112 IMMEDIATELY',
    icon: '!',
  },
  SEE_DOCTOR_TODAY: {
    label: 'See a Doctor Today',
    color: 'bg-amber-50 border-amber-400',
    headerBg: 'bg-amber-500',
    badgeBg: 'bg-amber-100 text-amber-800',
    actionColor: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800',
    action: 'BOOK APPOINTMENT NOW',
    icon: '!',
  },
  MONITOR_AT_HOME: {
    label: 'Monitor at Home',
    color: 'bg-emerald-50 border-emerald-400',
    headerBg: 'bg-emerald-500',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    actionColor: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800',
    action: 'VIEW CARE OPTIONS',
    icon: '?',
  },
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');

async function streamCencoriChat(messages, onChunk, onDone) {
  const response = await fetch(`${API_BASE_URL}/api/triage/chat-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      model: 'claude-3-5-sonnet',
      temperature: 0.0,
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        try {
          const data = JSON.parse(line.slice(6));
          const delta = data.choices?.[0]?.delta?.content || '';
          full += delta;
          onChunk(delta, full);
        } catch {
          /* ignore parse errors on SSE lines */
        }
      }
    }
  }
  onDone(full);
}

// --- Small helper components ----------------------------------------------------------------------------------------------------

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1 px-0.5">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-2 h-2 bg-white/80 rounded-full animate-bounce"
          style={{ animationDelay: `${delay}ms`, animationDuration: '0.9s' }}
        />
      ))}
    </div>
  );
}

function NavIcon({ name, active }) {
  const fill = active ? 'currentColor' : 'none';
  const stroke = active ? 'currentColor' : 'currentColor';

  switch (name) {
    case 'home':
      return (
        <svg translate="no" className="w-4 h-4" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'symptoms':
      return (
        <svg translate="no" className="w-4 h-4" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a7 7 0 0 0-7 7c0 3.9 3.1 7 7 7s7-3.1 7-7a7 7 0 0 0-7-7z" />
          <path d="M12 14v6" />
          <path d="M9 18h6" />
        </svg>
      );
    case 'consult':
      return (
        <svg translate="no" className="w-4 h-4" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case 'records':
      return (
        <svg translate="no" className="w-4 h-4" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16v16H4z" />
          <line x1="8" y1="8" x2="16" y2="8" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="8" y1="16" x2="12" y2="16" />
        </svg>
      );
    case 'profile':
      return (
        <svg translate="no" className="w-4 h-4" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    default:
      return (
        <svg translate="no" className="w-4 h-4" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="6" />
        </svg>
      );
  }
}

// --- Main Component -------------------------------------------------------------------------------------------------------------

export default function SymptomIntake() {
  const navigate = useNavigate();

  // -- State --
  const PLACEHOLDERS = {
    EN: 'Describe your symptoms or attach a file...',
    English: 'Describe your symptoms or attach a file...',
    Pidgin: 'Wetin dey do you? Or attach file...',
    Yoruba: 'Ṣe apejuwe awọn aami aisan rẹ...',
    Hausa: 'Kwatanta bayanin alamun ku...',
    Igbo: 'Kọwaa mgbaàmà gị...',
    YO: 'Ṣe apejuwe awọn aami aisan rẹ...',
    HA: 'Kwatanta bayanin alamun ku...'
  };

  const WELCOME_MESSAGES = {
    EN: 'Welcome to Àlàáfíà AI. Please describe your symptoms or how you are feeling today.',
    English: 'Welcome to Àlàáfíà AI. Please describe your symptoms or how you are feeling today.',
    Pidgin: 'Welcome to Àlàáfíà AI. Abeg tell us wetin dey do you or how you dey feel today.',
    Yoruba: 'Ẹ kaabọ si Àlàáfíà AI. Jọwọ ṣapejuwe awọn aami aisan rẹ tabi bi o ṣe rilara loni.',
    Hausa: 'Barka da zuwa Àlàáfíà AI. Da fatan za a kwatanta alamun ku ko yadda kuke jin a yau.',
    Igbo: 'Nnọọ na Àlàáfíà AI. Biko kọwaa mgbaàmà gị ma ọ bụ otú ị na-eche taa.',
    YO: 'Ẹ kaabọ si Àlàáfíà AI. Jọwọ ṣapejuwe awọn aami aisan rẹ tabi bi o ṣe rilara loni.',
    HA: 'Barka da zuwa Àlàáfíà AI. Da fatan za a kwatanta alamun ku ko yadda kuke jin a yau.'
  };

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [triageResult, setTriageResult] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [otherName, setOtherName] = useState(() => localStorage.getItem('otherPatientName') || '');
  const [otherRelation, setOtherRelation] = useState('Child');
  const [attachedFile, setAttachedFile] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedLang, setSelectedLang] = useState(
    () => localStorage.getItem('selectedLanguage') || 'English'
  );
  const LANG_NAMES = {
    EN: 'English',
    English: 'English',
    Pidgin: 'Nigerian Pidgin',
    Yoruba: 'Yorùbá',
    Hausa: 'Hausa',
    Igbo: 'Igbo',
    YO: 'Yorùbá',
    HA: 'Hausa',
  };
  const langMap = {
    EN: 'en-NG',
    English: 'en-NG',
    Pidgin: 'en-NG',
    Yoruba: 'yo-NG',
    Hausa: 'ha-NG',
    Igbo: 'ig-NG',
    YO: 'yo-NG',
    HA: 'ha-NG',
  };

  // -- Refs --
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const conversationRef = useRef([]);

  function initializeConversation() {
    const welcomeText = WELCOME_MESSAGES[selectedLang] || WELCOME_MESSAGES['English'];
    const botMsg = {
      id: Date.now().toString(),
      role: 'assistant',
      content: welcomeText,
      timestamp: new Date(),
    };
    setMessages([botMsg]);
    conversationRef.current = [{ role: 'assistant', content: welcomeText }];
    setSessionStarted(true);
  }

  function selectPerson(person) {
    if (person === 'self') {
      setSelectedPerson('self');
      initializeConversation();
      return;
    }
    setSelectedPerson('other');
  }

  function startOtherChat() {
    const trimmed = otherName.trim();
    if (!trimmed) return;
    localStorage.setItem('otherPatientName', trimmed);
    setSelectedPerson('other');
    initializeConversation();
  }

  function openFileDialog() {
    fileInputRef.current?.click();
  }

  function handleFileSelect(event) {
    const file = event.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  }

  // -- Derived --
  const patientName = localStorage.getItem('patientName') || 'Patient';
  const displayName = selectedPerson === 'other' && otherName ? otherName : patientName;
  const initials = displayName
    .split(' ')
    .map((n) => n[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'P';

  // -- Auto-scroll --
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // -- Triage parser --
  function checkForTriage(text) {
    if (!text.includes('TRIAGE:')) return;
    const match = text.match(
      /TRIAGE:\s*(EMERGENCY|SEE_DOCTOR_TODAY|MONITOR_AT_HOME)\s*[—\-\:]\s*(.+)/
    );
    if (!match) return;
    const [, level, reason] = match;
    const cfg = TRIAGE_CONFIG[level];
    if (!cfg) return;
    const result = { level, reason: reason.trim(), ...cfg };
    setTriageResult(result);
    localStorage.setItem('triageResult', `${cfg.label}: ${reason.trim()}`);
  }

  // -- Message content renderer (strips TRIAGE line from bubble) --
  function renderContent(content, streaming, isLastBot) {
    const idx = content.indexOf('TRIAGE:');
    const display = idx !== -1 ? content.slice(0, idx).trim() : content;
    return (
      <span className="notranslate">
        {display}
        {streaming && isLastBot && display.length > 0 && (
          <span className="inline-block w-[2px] h-[1em] bg-white/90 ml-[2px] align-middle animate-blink" />
        )}
      </span>
    );
  }

  // -- TTS --
  function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/TRIAGE:.*$/ms, '').trim();
    const utt = new SpeechSynthesisUtterance(clean);
    const lang = langMap[selectedLang] || 'en-NG';
    utt.lang = lang;
    // Prefer a voice that matches the language if available
    const voices = window.speechSynthesis.getVoices();
    const shortLang = (lang || '').split('-')[0];
    const match = voices.find(v => (v.lang || '').startsWith(shortLang) || v.lang === lang);
    if (match) utt.voice = match;
    utt.rate = 0.9;
    window.speechSynthesis.speak(utt);
  }

  // -- Voice input --
  function toggleVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('Voice transcription is not supported in this browser. Use Chrome or Edge with microphone permission.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SR();
    recognition.lang = langMap[selectedLang] || 'en-NG';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join('');
      setInput(transcript);
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        alert('Microphone permission was denied. Please allow microphone access to use voice transcription.');
      } else if (event.error === 'no-speech' || event.error === 'speech_timeout') {
        alert('No speech was detected. Please try again and speak clearly.');
      } else {
        console.error('Speech recognition error:', event.error);
      }
    };
    recognition.onnomatch = () => {
      alert('Sorry, I could not understand that. Please try again.');
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }

  async function fetchTriageReply(message) {
    console.log(API_BASE_URL, "from testing ");
    const res = await fetch(`${API_BASE_URL}/api/triage/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: conversationRef.current,
        language: selectedLang,
        temperature: 0.0,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => res.statusText);
      throw new Error(`API error ${res.status}: ${errorText}`);
    }

    const payload = await res.json();
    return payload.reply || '';
  }

  // -- Send message --
  async function sendMessage(text) {
    if ((!text.trim() && !attachedFile) || isStreaming) return;

    const trimmed = text.trim() || (attachedFile ? `Attached file: ${attachedFile.name}` : '');
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    conversationRef.current.push({ role: 'user', content: trimmed });
    setInput('');
    setAttachedFile(null);
    // Persist symptoms
    const prev = localStorage.getItem('symptoms') || '';
    localStorage.setItem('symptoms', prev ? `${prev} | ${trimmed}` : trimmed);

    // Placeholder bot message
    const botId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: botId, role: 'assistant', content: '', timestamp: new Date() },
    ]);

    try {
      const reply = await fetchTriageReply(trimmed);
      setMessages((prev) =>
        prev.map((m) => (m.id === botId ? { ...m, content: reply } : m))
      );
      conversationRef.current.push({ role: 'assistant', content: reply });
      setIsStreaming(false);
      checkForTriage(reply);
    } catch (apiErr) {
      console.warn('Live API failed, falling back to Demo Mode:', apiErr);
      const userCount = conversationRef.current.filter((m) => m.role === 'user').length;
      const idx = Math.min(userCount - 1, DEMO_RESPONSES.length - 1);
      const demoText = DEMO_RESPONSES[idx];
      let acc = '';
      for (const ch of demoText) {
        await new Promise((r) => setTimeout(r, 14));
        acc += ch;
        setMessages((prev) =>
          prev.map((m) => (m.id === botId ? { ...m, content: acc } : m))
        );
      }
      conversationRef.current.push({ role: 'assistant', content: demoText });
      checkForTriage(demoText);
      setIsStreaming(false);
    }
  }

  function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-NG', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // -- Render --

  return (
    <div className="bg-background font-sans page-shell min-h-screen pb-40">
      <PrimaryHeader
        title="Àlàáfíà Connect"
        subtitle="AI SYMPTOM ASSESSMENT"
        showBack
        onBack={() => navigate('/home')}
      />

      <main className="pt-16 pb-4 px-4 max-w-2xl mx-auto w-full">
        {!selectedPerson ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 animate-fade-in px-4">
            <div className="text-center max-w-md w-full">

              <h2 className="text-3xl font-extrabold text-on-surface mb-3" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif" }}>Who needs care today?</h2>
              <p className="text-on-surface-variant text-base">Please select who you are assessing symptoms for to begin the consultation with Àlàáfíà AI.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 w-full max-w-lg">
              <button
                onClick={() => selectPerson('self')}
                className="flex-1 flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-outline-variant hover:border-primary hover:bg-primary-container/10 transition-all duration-300 bg-surface-container-lowest shadow-sm"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5 text-primary">
                  <svg translate="no" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-on-surface mb-2">Myself</span>
                <span className="text-sm text-on-surface-variant text-center">I want to assess my own symptoms</span>
              </button>

              <button
                onClick={() => selectPerson('other')}
                className="flex-1 flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-outline-variant hover:border-primary hover:bg-primary-container/10 transition-all duration-300 bg-surface-container-lowest shadow-sm"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5 text-primary">
                  <svg translate="no" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <span className="text-xl font-bold text-on-surface mb-2">Someone Else</span>
                <span className="text-sm text-on-surface-variant text-center">I am assessing a family member or friend</span>
              </button>
            </div>
          </div>
        ) : selectedPerson === 'other' && !sessionStarted ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 animate-fade-in px-4">
            <div className="text-center max-w-md w-full">

              <h2 className="text-3xl font-extrabold text-on-surface mb-3" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif" }}>Who are you assessing?</h2>
              <p className="text-on-surface-variant text-base">Add the patient name and relationship so your doctor can refer to the right person.</p>
            </div>

            <div className="w-full max-w-lg space-y-4">
              <label className="block text-sm font-semibold text-on-surface">Patient name</label>
              <input
                value={otherName}
                onChange={(e) => setOtherName(e.target.value)}
                placeholder="e.g. Amina Yusuf"
                className="w-full h-14 px-4 rounded-2xl border-2 border-outline-variant focus:border-primary outline-none bg-surface-container-low text-sm"
              />

              <div>
                <p className="text-sm font-semibold text-on-surface mb-3">Relationship</p>
                <div className="grid grid-cols-2 gap-3">
                  {['Child', 'Spouse', 'Parent', 'Friend', 'Other'].map((relation) => (
                    <button
                      key={relation}
                      type="button"
                      onClick={() => setOtherRelation(relation)}
                      className={`w-full py-4 rounded-2xl text-sm font-semibold transition-all ${otherRelation === relation ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface hover:border-primary border border-outline-variant'}`}
                    >
                      {relation}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={startOtherChat}
                  disabled={!otherName.trim()}
                  className="w-full h-14 rounded-2xl font-bold text-white bg-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Start assessment for {otherName.trim() || 'this person'}
                </button>
                <button
                  onClick={() => {
                    setSelectedPerson(null)
                    setOtherName('')
                    setOtherRelation('Child')
                  }}
                  className="w-full h-14 rounded-2xl font-bold text-primary border border-primary/30 bg-white"
                >
                  Choose again
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Divider */}
            <div className="flex items-center gap-2 mb-6 mt-4">
              <div className="flex-1 h-px bg-outline-variant/50" />
              <span className="text-xs text-on-surface-variant/70 font-semibold uppercase tracking-widest px-2">AI Assessment Session</span>
              <div className="flex-1 h-px bg-outline-variant/50" />
            </div>

            {/* Message Timeline */}
            <div className="space-y-3">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const isLast = idx === messages.length - 1;
                const isLastBot = !isUser && isLast;
                const isTyping = isLastBot && msg.content === '' && isStreaming;
                const showConnector = idx < messages.length - 1;

                return (
                  <div key={msg.id} className="animate-fade-in">
                    <div className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>

                      {/* Avatar Column */}
                      <div className="flex flex-col items-center flex-shrink-0 select-none">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm border-2 ${isUser
                              ? 'bg-surface-variant text-on-surface-variant border-surface-container'
                              : 'bg-primary-container text-on-primary-container border-primary/20'
                            }`}
                        >
                          {isUser ? (initials || 'P') : 'AI'}
                        </div>
                        {showConnector && (
                          <div className="w-px flex-1 mt-1 min-h-[12px] bg-gradient-to-b from-outline-variant/60 to-transparent" />
                        )}
                      </div>

                      {/* Bubble */}
                      <div className={`flex flex-col max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
                        {/* Role label */}
                        <span className="text-[10px] font-semibold text-on-surface-variant mb-1 px-1">
                          {isUser ? displayName : 'Àlàáfíà AI'}
                        </span>

                        <div
                          className={`relative px-4 py-3 shadow-sm ${isUser
                              ? 'bg-surface-variant text-on-surface rounded-2xl rounded-tr-sm'
                              : 'bg-primary text-on-primary rounded-2xl rounded-tl-sm'
                            }`}
                        >
                          {isTyping ? (
                            <TypingDots />
                          ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {renderContent(msg.content, isStreaming, isLastBot)}
                            </p>
                          )}
                        </div>

                        {/* Timestamp + TTS row */}
                        <div className={`flex items-center gap-2 mt-1 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                          <span className="text-[10px] text-on-surface-variant/60 font-medium">
                            {formatTime(msg.timestamp)}
                          </span>
                          {!isUser && msg.content && !isTyping && (
                            <button
                              onClick={() => speakText(msg.content)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 rounded-full hover:bg-surface-container text-on-surface-variant/70"
                              title="Listen to this message"
                            >
                              <svg translate="no" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Triage Result Card � only shown after all messages, when result is available */}
                    {triageResult && isLastBot && !isTyping && (
                      <div className="animate-scale-in mt-4 mb-2">
                        <div className={`rounded-2xl border-2 overflow-hidden shadow-xl ${triageResult.color}`}>
                          {/* Card header strip */}
                          <div className={`${triageResult.headerBg} px-4 py-2.5 flex items-center gap-2`}>
                            <span className="text-xl">{triageResult.icon}</span>
                            <span className="text-white text-xs font-bold tracking-widest uppercase">
                              AI Triage Assessment
                            </span>
                          </div>

                          {/* Card body */}
                          <div className="p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0 ${triageResult.badgeBg}`}>
                                {triageResult.label.split('-')[0].trim()}
                              </div>
                            </div>

                            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                              <span className="font-semibold text-on-surface">Clinical reasoning: </span>
                              {triageResult.reason}
                            </p>

                            <div className="flex items-center gap-1 mb-3 text-[10px] text-on-surface-variant/70">
                              <svg translate="no" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              This is an AI-generated suggestion - always consult a licensed physician.
                            </div>

                            <button
                              onClick={() => navigate('/care-pathway')}
                              className={`w-full py-3 rounded-xl text-white text-xs font-bold tracking-widest uppercase shadow-md transition-all duration-150 active:scale-[0.98] ${triageResult.actionColor}`}
                            >
                              {triageResult.action} →
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div ref={messagesEndRef} className="h-24" />
            </div>
          </>
        )}
      </main>

      {sessionStarted && (
        <>
          {/* Fixed Bottom Input Bar */}
          <div className="fixed bottom-0 inset-x-0 z-40 bg-surface-container-lowest/95 backdrop-blur-sm border-t border-outline-variant px-3 py-2.5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center gap-2 bg-surface-container-low rounded-2xl px-3 py-2 border border-outline-variant/60 shadow-sm">

              {/* Attachment */}
              <button
                onClick={openFileDialog}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-on-surface-variant hover:bg-surface-container transition-colors"
                title="Attach a file"
              >
                <svg translate="no" className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder={isStreaming ? 'Àlàáfíà AI is responding...' : (PLACEHOLDERS[selectedLang] || PLACEHOLDERS['English'])}
                disabled={isStreaming}
                className="flex-1 bg-transparent text-sm text-on-surface placeholder-on-surface-variant/50 outline-none disabled:opacity-40 min-w-0"
              />

              {/* Mic Button */}
              <button
                onClick={toggleVoice}
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${isListening
                    ? 'bg-error text-white shadow-lg scale-110 animate-pulse'
                    : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                title={isListening ? 'Stop listening' : 'Voice input'}
              >
                <svg translate="no" style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                </svg>
              </button>

              {/* Send Button */}
              <button
                onClick={() => sendMessage(input)}
                disabled={(!input.trim() && !attachedFile) || isStreaming}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary text-on-primary disabled:opacity-35 hover:bg-primary-container transition-all duration-200 shadow-sm active:scale-95"
              >
                <svg translate="no" style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>

            {attachedFile && (
              <div className="text-[11px] text-on-surface-variant mt-2 px-1 truncate">
                Attached file: {attachedFile.name}
              </div>
            )}

            {/* Listening indicator */}
            {isListening && (
              <div className="flex items-center justify-center gap-1.5 mt-1.5">
                <span className="w-1.5 h-1.5 bg-error rounded-full animate-ping" />
                <span className="text-[11px] text-error font-semibold">Listening in English (NG)...</span>
              </div>
            )}
          </div>

        </>
      )}
    </div>
  );
}


