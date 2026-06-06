import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav.jsx'
import PrimaryHeader from '../components/PrimaryHeader.jsx'

export default function CarePathway() {
  const navigate = useNavigate()
  const [triageText, setTriageText] = useState(null)
  const [activeLang, setActiveLang] = useState('English')

  useEffect(() => {
    const t = localStorage.getItem('triageResult')
    if (t) setTriageText(t)
    const lang = localStorage.getItem('selectedLanguage')
    if (lang) setActiveLang(lang)
  }, [])

  const LANGS = ['English', 'Yorùbá', 'Hausa', 'Igbo', 'Pidgin']

  return (
    <div className="bg-background text-on-surface page-shell">
      <PrimaryHeader
        title="Àlàáfíà Connect"
        subtitle="CARE PATHWAY"
        showBack
        onBack={() => navigate(-1)}
      />

      <main className="pt-16 pb-6 page-content flex flex-col gap-6">

        {/* Triage Banner */}
        {triageText && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.1)', borderLeft: '4px solid #f59e0b' }}>
            <svg translate="no" width="22" height="22" viewBox="0 0 24 24" fill="#d97706">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <div>
              <p className="font-bold text-amber-800 text-sm">AI Triage Result</p>
              <p className="text-xs text-amber-700">{triageText}</p>
              <p className="text-xs text-amber-700">Choose a care path below.</p>
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <h2 className="font-bold text-on-surface mb-1" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 24 }}>
            Resolution Gateway
          </h2>
          <p className="text-sm text-on-surface-variant">Choose your preferred path for medical assistance.</p>
        </div>

        {/* Path Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Path A — Find Local Facilities */}
          <section
            onClick={() => navigate('/facilities')}
            className="bg-white border-2 border-outline-variant rounded-xl p-6 flex flex-col cursor-pointer transition-all hover:shadow-xl"
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,92,85,0.4)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,92,85,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#bdc9c6'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div className="mb-4 flex justify-between items-start">
              <div className="p-3 bg-primary/10 rounded-xl">
                <svg translate="no" width="36" height="36" viewBox="0 0 24 24" fill="#005c55">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <span className="flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Find Clinics</span>
              </span>
            </div>
            <h3 className="font-bold text-on-surface mb-3" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 20 }}>
              Hospital &amp; Facility Finder
            </h3>
            <p className="text-sm text-on-surface-variant mb-6 flex-grow leading-relaxed">
              Browse verified hospitals and healthcare facilities across Nigeria — with real-time location detection, geofencing, and directions.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[['500+', 'Facilities'], ['36', 'States'], ['GPS', 'Directions']].map(([val, lbl]) => (
                <div key={lbl} className="bg-primary/5 rounded-xl p-3 text-center">
                  <p className="font-bold text-primary text-lg">{val}</p>
                  <p className="text-[10px] text-on-surface-variant">{lbl}</p>
                </div>
              ))}
            </div>
            <button className="w-full h-14 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:bg-primary-container hover:text-on-primary-container">
              LAUNCH FACILITY FINDER
              <svg translate="no" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </section>

          {/* Path B — Online Doctor */}
          <section
            onClick={() => navigate('/consultation')}
            className="bg-white border-2 border-outline-variant rounded-xl p-6 flex flex-col cursor-pointer transition-all hover:shadow-xl"
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(254,147,44,0.4)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(254,147,44,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#bdc9c6'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div className="mb-4 flex justify-between items-start">
              <div className="p-3 bg-secondary-container/10 rounded-xl">
                <svg translate="no" width="36" height="36" viewBox="0 0 24 24" fill="#fe932c">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
              </div>
              <span className="flex items-center gap-2 bg-secondary-container/5 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-secondary-container rounded-full animate-pulse" />
                <span className="text-[11px] font-bold text-secondary-container uppercase tracking-wider">3 Online</span>
              </span>
            </div>
            <h3 className="font-bold text-on-surface mb-3" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 20 }}>
              Premium Digital Care
            </h3>
            <p className="text-sm text-on-surface-variant mb-6 flex-grow leading-relaxed">
              Connect instantly with a certified medical professional via encrypted AI-assisted chat. Receive personalised diagnosis and electronic prescriptions.
            </p>
            <div className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant mb-6">
              <div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center flex-shrink-0">
                <svg translate="no" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#904d00" strokeWidth="2" strokeLinecap="round">
                  <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Consultation Fee</p>
                <p className="text-xl font-bold text-on-surface">Pay ?1,000</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[11px] text-on-surface-variant">Powered by</p>
                <p className="text-xs font-bold text-primary">Àlàáfíà AI</p>
              </div>
            </div>
            <button className="w-full h-14 bg-white border-2 border-primary text-primary font-bold rounded-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:bg-primary hover:text-white">
              START CONSULTATION
              <svg translate="no" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </button>
          </section>
        </div>

        {/* Language chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1 mr-1">
            <svg translate="no" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            Available in:
          </span>
          {LANGS.map(l => (
            <button
              key={l}
              onClick={() => setActiveLang(l)}
              className="px-3 py-1.5 rounded-full border text-[11px] font-bold transition-colors"
              style={{
                borderColor: activeLang === l ? '#005c55' : '#bdc9c6',
                color: activeLang === l ? '#005c55' : '#111c2d',
                background: activeLang === l ? 'rgba(0,92,85,0.06)' : 'transparent',
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </main>

      <BottomNav active="/care-pathway" />
    </div>
  )
}


