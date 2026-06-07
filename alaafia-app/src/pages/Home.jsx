import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n.js'
import BottomNav from '../components/BottomNav.jsx'
import ProfileDropdown from '../components/ProfileDropdown.jsx'

export default function Home() {
  const t = useT()
  const navigate = useNavigate()
  const [patientName, setPatientName] = useState('Patient')
  const [greeting, setGreeting] = useState(t('home.greetingMorning', 'Good morning'))
  const [verifyPin, setVerifyPin] = useState('')
  const [verifyState, setVerifyState] = useState('idle') // idle | loading | done

  useEffect(() => {
    const name = localStorage.getItem('patientName') || 'Patient'
    setPatientName(name)
    const h = new Date().getHours()
    setGreeting(h < 12 ? t('home.greetingMorning', 'Good morning') : h < 17 ? t('home.greetingAfternoon', 'Good afternoon') : t('home.greetingEvening', 'Good evening'))
  }, [t])

  const [verifyResult, setVerifyResult] = useState(null)

  async function handleVerify() {
    if (!verifyPin.trim()) return
    setVerifyState('loading')
    setVerifyResult(null)
    try {
      const q = encodeURIComponent(verifyPin.trim())
      const res = await fetch(`https://api.fda.gov/drug/ndc.json?search=brand_name:"${q}"+OR+generic_name:"${q}"+OR+product_ndc:"${q}"&limit=1`)
      if (!res.ok) throw new Error('Not found')
      const data = await res.json()
      if (data.results && data.results.length > 0) {
        setVerifyResult({
          brand: data.results[0].brand_name || data.results[0].generic_name,
          manufacturer: data.results[0].labeler_name,
          type: data.results[0].product_type || 'HUMAN PRESCRIPTION DRUG'
        })
        setVerifyState('done')
      } else {
        throw new Error('Not found')
      }
    } catch (err) {
      setVerifyResult(null)
      setVerifyState('error')
    }
  }

  const HEALTH_TIPS = [
    { icon: 'water', label: t('home.tipHydrateLabel', 'Stay Hydrated'), text: t('home.tipHydrateText'), from: 'rgba(0,92,85,0.1)', border: 'rgba(0,92,85,0.1)', iconColor: '#005c55' },
    { icon: 'moon', label: t('home.tipSleepLabel', 'Quality Sleep'), text: t('home.tipSleepText'), from: 'rgba(254,147,44,0.15)', border: 'rgba(254,147,44,0.15)', iconColor: '#904d00' },
    { icon: 'run', label: t('home.tipExerciseLabel', 'Stay Active'), text: t('home.tipExerciseText'), from: 'rgba(166,0,47,0.1)', border: 'rgba(166,0,47,0.1)', iconColor: '#a6002f' },
    { icon: 'eco', label: t('home.tipEatLabel', 'Eat Balanced'), text: t('home.tipEatText'), from: 'rgba(22,163,74,0.1)', border: 'rgba(134,239,172,0.4)', iconColor: '#16a34a' },
  ]

  const QUICK_ACTIONS = [
    { label: 'Find Hospitals', sub: 'Nearby facilities', path: '/facilities', iconBg: 'rgba(0,92,85,0.1)', iconColor: '#005c55', icon: <svg translate="no" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5-2.5z"/></svg> },
    { label: 'See a Doctor', sub: 'Online consultation', path: '/consultation', iconBg: 'rgba(254,147,44,0.15)', iconColor: '#904d00', icon: <svg translate="no" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg> },
    { label: 'Health Records', sub: 'View past records', path: '/history', iconBg: 'rgba(231,238,255,0.8)', iconColor: '#3e4947', icon: <svg translate="no" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3H6c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9l-7-6zm-2 14H7v-2h4v2zm3-4H7v-2h7v2zm0-4H7V7h7v2z"/></svg> },
    { label: 'Patient Pass', sub: 'Medical summary', path: '/patient-pass', iconBg: 'rgba(166,0,47,0.1)', iconColor: '#a6002f', icon: <svg translate="no" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg> },
  ]

  const TIP_ICONS = {
    water: <svg translate="no" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l-5.5 9h11zm0 3.84L14.6 9h-5.2zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5S15.01 22 17.5 22s4.5-2.01 4.5-4.5S19.99 13 17.5 13zm0 7a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5zM3 21.5h8v-8H3zm2-6h4v4H5z"/></svg>,
    moon: <svg translate="no" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>,
    run: <svg translate="no" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/></svg>,
    eco: <svg translate="no" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6.05 8.5c.44-4.13 3.81-6.65 10.58-7.45-1.16 5.22-3.98 8.39-10.58 7.45zm-2.04 9.68C5.58 15.36 7.22 13.6 9.72 12.4 8.35 16.25 6.4 18.21 4.01 18.18zm11.94-4.99C12.58 14.78 9.74 17.77 9 22c-.87-3.75.69-7.76 5.44-9.09.61 1.92.63 4.04.23 5.71-.52-1.42-.68-2.98-.72-4.93z"/></svg>,
  }

  return (
    <div className="bg-background text-on-surface page-shell">

      {/* -- Top Header -- */}
      <header
        className="fixed top-0 left-0 right-0 lg:left-[88px] z-50 flex justify-between items-center py-3"
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}
      >
        <div className="header-content flex items-center justify-between">
          <h1
            translate="no"
            className="font-bold italic text-primary"
            style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 20 }}
          >
            Àlàáfíà Connect
          </h1>
          <ProfileDropdown />
        </div>
      </header>

      <main className="pt-20 pb-6 page-content flex flex-col gap-6">

        {/* -- Greeting Banner -- */}
        <section className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #005c55 0%, #0f766e 100%)' }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -mr-8 -mt-8" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 -ml-8 -mb-8" />
          <p className="text-sm opacity-80 mb-1 relative z-10">{greeting}</p>
          <h2 className="font-bold text-xl mb-1 relative z-10" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif" }}>
            {patientName}
          </h2>
          <p className="text-sm opacity-80 relative z-10">{t('home.howAreYou', 'How are you feeling today?')}</p>
          <div className="flex gap-3 mt-4 relative z-10">
              <div className="bg-white/15 rounded-full px-3 py-1 flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                {t('home.aiReady', 'AI Ready')}
              </div>
              <div className="bg-white/15 rounded-full px-3 py-1 flex items-center gap-1.5 text-xs">
                <svg translate="no" width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                {t('home.securePortal', 'Secure Portal')}
              </div>
          </div>
        </section>

        {/* -- Primary CTA -- */}
        <section>
          <h3 className="font-bold text-on-surface mb-4" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 18 }}>
            Start Your Care Journey
          </h3>
          <button
            onClick={() => navigate('/symptom-intake')}
            className="w-full bg-primary-container text-on-primary-container font-bold rounded-xl flex items-center justify-between px-6 group transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ height: 64, boxShadow: '0 4px 14px rgba(15,118,110,0.3)' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg translate="no" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              </div>
              <div className="text-left">
                <p className="font-bold">AI Symptom Check</p>
                <p className="text-xs opacity-80">Tell me how you're feeling</p>
              </div>
            </div>
            <svg translate="no" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="group-hover:translate-x-1 transition-transform">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </section>

        {/* -- Quick Actions 2×2 Grid -- */}
        <section>
          <h3 className="font-bold text-on-surface mb-4" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 16 }}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {QUICK_ACTIONS.map(({ label, sub, path, iconBg, iconColor, icon }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="bg-white border border-outline-variant rounded-xl p-4 flex flex-col gap-3 text-left hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg, color: iconColor }}>
                  {icon}
                </div>
                <div>
                  <p className="font-bold text-on-surface text-sm">{label}</p>
                  <p className="text-xs text-on-surface-variant">{sub}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* -- Health Tips Carousel -- */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-on-surface" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 16 }}>
              Health Tips
            </h3>
            <span className="text-xs text-primary font-bold cursor-pointer">View all</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
            {HEALTH_TIPS.map(({ icon, label, text, from, border, iconColor }) => (
              <div
                key={label}
                className="flex-none w-60 rounded-xl p-4"
                style={{ background: `linear-gradient(135deg, ${from}, transparent)`, border: `1px solid ${border}` }}
              >
                <div style={{ color: iconColor }}>{TIP_ICONS[icon]}</div>
                <p className="font-bold text-on-surface text-sm mt-3">{label}</p>
                <p className="text-xs text-on-surface-variant mt-1">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* -- Emergency SOS -- */}
        <section className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'rgba(166,0,47,0.05)', border: '1px solid rgba(166,0,47,0.2)' }}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-tertiary flex items-center justify-center">
                <svg translate="no" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              </div>
              <div className="absolute inset-0 w-12 h-12 bg-tertiary rounded-full pulse-ring opacity-30" />
            </div>
            <div>
              <p className="font-bold text-on-surface text-sm">Emergency?</p>
              <p className="text-xs text-on-surface-variant">Tap to call emergency services</p>
            </div>
          </div>
          <a href="tel:112" className="bg-tertiary text-white font-bold text-sm px-4 py-2 rounded-xl active:scale-95 transition-all shadow-sm">
            CALL 112
          </a>
        </section>

        {/* -- ALAAFIA VERIFY -- */}
        <section className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(15,118,110,0.15)' }}>
              <svg translate="no" width="18" height="18" viewBox="0 0 24 24" fill="#0f766e"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
            </div>
            <div>
              <p className="font-bold text-on-surface text-sm">MEDICATION VERIFY</p>
              <p className="text-xs text-on-surface-variant">Powered by OpenFDA</p>
            </div>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter Drug Name or NDC Code"
              value={verifyPin}
              onChange={e => setVerifyPin(e.target.value)}
              className="flex-grow h-12 px-4 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary outline-none text-sm transition-all"
            />
            <button
              onClick={handleVerify}
              className="bg-primary text-white px-4 rounded-xl font-bold text-sm active:scale-95 transition-all"
            >
              {verifyState === 'loading' ? (
                <svg translate="no" className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.4)" strokeWidth="4"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              ) : 'Search'}
            </button>
          </div>
          {verifyState === 'error' && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
              <svg translate="no" width="18" height="18" viewBox="0 0 24 24" fill="#dc2626"><path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>
              <div>
                <p className="text-sm font-bold text-red-600">Medication Not Found</p>
                <p className="text-xs text-red-500">Check spelling or NDC code and try again.</p>
              </div>
            </div>
          )}
          {verifyState === 'done' && verifyResult && (
            <div className="mt-3 bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-3">
              <svg translate="no" width="18" height="18" viewBox="0 0 24 24" fill="#005c55"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-primary truncate">{verifyResult.brand}</p>
                <p className="text-xs text-on-surface-variant truncate">Mfg: {verifyResult.manufacturer}</p>
                <p className="text-[10px] text-on-surface-variant/70 uppercase tracking-wider mt-0.5">{verifyResult.type}</p>
              </div>
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant/40 bg-white py-6 page-content">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg translate="no" width="20" height="20" viewBox="0 0 24 24" fill="#005c55">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
            </svg>
            <span translate="no" className="font-bold text-primary italic text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Àlàáfíà Connect
            </span>
          </div>
          <div className="text-center md:text-right text-xs text-on-surface-variant flex flex-col sm:flex-row items-center gap-3">
            <p>© {new Date().getFullYear()} <span translate="no">Àlàáfíà Connect</span>. All rights reserved.</p>
            <div className="flex gap-3 text-[11px] text-on-surface-variant/60">
              <a href="#" className="hover:text-primary">Privacy</a>
              <a href="#" className="hover:text-primary">Terms</a>
              <a href="#" className="hover:text-primary">Support</a>
            </div>
          </div>
        </div>
      </footer>

      <BottomNav active="/home" />
    </div>
  )
}


