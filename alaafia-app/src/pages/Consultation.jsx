import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav.jsx'
import PrimaryHeader from '../components/PrimaryHeader.jsx'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const DR_SYSTEM = `You are Dr. Adeoti Clinton, a Nigerian general physician providing concise, evidence-minded teleconsultation on the Àlàáfíà Connect platform.
You have access to the patient's AI triage summary and recent messages.

Guidelines:
- Be empathetic, professional, and culturally aware.
- Ask focused, relevant follow-up questions to clarify symptoms and red flags.
- After 2�4 exchanges, provide a brief clinical assessment and a clear recommendation (stay home and monitor, see a doctor today, or seek emergency care).
- If suggesting medications, list drug name, typical adult dosage, frequency, and duration, and note any contraindications when obvious.
- Always include explicit red-flag advice when present and end medical responses with "� Dr. Adeoti".
- Keep responses concise (3–5 short sentences) and do not provide definitive diagnoses — recommend in-person evaluation where appropriate.`

export default function Consultation() {
  const navigate = useNavigate()
  const chatAreaRef = useRef(null)

  const [phase, setPhase] = useState('payment') // payment | processing | success | chat
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [docMessages, setDocMessages] = useState([{ role: 'system', content: DR_SYSTEM }])
  const [exchangeCount, setExchangeCount] = useState(0)
  const [showPassBtn, setShowPassBtn] = useState(false)
  const [triagePill, setTriagePill] = useState(null)

  const speechRecRef = useRef(null)

  const now = () => new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true })

  useEffect(() => {
    try {
      const tr = JSON.parse(localStorage.getItem('triageResult') || '{}')
      if (tr.title) setTriagePill(tr.summary || tr.title)
    } catch (_) {}
  }, [])

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight
    }
  }, [messages, isTyping])

  async function initiatePayment() {
    setPhase('processing')
    try {
      const res = await fetch(`${API_BASE_URL}/api/payment/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1000, email: 'patient@example.com', purpose: 'Consultation Fee' })
      });
      if (!res.ok) throw new Error('Payment initiation failed');
      const data = await res.json();
      
      // We simulate the actual OPay wallet processing delay, then verify
      setTimeout(async () => {
        try {
          const vRes = await fetch(`${API_BASE_URL}/api/payment/verify/${data.reference}`, { method: 'POST' });
          if (!vRes.ok) throw new Error('Payment verification failed');
          setPhase('success');
        } catch (err) {
          console.error(err);
          setPhase('payment');
          alert('Verification failed');
        }
      }, 1500);

    } catch (err) {
      console.error(err);
      setPhase('payment');
      alert('Payment failed to initiate');
    }
  }

  function enterChat() {
    setPhase('chat')
    localStorage.setItem('consultationStart', new Date().toLocaleString('en-NG'))
    localStorage.setItem('doctorName', 'Dr. Adeoti Clinton')

    const triageStr = (() => {
      try {
        const t = JSON.parse(localStorage.getItem('triageResult') || '{}')
        return t.summary ? `Triage summary: "${t.summary}" – Urgency: ${t.title}` : 'No triage summary on file.'
      } catch (_) {
        return 'No triage summary on file.'
      }
    })()

    const openMsg = `Good day, I've reviewed your AI triage summary.\n\n${triageStr}\n\nBased on what I see, let me ask you a few follow-up questions to better understand your condition.\n\n� Dr. Adeoti`
    const newMessages = [{ role: 'assistant', content: openMsg, time: now() }]
    setMessages(newMessages)
    setDocMessages(prev => [...prev, { role: 'assistant', content: openMsg }])
    setExchangeCount(1)
  }

  function handleSend() {
    const text = inputText.trim()
    if (!text || phase !== 'chat') return
    setInputText('')
    const userMsg = { role: 'user', content: text, time: now() }
    setMessages(prev => [...prev, userMsg])
    sendToDoctor([...docMessages, { role: 'user', content: text }], text)
    setExchangeCount(prev => prev + 1)
  }

  async function sendToDoctor(history, userText) {
    setIsTyping(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/triage/chat-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, model: 'claude-3-5-sonnet', temperature: 0.0 }),
      })
      setIsTyping(false)
      if (!res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: `?? API error ${res.status}: ${res.statusText}`, time: now() }])
        return
      }
      let full = ''
      const placeMsg = { role: 'assistant', content: '', time: now(), streaming: true }
      setMessages(prev => [...prev, placeMsg])
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const d = JSON.parse(line.slice(6))
              const delta = d.choices?.[0]?.delta?.content || ''
              full += delta
              setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: full } : m))
            } catch (_) {}
          }
        }
      }
      setDocMessages(prev => [...prev, { role: 'assistant', content: full }])
      const newCount = exchangeCount + 1
      setExchangeCount(newCount)
      if (newCount >= 3) {
        localStorage.setItem('consultationSummary', full)
        setShowPassBtn(true)
      }
    } catch (err) {
      setIsTyping(false)
      setMessages(prev => [...prev, { role: 'assistant', content: `?? Connection error: ${err.message}`, time: now() }])
    }
  }

  function toggleVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      alert('Voice input not supported. Please use Chrome or Edge.')
      return
    }
    if (isRecording) {
      speechRecRef.current?.stop()
      return
    }
    const rec = new SR()
    rec.lang = 'en-NG'
    rec.continuous = false
    rec.interimResults = true
    setIsRecording(true)
    rec.onresult = (e) => setInputText(Array.from(e.results).map(r => r[0].transcript).join(''))
    rec.onend = () => {
      setIsRecording(false)
      const t = inputText.trim()
      if (t) {
        setInputText('')
        const voiceMsg = { role: 'user', content: t, time: now(), isVoice: true }
        setMessages(prev => [...prev, voiceMsg])
        sendToDoctor([...docMessages, { role: 'user', content: t }], t)
      }
    }
    rec.onerror = () => setIsRecording(false)
    rec.start()
    speechRecRef.current = rec
  }

  return (
    <div className="min-h-dvh bg-background text-on-surface flex flex-col page-shell">
      <PrimaryHeader
        title="Àlàáfíà Connect"
        subtitle="DOCTOR CONSULTATION"
        showBack
        onBack={() => navigate('/history')}
      />

      {/* -- PAYMENT PHASE -- */}
      {phase === 'payment' && (
        <main className="flex-1 pt-16 pb-20 px-4 flex flex-col gap-4 overflow-y-auto page-content">
          <div className="pt-5">
            <h2 className="font-bold text-on-surface text-xl sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif" }}>Consultation Payment</h2>
            <p className="text-on-surface-variant text-sm">Secure payment via OPay wallet</p>
          </div>

          {/* Doctor Card */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container flex-shrink-0 shadow" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 20 }}>AC</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-on-surface" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 15 }}>Dr. Adeoti Clinton</p>
              <p className="text-on-surface-variant text-xs">General Physician – MDCN #4567</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 bg-primary/10 rounded-full px-2 py-0.5">
                  <svg translate="no" width="10" height="10" viewBox="0 0 24 24" fill="#005c55"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  <span className="text-primary font-semibold" style={{ fontSize: 10 }}>4.9</span>
                </div>
                <span className="text-on-surface-variant text-xs">847 consultations</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-primary" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 18 }}>₦1,000</p>
              <p className="text-on-surface-variant" style={{ fontSize: 11 }}>per session</p>
            </div>
          </div>

          {/* Triage Pill */}
          {triagePill && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
              <span style={{ fontSize: 18, lineHeight: 1 }}>??</span>
              <div>
                <p className="font-semibold text-amber-800 text-xs">AI Triage attached to consultation</p>
                <p className="text-amber-700 text-xs">{triagePill}</p>
              </div>
            </div>
          )}

          {/* Payment Card */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-sm overflow-hidden">
            <div className="bg-primary px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg translate="no" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a3faef" strokeWidth="2.2" strokeLinecap="round">
                    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <span className="font-bold text-on-primary-container" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 13 }}>Payment Method</span>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {/* Fee Breakdown */}
              <div className="space-y-2">
                {[['Professional Fee', '₦1,000.00'], ['Platform Fee', '₦0.00']].map(([lbl, val]) => (
                  <div key={lbl} className="flex justify-between items-center">
                    <span className="text-on-surface-variant text-sm">{lbl}</span>
                    <span className="font-semibold text-on-surface text-sm">{val}</span>
                  </div>
                ))}
                <div className="border-t border-outline-variant/50 pt-2 flex justify-between items-center">
                  <span className="font-bold text-on-surface" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 15 }}>Total</span>
                  <span className="font-bold text-primary" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 18 }}>₦1,000.00</span>
                </div>
              </div>

              {/* --- Payment Methods UI --- */}
              <div className="border border-outline-variant rounded-2xl overflow-hidden bg-surface-container-lowest flex flex-col">
                <div className="flex border-b border-outline-variant bg-surface-container-low">
                  {['card', 'transfer', 'ussd'].map(method => (
                    <button
                      key={method}
                      onClick={() => {
                         document.querySelectorAll('.pay-tab').forEach(el => el.classList.remove('active-tab', 'text-primary', 'border-b-2', 'border-primary', 'font-bold'));
                         document.querySelectorAll('.pay-tab').forEach(el => el.classList.add('text-on-surface-variant'));
                         const target = document.getElementById(`tab-${method}`);
                         if (target) {
                           target.classList.add('active-tab', 'text-primary', 'border-b-2', 'border-primary', 'font-bold');
                           target.classList.remove('text-on-surface-variant');
                         }
                         document.querySelectorAll('.pay-content').forEach(el => el.classList.add('hidden'));
                         const content = document.getElementById(`content-${method}`);
                         if (content) content.classList.remove('hidden');
                      }}
                      id={`tab-${method}`}
                      className={`pay-tab flex-1 py-3 text-xs uppercase tracking-wider transition-colors ${method === 'card' ? 'active-tab text-primary border-b-2 border-primary font-bold' : 'text-on-surface-variant'}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                <div className="p-4">
                  {/* Card Content */}
                  <div id="content-card" className="pay-content space-y-3 block">
                    <input 
                      type="text" 
                      placeholder="Card Number" 
                      className="w-full h-12 px-3 border border-outline-variant rounded-xl text-sm focus:border-primary outline-none"
                    />
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        className="w-1/2 h-12 px-3 border border-outline-variant rounded-xl text-sm focus:border-primary outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="CVV" 
                        className="w-1/2 h-12 px-3 border border-outline-variant rounded-xl text-sm focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  {/* Transfer Content */}
                  <div id="content-transfer" className="pay-content hidden text-center py-2">
                    <p className="text-sm text-on-surface-variant mb-2">Transfer exactly <strong className="text-primary">₦1,000.00</strong> to:</p>
                    <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/60 font-mono text-on-surface text-lg font-bold mb-2 tracking-widest">
                      0123456789
                    </div>
                    <p className="text-xs font-bold text-on-surface-variant">Wema Bank — Alaafia Connect</p>
                  </div>

                  {/* USSD Content */}
                  <div id="content-ussd" className="pay-content hidden text-center py-2">
                    <p className="text-sm text-on-surface-variant mb-2">Dial the code below to complete payment:</p>
                    <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/60 font-mono text-primary text-lg font-bold mb-2 tracking-widest">
                      *945*000*1000#
                    </div>
                    <p className="text-[10px] text-on-surface-variant">Follow the prompt on your phone to authorize the transaction.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant font-medium bg-surface-container-low py-2 rounded-lg">
                <svg translate="no" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.4 0 2.8 1.1 2.8 2.5V11h.2c.6 0 1 .4 1 1v5c0 .6-.4 1-1 1H9c-.6 0-1-.4-1-1v-5c0-.6.4-1 1-1h.2V9.5C9.2 8.1 10.6 7 12 7zm0 1.2c-.8 0-1.5.7-1.5 1.3V11h3V9.5c0-.6-.7-1.3-1.5-1.3z" />
                </svg>
                Secured by Interswitch
              </div>

              {/* Pay Button */}
              <button
                onClick={initiatePayment}
                className="pay-glow w-full rounded-xl text-white font-bold py-4 flex items-center justify-center gap-2 active:scale-[.98] transition-all"
                style={{ background: '#005c55', fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 14, letterSpacing: '0.05em' }}
              >
                <svg translate="no" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                AUTHORIZE PAYMENT
              </button>
            </div>
          </div>
        </main>
      )}

      {/* -- PROCESSING OVERLAY -- */}
      {phase === 'processing' && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center" style={{ background: 'rgba(249,249,255,0.92)' }}>
          <div className="w-20 h-20 rounded-full border-4 border-outline-variant flex items-center justify-center mb-5">
            <div className="w-12 h-12 rounded-full border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent spin-anim" />
          </div>
          <p className="font-bold text-on-surface" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 18 }}>Processing Payment</p>
          <p className="text-on-surface-variant mt-1 text-sm">Authorizing secure transaction...</p>
        </div>
      )}

      {/* -- SUCCESS OVERLAY -- */}
      {phase === 'success' && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center px-6" style={{ background: 'rgba(249,249,255,0.96)' }}>
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-5 check-bounce">
            <svg translate="no" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#a3faef" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <p className="font-bold text-on-surface text-center" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 20 }}>Payment Successful!</p>
          <p className="text-on-surface-variant text-center mt-1 mb-5 text-sm">₦1,000 charged successfully</p>
          <div className="bg-surface-container-low rounded-2xl p-4 w-full max-w-sm border border-outline-variant/40 mb-5">
            {[['Transaction ID', 'TXN-ALC-009922'], ['Doctor', 'Dr. Adeoti Clinton']].map(([lbl, val]) => (
              <div key={lbl} className="flex justify-between text-sm mb-1">
                <span className="text-on-surface-variant">{lbl}</span>
                <span className="font-semibold text-on-surface">{val}</span>
              </div>
            ))}
          </div>
          <button
            onClick={enterChat}
            className="w-full max-w-sm rounded-xl text-white font-bold py-4 hover:opacity-90 transition-opacity"
            style={{ background: '#005c55', fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 14, letterSpacing: '0.04em' }}
          >
            START CONSULTATION ?
          </button>
        </div>
      )}

      {/* -- CHAT PHASE -- */}
      {phase === 'chat' && (
        <>
          {/* Sticky Doctor Header */}
          <div className="fixed left-0 lg:left-[88px] right-0 z-30 bg-surface-container-lowest border-b border-outline-variant/40 px-4 py-3 flex items-center gap-3 shadow-sm" style={{ top: 58 }}>
            <div className="w-11 h-11 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container flex-shrink-0 shadow-sm" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 15 }}>AC</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-on-surface truncate" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 14 }}>Dr. Adeoti Clinton</p>
                <div className="flex items-center gap-1 bg-error rounded-full px-2 py-0.5 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-white live-dot" />
                  <span className="text-white font-bold text-[9px] tracking-wider">LIVE</span>
                </div>
              </div>
              <p className="text-on-surface-variant text-xs">General Physician – MDCN #4567</p>
            </div>
            <div className="flex items-center gap-1 bg-surface-container rounded-full px-2.5 py-1 border border-outline-variant/50 flex-shrink-0">
              <svg translate="no" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#005c55" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span className="font-semibold text-primary" style={{ fontSize: 10 }}>Encrypted</span>
            </div>
          </div>

          {/* Chat Messages */}
          <div
            ref={chatAreaRef}
            className="chat-area flex-1 px-4 pt-4 pb-4 overflow-y-auto page-content"
            style={{ paddingTop: 130, paddingBottom: 130 }}
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-start gap-2 mb-4 msg-pop ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-on-primary-container shadow-sm" style={{ fontSize: 10, fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif" }}>AC</div>
                )}
                <div className={`max-w-[78%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <p className="font-semibold text-primary pl-1" style={{ fontSize: 11 }}>Dr. Adeoti Clinton</p>
                  )}
                  {msg.isVoice ? (
                    <div className="bg-surface-variant rounded-2xl rounded-tr-none px-4 py-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <svg translate="no" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#005c55" strokeWidth="2.2" strokeLinecap="round">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        </svg>
                        <span className="text-on-surface-variant font-medium" style={{ fontSize: 11 }}>Voice message</span>
                      </div>
                      <div className="flex items-end gap-0.5 mb-1.5" style={{ height: 20 }}>
                        {[5, 12, 18, 10, 16, 8, 14].map((h, j) => (
                          <div key={j} className="wave-bar w-[3px] bg-primary" style={{ height: h }} />
                        ))}
                      </div>
                      <p className="text-on-surface text-sm">{msg.content}</p>
                    </div>
                  ) : (
                    <div
                      className={`rounded-2xl px-4 py-3 leading-relaxed whitespace-pre-wrap ${msg.role === 'assistant' ? 'bg-primary text-white rounded-tl-none' : 'bg-surface-variant text-on-surface rounded-tr-none'}`}
                      style={{ fontSize: 14 }}
                    >
                      {msg.content}
                      {msg.streaming && msg.content && <span className="inline-block w-0.5 h-4 bg-on-primary-container ml-0.5 animate-blink" />}
                    </div>
                  )}
                  <div className={`flex items-center gap-1.5 ${msg.role === 'user' ? 'pr-0.5 justify-end' : 'pl-1'}`}>
                    <span className="text-on-surface-variant" style={{ fontSize: 10 }}>{msg.time}</span>
                    {msg.role === 'user' && (
                      <svg translate="no" width="12" height="12" viewBox="0 0 24 24" fill="#005c55"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0 font-bold text-on-primary-container" style={{ fontSize: 10, fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif" }}>AC</div>
                <div className="bg-primary rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
            {/* Patient Pass button */}
            {showPassBtn && (
              <div className="px-0 pb-3">
                <button
                  onClick={() => navigate('/patient-pass')}
                  className="slide-up flex items-center justify-center gap-2 w-full rounded-xl font-bold py-3.5 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all"
                  style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 13, letterSpacing: '0.04em' }}
                >
                  <svg translate="no" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  VIEW AND SHARE FINAL MEDICAL RECORD PASS
                </button>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="fixed bottom-16 lg:bottom-0 left-0 lg:left-[88px] right-0 z-40 bg-surface-container-lowest border-t border-outline-variant/40 shadow-xl">
            <div className="px-3 py-2.5 max-w-2xl mx-auto">
              <div className="flex items-center gap-2 bg-surface-container rounded-2xl px-3 py-2">
                <button
                  onClick={toggleVoice}
                  className={`p-1 flex-shrink-0 transition-colors ${isRecording ? 'text-error rec-pulse' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  <svg translate="no" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                </button>
                <input
                  type="text"
                  placeholder="Message Dr. Adeoti—"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  className="flex-1 bg-transparent text-on-surface outline-none placeholder:text-on-surface-variant/50"
                  style={{ fontSize: 14 }}
                />
                <button
                  onClick={handleSend}
                  className="bg-primary rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0 hover:bg-primary-container active:scale-95 transition-all"
                >
                  <svg translate="no" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a3faef" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <BottomNav active="/history" />
    </div>
  )
}


