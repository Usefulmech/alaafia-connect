import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav.jsx'
import PrimaryHeader from '../components/PrimaryHeader.jsx'

function generateRecordId() {
  return 'AL-' + Math.floor(10000 + Math.random() * 90000)
}
function formatDate(d = new Date()) {
  return d.toLocaleDateString('en-NG', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
}
function formatDateTime(d = new Date()) {
  return d.toLocaleString('en-NG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function PatientPass() {
  const navigate = useNavigate()
  const [toastVisible, setToastVisible] = useState(false)

  const [data, setData] = useState({
    name: 'Salami Olusegun',
    recordId: 'AL-90234',
    date: formatDate(),
    consultDate: formatDate(),
    urgencyBg: '#fff8f0',
    urgencyBorder: '#fe932c',
    urgencyColor: '#904d00',
    urgencyEmoji: '⚠️',
    urgencyTitle: 'See Doctor Within 24 Hours',
    urgencyLabel: 'Urgency Level: Moderate',
    triageSummary: 'Musculoskeletal pain likely. Possible lumbar disc strain based on reported symptom profile. Urgency: See doctor within 24 hours. No red-flag neurological symptoms detected.',
    symptoms: ['Sharp lower back pain', 'Pain duration: 1 day', 'Severity: 7/10'],
    diagnosisText: 'Patient presents with acute lumbar strain. Musculoskeletal origin confirmed. No neurological deficits noted on history. Differential: lumbar disc herniation (mild, L4/L5 level) — requires imaging if no improvement.',
    doctorNote: 'Recommended NSAIDs (Ibuprofen 400mg TDS), bed rest for 2 days, warm compress to lower back (15 min, 3×/day). Return if symptoms worsen, spread to legs, or cause bladder/bowel dysfunction — these require urgent evaluation. Refer to physiotherapy if no improvement in 5 days.',
    prescriptions: [
      { drug: 'Ibuprofen', note: 'With food', dose: '400mg', freq: 'TDS', dur: '5 days' },
      { drug: 'Diclofenac Gel', note: 'Topical — lower back', dose: 'Apply', freq: 'BD', dur: '7 days' },
    ],
  })

  useEffect(() => {
    let recId = localStorage.getItem('passRecordId')
    if (!recId) { recId = generateRecordId(); localStorage.setItem('passRecordId', recId) }

    const name = localStorage.getItem('patientName') || 'Salami Olusegun'
    const consultStart = localStorage.getItem('consultationStart') || formatDateTime()
    const consultSummary = localStorage.getItem('consultationSummary') || null

    const palettes = {
      emergency:        { bg: '#fff0f0', border: '#ba1a1a', color: '#ba1a1a', label: 'High — Seek Immediate Care', emoji: '🚨', title: 'Seek Immediate Emergency Care' },
      see_doctor_today: { bg: '#fff8f0', border: '#fe932c', color: '#904d00', label: 'Moderate — See Doctor Soon', emoji: '⏰', title: 'See Doctor Within 24 Hours' },
      monitor_at_home:  { bg: '#f0fffd', border: '#0f766e', color: '#005c55', label: 'Low — Monitor Symptoms', emoji: '🏠', title: 'Monitor Symptoms at Home' },
    }

    try {
      const tr = JSON.parse(localStorage.getItem('triageResult') || '{}')
      const symptoms = JSON.parse(localStorage.getItem('symptoms') || '[]')
      if (tr.urgency) {
        const p = palettes[tr.urgency] || palettes.see_doctor_today
        setData(prev => ({
          ...prev,
          recordId: recId,
          name,
          date: formatDate(),
          consultDate: consultStart.split(',')[0] || formatDate(),
          urgencyBg: p.bg, urgencyBorder: p.border, urgencyColor: p.color,
          urgencyEmoji: tr.emoji || p.emoji,
          urgencyTitle: tr.title || p.title,
          urgencyLabel: `Urgency Level: ${p.label}`,
          triageSummary: tr.summary || prev.triageSummary,
          symptoms: symptoms.length ? symptoms : prev.symptoms,
          ...(consultSummary ? { doctorNote: consultSummary } : {}),
        }))
      } else {
        setData(prev => ({ ...prev, recordId: recId, name, date: formatDate(), consultDate: consultStart.split(',')[0] || formatDate() }))
      }
    } catch (_) {
      setData(prev => ({ ...prev, recordId: recId, name }))
    }
  }, [])

  function sharePass() {
    const text = `Àlàáfíà Connect — Patient Pass\nPatient: ${data.name}\nRecord ID: ${data.recordId}\nDate: ${data.date}\nUrgency: ${data.urgencyTitle}\n\nVerify at: alaafiaconnect.ng/verify`
    if (navigator.share) {
      navigator.share({ title: 'Patient Pass — Àlàáfíà Connect', text })
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setToastVisible(true)
        setTimeout(() => setToastVisible(false), 2500)
      })
    }
  }

  function downloadPDF() {
    window.print()
  }

  return (
    <div className="min-h-dvh bg-background text-on-surface flex flex-col page-shell">

      <PrimaryHeader
        title="Àlàáfíà Connect"
        subtitle="PATIENT PASS"
        showBack
        onBack={() => navigate(-1)}
        right={
          <div className="flex items-center gap-1">
            <button
              onClick={sharePass}
              className="p-2 rounded-full text-on-primary-container hover:bg-white/10 transition-colors"
              title="Share Pass"
            >
              <svg translate="no" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
            <button
              onClick={downloadPDF}
              className="p-2 rounded-full text-on-primary-container hover:bg-white/10 transition-colors"
              title="Print Pass"
            >
              <svg translate="no" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
          </div>
        }
      />

      {/* -- Main -- */}
      <main className="flex-1 flex flex-col pt-16 pb-6 page-content">
        <div className="px-4 py-4 flex flex-col gap-4">

          {/* -- Patient Pass Document Card -- */}
          <div
            id="print-pass"
            className="bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant/40 overflow-hidden relative slide-up"
            style={{ boxShadow: '0 4px 24px rgba(0,92,85,.08)' }}
          >
            {/* Watermark */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
              style={{ opacity: 0.025, transform: 'rotate(-30deg)', fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 48, fontWeight: 900, color: '#005c55', whiteSpace: 'nowrap', letterSpacing: '0.1em' }}
            >
              Àlàáfíà Connect VERIFIED
            </div>

            {/* Pass Header */}
            <div className="relative z-10" style={{ background: 'linear-gradient(135deg,#005c55 0%,#0f766e 100%)' }}>
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                        <svg translate="no" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a3faef" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                        </svg>
                      </div>
                      <span className="italic font-bold text-on-primary-container" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 16 }}>Àlàáfíà Connect</span>
                    </div>
                    <p className="text-on-primary-container/60" style={{ fontSize: 10, letterSpacing: '0.08em' }}>TELEMEDICINE PLATFORM — NIGERIA</p>
                  </div>
                  <div className="bg-white/15 border border-white/20 rounded-xl px-3 py-1.5 text-right">
                    <p className="font-black text-white" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 13, letterSpacing: '0.1em' }}>PATIENT PASS</p>
                    <p className="text-on-primary-container/70 font-semibold" style={{ fontSize: 10 }}>{data.recordId}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-on-primary-container font-semibold" style={{ fontSize: 12 }}>{data.date}</p>
                    <p className="text-on-primary-container/60" style={{ fontSize: 10 }}>Date Issued</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                    <div className="w-2 h-2 rounded-full bg-on-primary-container" />
                    <span className="font-bold text-on-primary-container" style={{ fontSize: 10, letterSpacing: '0.06em' }}>VERIFIED DOCUMENT</span>
                  </div>
                </div>
              </div>
              <div className="bg-black/10 px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-on-primary-container/60 uppercase" style={{ fontSize: 10, letterSpacing: '0.06em' }}>Patient Name</p>
                  <p className="font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 17 }}>{data.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-on-primary-container/60 uppercase" style={{ fontSize: 10, letterSpacing: '0.06em' }}>Record ID</p>
                  <p className="font-bold text-on-primary-container" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 14 }}>{data.recordId}</p>
                </div>
              </div>
            </div>

            {/* Patient Details */}
            <div className="relative z-10 px-5 py-4">
              <p className="font-semibold text-on-surface-variant uppercase tracking-widest mb-3" style={{ fontSize: 10 }}>Patient Information</p>
              <div className="grid grid-cols-3 gap-3">
                {[['Age', '38'], ['Gender', 'Male'], ['Phone', '08012345678']].map(([lbl, val]) => (
                  <div key={lbl} className="bg-surface-container-low rounded-xl p-3">
                    <p className="text-on-surface-variant" style={{ fontSize: 10 }}>{lbl}</p>
                    <p className="font-bold text-on-surface" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: lbl === 'Phone' ? 12 : 16 }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>

            <hr className="mx-5 border-none border-t" style={{ borderTop: '1.5px dashed #bdc9c6', margin: '0 20px 0' }} />

            {/* AI Triage Summary */}
            <div className="relative z-10 px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center">
                  <svg translate="no" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a3faef" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <p className="font-bold text-on-surface" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 14 }}>AI Triage Assessment</p>
                <span className="bg-primary-container/20 text-primary rounded-full px-2 py-0.5 font-bold" style={{ fontSize: 9 }}>Cencori AI</span>
              </div>
              {/* Urgency Badge */}
              <div className="flex items-center gap-2.5 rounded-xl p-3 mb-3" style={{ background: data.urgencyBg, border: `1.5px solid ${data.urgencyBorder}` }}>
                <span style={{ fontSize: 22 }}>{data.urgencyEmoji}</span>
                <div>
                  <p className="font-bold" style={{ fontSize: 13, color: data.urgencyColor, fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif" }}>{data.urgencyTitle}</p>
                  <p className="text-on-surface-variant" style={{ fontSize: 11 }}>{data.urgencyLabel}</p>
                </div>
              </div>
              {/* Symptoms */}
              <div className="mb-3">
                <p className="font-semibold text-on-surface-variant mb-2 uppercase tracking-wider" style={{ fontSize: 11 }}>Reported Symptoms</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.symptoms.map((s, i) => (
                    <span key={i} className="bg-surface-container border border-outline-variant text-on-surface rounded-full px-2.5 py-0.5" style={{ fontSize: 12 }}>
                      <span style={{ color: '#904d00' }} className="mr-1">⚠️</span>{s}
                    </span>
                  ))}
                </div>
              </div>
              {/* AI Inference */}
              <div className="bg-surface-container-low rounded-xl p-3.5">
                <p className="font-semibold text-on-surface-variant mb-1 uppercase tracking-wider" style={{ fontSize: 10 }}>AI Inference</p>
                <p className="text-on-surface leading-relaxed" style={{ fontSize: 13 }}>{data.triageSummary}</p>
              </div>
            </div>

            <hr className="mx-5 border-none" style={{ borderTop: '1.5px dashed #bdc9c6', margin: '0 20px' }} />

            {/* Doctor Consultation Notes */}
            <div className="relative z-10 px-5 pb-4 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container" style={{ fontSize: 9, fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif" }}>AC</div>
                <p className="font-bold text-on-surface" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 14 }}>Doctor's Consultation Notes</p>
              </div>
              {/* Doctor Info */}
              <div className="flex items-center gap-3 bg-surface-container-low rounded-xl p-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container flex-shrink-0" style={{ fontSize: 13, fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif" }}>AC</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 13 }}>Dr. Adeoti Clinton</p>
                  <p className="text-on-surface-variant" style={{ fontSize: 11 }}>General Physician — MDCN Reg. #4567</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-on-surface" style={{ fontSize: 11 }}>{data.consultDate}</p>
                  <p className="text-on-surface-variant" style={{ fontSize: 10 }}>Consultation</p>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="mb-3">
                <p className="font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider" style={{ fontSize: 10 }}>Diagnosis</p>
                <div className="bg-surface-container-low rounded-xl p-3.5">
                  <p className="text-on-surface leading-relaxed" style={{ fontSize: 13 }}>{data.diagnosisText}</p>
                </div>
              </div>

              {/* Prescription Table */}
              <div className="mb-3">
                <p className="font-semibold text-on-surface-variant mb-2 uppercase tracking-wider" style={{ fontSize: 10 }}>
                  <span className="mr-1">✈️</span>Prescription
                </p>
                <div className="rounded-xl border border-outline-variant/50 overflow-hidden">
                  <div className="grid grid-cols-12 bg-surface-container px-3 py-2" style={{ fontSize: 10 }}>
                    {['Drug', 'Dose', 'Freq.', 'Dur.'].map((h, i) => (
                      <div key={h} className={`font-bold text-on-surface-variant uppercase tracking-wide ${i === 0 ? 'col-span-5' : i === 1 ? 'col-span-3' : 'col-span-2'}`}>{h}</div>
                    ))}
                  </div>
                  {data.prescriptions.map((rx, i) => (
                    <div key={i} className="grid grid-cols-12 px-3 py-2.5 border-t border-outline-variant/30">
                      <div className="col-span-5">
                        <p className="font-semibold text-on-surface" style={{ fontSize: 12 }}>{rx.drug}</p>
                        <p className="text-on-surface-variant" style={{ fontSize: 10 }}>{rx.note}</p>
                      </div>
                      <div className="col-span-3 text-on-surface" style={{ fontSize: 12 }}>{rx.dose}</div>
                      <div className="col-span-2 text-on-surface" style={{ fontSize: 12 }}>{rx.freq}</div>
                      <div className="col-span-2 text-on-surface" style={{ fontSize: 12 }}>{rx.dur}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctor's Note */}
              <div className="mb-3">
                <p className="font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider" style={{ fontSize: 10 }}>Doctor's Note &amp; Follow-up</p>
                <div className="bg-surface-container-low rounded-xl p-3.5">
                  <p className="text-on-surface leading-relaxed" style={{ fontSize: 13 }}>{data.doctorNote}</p>
                </div>
              </div>

              {/* Signature + QR */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <div style={{ width: 120, borderTop: '1.5px solid #111c2d', marginBottom: 4 }} />
                  <p className="font-bold text-on-surface" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 11 }}>Dr. Adeoti Clinton</p>
                  <p className="text-on-surface-variant" style={{ fontSize: 10 }}>MBBS — MDCN #4567</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  {/* QR Code SVG */}
                  <div className="rounded-sm overflow-hidden border border-outline-variant p-1 bg-white" style={{ width: 72, height: 72 }}>
                    <svg translate="no" width="62" height="62" viewBox="0 0 62 62" xmlns="http://www.w3.org/2000/svg">
                      <rect x="1" y="1" width="18" height="18" rx="2" fill="#111c2d"/><rect x="4" y="4" width="12" height="12" rx="1" fill="white"/><rect x="7" y="7" width="6" height="6" rx="0.5" fill="#111c2d"/>
                      <rect x="43" y="1" width="18" height="18" rx="2" fill="#111c2d"/><rect x="46" y="4" width="12" height="12" rx="1" fill="white"/><rect x="49" y="7" width="6" height="6" rx="0.5" fill="#111c2d"/>
                      <rect x="1" y="43" width="18" height="18" rx="2" fill="#111c2d"/><rect x="4" y="46" width="12" height="12" rx="1" fill="white"/><rect x="7" y="49" width="6" height="6" rx="0.5" fill="#111c2d"/>
                      <rect x="22" y="1" width="3" height="3" fill="#111c2d"/><rect x="26" y="1" width="3" height="3" fill="#111c2d"/>
                      <rect x="32" y="1" width="3" height="3" fill="#111c2d"/><rect x="38" y="1" width="3" height="3" fill="#111c2d"/>
                      <rect x="22" y="22" width="3" height="3" fill="#111c2d"/><rect x="30" y="22" width="3" height="3" fill="#111c2d"/>
                      <rect x="22" y="30" width="3" height="3" fill="#111c2d"/><rect x="32" y="30" width="3" height="3" fill="#111c2d"/>
                      <rect x="22" y="38" width="3" height="3" fill="#111c2d"/><rect x="34" y="38" width="3" height="3" fill="#111c2d"/>
                      <rect x="44" y="22" width="3" height="3" fill="#111c2d"/><rect x="52" y="26" width="3" height="3" fill="#111c2d"/>
                      <rect x="44" y="34" width="3" height="3" fill="#111c2d"/><rect x="52" y="42" width="3" height="3" fill="#111c2d"/>
                    </svg>
                  </div>
                  <p className="text-on-surface-variant text-center" style={{ fontSize: 9 }}>Scan to Verify</p>
                </div>
              </div>
            </div>

            {/* Pass Footer */}
            <div className="relative z-10 px-5 py-3 border-t border-outline-variant/40 flex items-center justify-between" style={{ background: '#f0f3ff' }}>
              <p className="text-on-surface-variant" style={{ fontSize: 10 }}>
                 This document is digitally issued by Àlàáfíà Connect.<br/>Verify at: alaafiaconnect.ng/verify
              </p>
              <div className="flex items-center gap-1 flex-shrink-0">
                <svg translate="no" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#005c55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span className="font-semibold text-primary" style={{ fontSize: 10 }}>Secure Document</span>
              </div>
            </div>
          </div>

          {/* -- Action Buttons -- */}
          <div id="action-buttons" className="flex flex-col gap-3 slide-up slide-up-d1">
            <button
              onClick={sharePass}
              className="w-full rounded-xl font-bold py-3.5 flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
              style={{ background: '#005c55', color: '#a3faef', fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 13, letterSpacing: '0.04em' }}
            >
              <svg translate="no" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              SHARE PATIENT PASS
            </button>
            <button
              onClick={downloadPDF}
              className="w-full rounded-xl font-bold py-3.5 flex items-center justify-center gap-2 border-2 border-primary text-primary transition-all hover:bg-primary hover:text-white active:scale-[0.97]"
              style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 13, letterSpacing: '0.04em' }}
            >
              <svg translate="no" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              DOWNLOAD AS PDF
            </button>
            <button
              onClick={() => navigate('/care-pathway')}
              className="w-full rounded-xl font-bold py-3.5 flex items-center justify-center gap-2 border-2 border-outline-variant text-on-surface-variant transition-all hover:border-primary hover:text-primary active:scale-[0.97]"
              style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 13, letterSpacing: '0.04em' }}
            >
              <svg translate="no" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              BOOK FOLLOW-UP APPOINTMENT
            </button>
          </div>

          {/* -- Emergency Contact Card -- */}
          <div id="sos-card" className="bg-error-container border-2 rounded-2xl p-4 slide-up slide-up-d2" style={{ borderColor: 'rgba(186,26,26,0.4)' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-on-error-container" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 14 }}>Emergency Contacts</p>
                <p className="text-on-error-container/70" style={{ fontSize: 11 }}>Nigeria Emergency Services</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-error flex items-center justify-center">
                <svg translate="no" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07C9.44 17.29 7.76 15.32 6.7 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 5.61 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L9.68 9.91"/>
                </svg>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {[['112', 'General Emergency'], ['199', 'Ambulance / NEMA']].map(([num, label]) => (
                <a
                  key={num}
                  href={`tel:${num}`}
                  className="flex items-center gap-2 bg-error rounded-xl px-3 py-3 text-white transition-all hover:opacity-90 active:scale-95"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg translate="no" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 18v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A2 2 0 0 1 5.61 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L9.68 9.91"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-black" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 18, lineHeight: 1 }}>{num}</p>
                    <p style={{ fontSize: 10 }} className="opacity-80">{label}</p>
                  </div>
                </a>
              ))}
            </div>
            <p className="text-center text-on-error-container/60 mt-2.5" style={{ fontSize: 10 }}>
              Tap to call — For life-threatening emergencies only
            </p>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toastVisible && (
        <div className="fixed z-[100] left-1/2 -translate-x-1/2 bottom-24 font-medium rounded-full px-5 py-3 shadow-xl" style={{ background: '#263143', color: '#ecf1ff', fontSize: 13 }}>
          📱 Pass details copied to clipboard!
        </div>
      )}

      <BottomNav active="/history" />
    </div>
  )
}


