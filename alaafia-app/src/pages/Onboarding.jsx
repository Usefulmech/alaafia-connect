import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TOTAL_STEPS = 3

const LANGUAGES = [
  { code: 'English', label: 'English', native: 'English', abbr: 'EN' },
  { code: 'Pidgin', label: 'Nigerian Pidgin', native: 'Naija', abbr: 'PID' },
  { code: 'Yoruba', label: 'Yorùbá', native: 'Èdè Yorùbá', abbr: 'YO' },
  { code: 'Hausa', label: 'Hausa', native: 'Harshen Hausa', abbr: 'HA' },
  { code: 'Igbo', label: 'Igbo', native: 'Asụsụ Igbo', abbr: 'IG' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(() => {
    const isEditing = new URLSearchParams(window.location.search).get('edit') === 'true'
    if (isEditing) return 3
    if (localStorage.getItem('patientName')) return 0 // Returning user
    return 1 // New user
  })
  const [selectedLang, setSelectedLang] = useState(() => localStorage.getItem('selectedLanguage') || null)
  const [selectedRole, setSelectedRole] = useState(() => localStorage.getItem('userRole') || null)
  const [patName, setPatName] = useState(() => localStorage.getItem('patientName') || '')
  const [patDob, setPatDob] = useState(() => localStorage.getItem('patientDob') || '')
  const [patPhone, setPatPhone] = useState(() => {
    const phone = localStorage.getItem('patientPhone') || ''
    return phone.startsWith('+234') ? phone.slice(4) : phone
  })
  const [patGender, setPatGender] = useState(() => localStorage.getItem('patientGender') || '')

  const progressPct = Math.round((step / TOTAL_STEPS) * 100)

  function goTo(n) {
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function completeSetup() {
    localStorage.setItem('patientName', patName.trim() || 'Patient')
    localStorage.setItem('patientDob', patDob)
    localStorage.setItem('patientPhone', patPhone.trim() ? '+234' + patPhone.trim() : '')
    localStorage.setItem('patientGender', patGender)
    localStorage.setItem('selectedLanguage', selectedLang || 'English')
    localStorage.setItem('userRole', selectedRole || 'patient')
    
    // Handle GTranslate cookie
    const langMap = { 'English': 'en', 'Yoruba': 'yo', 'Hausa': 'ha', 'Igbo': 'ig', 'Pidgin': 'en' }
    const targetLang = langMap[selectedLang || 'English'] || 'en'
    if (targetLang !== 'en') {
      document.cookie = `googtrans=/en/${targetLang}; path=/`
    } else {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    }

    // Trigger translate instantly without reload
    setTimeout(() => {
      const combo = document.querySelector('.goog-te-combo');
      if (combo) {
        combo.value = targetLang;
        combo.dispatchEvent(new Event('change'));
      }
    }, 100);

    if (selectedRole === 'doctor') {
      navigate('/doctor-onboarding')
    } else {
      navigate('/home')
    }
  }

  // -- Shared button style helpers ----------------------------------------------
  const primaryBtn = (enabled) => ({
    background: enabled ? '#0f766e' : '#bdc9c6',
    color: enabled ? '#a3faef' : '#fff',
    boxShadow: enabled ? '0 4px 14px rgba(15,118,110,0.35)' : 'none',
    cursor: enabled ? 'pointer' : 'not-allowed',
  })

  return (
    <div className="min-h-dvh bg-background text-on-surface antialiased flex flex-col relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="fixed top-[-10%] right-[-10%] w-[45%] aspect-square bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="fixed bottom-[-5%] left-[-5%] w-[35%] aspect-square bg-secondary-container/10 rounded-full blur-2xl -z-10 pointer-events-none" />

      <main className="flex-grow flex flex-col px-5 pt-10 pb-8 max-w-md mx-auto w-full">

        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg translate="no" width="32" height="32" viewBox="0 0 24 24" fill="#005c55">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
            </svg>
            <h1
              translate="no"
              className="font-bold italic text-primary"
              style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 28, lineHeight: 1.2 }}
            >
              Àlàáfíà Connect
            </h1>
          </div>
          <p className="text-on-surface-variant text-sm">
            Accessible healthcare for every Nigerian
          </p>
        </div>

        {/* Step indicator */}
        {step > 0 && (
          <div className="flex items-center gap-3 mb-6">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full transition-all duration-500"
                style={{ background: i < step ? '#0f766e' : '#e7eeff' }}
              />
            ))}
            <span className="text-xs text-on-surface-variant font-semibold ml-1 flex-shrink-0">
              {step}/{TOTAL_STEPS}
            </span>
          </div>
        )}

        {/* -- STEP 0: Welcome Back -------------------------------------------- */}
        {step === 0 && (
          <div className="step-transition flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <div className="w-24 h-24 rounded-full bg-primary-container text-primary flex items-center justify-center text-4xl font-bold mb-6 border-4 border-white shadow-sm">
              {patName.charAt(0) || 'P'}
            </div>
            <h2 className="font-bold text-2xl mb-2 text-on-surface" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Welcome back, {patName.split(' ')[0]}!
            </h2>
            <p className="text-on-surface-variant mb-6">Enter your registered phone number to continue.</p>
            
            <div className="w-full text-left mb-6">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Phone Number</label>
              <div className="flex gap-2 w-full">
                <div className="h-14 px-3 flex items-center justify-center bg-surface-container-low rounded-xl border border-outline-variant/60 font-semibold text-on-surface">
                  +234
                </div>
                <input
                  type="tel"
                  placeholder="8012345678"
                  value={patPhone}
                  onChange={e => setPatPhone(e.target.value)}
                  className="flex-1 h-14 px-4 bg-surface-container-low rounded-xl border-2 border-outline-variant focus:border-primary outline-none font-medium text-on-surface"
                />
              </div>
            </div>

            <button
              onClick={() => {
                 if (patPhone.trim().length >= 10) {
                   if (selectedRole === 'doctor') navigate('/doctor-portal')
                   else navigate('/home')
                 } else {
                   alert("Please enter a valid phone number to continue.")
                 }
              }}
              className="w-full h-14 font-bold rounded-xl flex items-center justify-center gap-2 text-white shadow-md active:scale-[0.98] transition-all"
              style={{ background: patPhone.trim().length >= 10 ? '#0f766e' : '#bdc9c6', boxShadow: patPhone.trim().length >= 10 ? '0 4px 14px rgba(15,118,110,0.35)' : 'none' }}
            >
              Sign In
              <svg translate="no" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            
            <button
              onClick={() => {
                 localStorage.clear()
                 setPatName('')
                 setStep(1)
              }}
              className="mt-6 text-sm font-semibold text-error hover:underline"
            >
              Not {patName.split(' ')[0]}? Sign in with a different account
            </button>
          </div>
        )}

        {/* -- STEP -1: Manual Sign In ------------------------------------------- */}
        {step === -1 && (
          <div className="step-transition flex flex-col justify-center min-h-[50vh] px-4">
            <h2 className="font-bold text-2xl mb-2 text-on-surface text-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Sign In
            </h2>
            <p className="text-on-surface-variant text-center mb-6">Enter your registered phone number and role.</p>
            
            <div className="w-full text-left mb-4">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Phone Number</label>
              <div className="flex gap-2 w-full">
                <div className="h-14 px-3 flex items-center justify-center bg-surface-container-low rounded-xl border border-outline-variant/60 font-semibold text-on-surface">
                  +234
                </div>
                <input
                  type="tel"
                  placeholder="8012345678"
                  value={patPhone}
                  onChange={e => setPatPhone(e.target.value)}
                  className="flex-1 h-14 px-4 bg-surface-container-low rounded-xl border-2 border-outline-variant focus:border-primary outline-none font-medium text-on-surface"
                />
              </div>
            </div>

            <div className="w-full text-left mb-6">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">I am a...</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedRole('patient')}
                  className={`flex-1 h-14 rounded-xl font-bold border-2 transition-all ${selectedRole === 'patient' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant bg-surface text-on-surface-variant'}`}
                >
                  Patient
                </button>
                <button
                  onClick={() => setSelectedRole('doctor')}
                  className={`flex-1 h-14 rounded-xl font-bold border-2 transition-all ${selectedRole === 'doctor' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant bg-surface text-on-surface-variant'}`}
                >
                  Doctor
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                 if (patPhone.trim().length >= 10 && selectedRole) {
                   localStorage.setItem('userRole', selectedRole)
                   localStorage.setItem('patientPhone', patPhone)
                   if (!localStorage.getItem('patientName')) {
                     localStorage.setItem('patientName', selectedRole === 'doctor' ? 'Dr. Adeoti Clinton' : 'Salami Olusegun')
                   }
                   if (selectedRole === 'doctor') navigate('/doctor-portal')
                   else navigate('/home')
                 } else {
                   alert("Please enter a valid phone number and select a role.")
                 }
              }}
              className="w-full h-14 font-bold rounded-xl flex items-center justify-center gap-2 text-white shadow-md active:scale-[0.98] transition-all"
              style={{ background: patPhone.trim().length >= 10 && selectedRole ? '#0f766e' : '#bdc9c6', boxShadow: patPhone.trim().length >= 10 && selectedRole ? '0 4px 14px rgba(15,118,110,0.35)' : 'none' }}
            >
              Sign In
            </button>

            <button
              onClick={() => setStep(1)}
              className="mt-6 text-sm font-semibold text-primary hover:underline text-center w-full"
            >
              Back to Sign Up
            </button>
          </div>
        )}

        {/* -- STEP 1: Language ----------------------------------------------- */}
        {step === 1 && (
          <div className="step-transition flex flex-col gap-5">
            <div>
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-[11px] font-bold mb-3 uppercase tracking-wider">
                Step 1 of 3
              </span>
              <h2
                className="font-bold text-on-surface mb-2 leading-tight"
                style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 22 }}
              >
                Select your language
              </h2>
              <p className="text-on-surface-variant text-sm">
                Choose your preferred language for consultations and AI responses.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {LANGUAGES.map(({ code, label, native, abbr }) => {
                const active = selectedLang === code
                return (
                  <button
                    key={code}
                    onClick={() => setSelectedLang(code)}
                    className="flex items-center justify-between p-4 border-2 rounded-xl transition-all active:scale-[0.98]"
                    style={{
                      borderColor: active ? '#005c55' : '#bdc9c6',
                      background: active ? 'rgba(0,92,85,0.06)' : '#fff',
                      boxShadow: active ? '0 0 0 2px rgba(0,92,85,0.15)' : 'none',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                        style={{
                          background: active ? '#005c55' : '#e7eeff',
                          color: active ? '#a3faef' : '#3e4947',
                           fontFamily: "'Noto Sans','Satoshi', sans-serif",
                        }}
                      >
                        {abbr}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-on-surface text-sm">{label}</p>
                        <p className="text-on-surface-variant text-xs">{native}</p>
                      </div>
                    </div>
                    {active && (
                      <svg translate="no" width="20" height="20" viewBox="0 0 24 24" fill="#005c55">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => selectedLang && goTo(2)}
              disabled={!selectedLang}
              className="w-full h-14 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={primaryBtn(!!selectedLang)}
            >
              CONTINUE
              <svg translate="no" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            
            <button
              onClick={() => setStep(-1)}
              className="mt-2 text-sm font-semibold text-primary hover:underline w-full text-center"
            >
              Already have an account? Sign in
            </button>
          </div>
        )}

        {/* -- STEP 2: Role --------------------------------------------------- */}
        {step === 2 && (
          <div className="step-transition flex flex-col gap-5">
            <div>
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-[11px] font-bold mb-3 uppercase tracking-wider">
                Step 2 of 3
              </span>
              <h2
                className="font-bold text-on-surface mb-2 leading-tight"
                style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 22 }}
              >
                Who are you joining as?
              </h2>
              <p className="text-on-surface-variant text-sm">
                Select your role to personalise your experience.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                {
                  role: 'patient',
                  label: 'Patient',
                  sub: 'I am seeking medical care and consultations',
                  iconBg: 'rgba(0,92,85,0.1)',
                  iconColor: '#005c55',
                  icon: (
                    <svg translate="no" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                    </svg>
                  ),
                },
                {
                  role: 'doctor',
                  label: 'Practitioner',
                  sub: 'I am a medical professional offering care',
                  iconBg: 'rgba(254,147,44,0.15)',
                  iconColor: '#904d00',
                  icon: (
                    <svg translate="no" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.3.3 0 1 0 .3.3"/>
                      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
                      <circle cx="20" cy="10" r="2"/>
                    </svg>
                  ),
                },
              ].map(({ role, label, sub, iconBg, iconColor, icon }) => {
                const active = selectedRole === role
                return (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className="flex items-center gap-4 p-4 border-2 rounded-xl text-left transition-all active:scale-[0.98]"
                    style={{
                      borderColor: active ? '#005c55' : '#bdc9c6',
                      background: active ? 'rgba(0,92,85,0.06)' : '#fff',
                      boxShadow: active ? '0 0 0 2px rgba(0,92,85,0.15)' : 'none',
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: iconBg, color: iconColor }}
                    >
                      {icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-on-surface text-base">{label}</p>
                      <p className="text-on-surface-variant text-sm">{sub}</p>
                    </div>
                    {active && (
                      <svg translate="no" width="20" height="20" viewBox="0 0 24 24" fill="#005c55">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => selectedRole && goTo(3)}
              disabled={!selectedRole}
              className="w-full h-14 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={primaryBtn(!!selectedRole)}
            >
              CONTINUE
              <svg translate="no" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button onClick={() => goTo(1)} className="w-full py-3 text-primary font-bold flex items-center justify-center gap-2 text-sm">
              <svg translate="no" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Change Language
            </button>
          </div>
        )}

        {/* -- STEP 3: Patient Details ----------------------------------------- */}
        {step === 3 && (
          <div className="step-transition flex flex-col gap-5">
            <div>
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-[11px] font-bold mb-3 uppercase tracking-wider">
                Step 3 of 3
              </span>
              <h2
                className="font-bold text-on-surface mb-2"
                style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 22 }}
              >
                {selectedRole === 'doctor' ? 'Your Profile' : 'Your Details'}
              </h2>
              <p className="text-on-surface-variant text-sm">
                {selectedRole === 'doctor'
                  ? 'Basic details before we set up your practitioner profile.'
                  : 'Tell us about yourself to personalise your care.'}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-on-surface text-sm ml-1">Full Name</label>
                <input
                  type="text"
                  placeholder={selectedRole === 'doctor' ? 'Dr. Salami Olusegun' : 'e.g. Salami Olusegun'}
                  value={patName}
                  onChange={e => setPatName(e.target.value)}
                  className="h-14 px-4 bg-white border-2 border-outline-variant rounded-xl focus:border-primary outline-none text-sm transition-all"
                />
              </div>

              {/* DOB */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-on-surface text-sm ml-1">Date of Birth</label>
                <input
                  type="date"
                  value={patDob}
                  onChange={e => setPatDob(e.target.value)}
                  className="h-14 px-4 bg-white border-2 border-outline-variant rounded-xl focus:border-primary outline-none text-sm transition-all"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-on-surface text-sm ml-1">Phone Number</label>
                <div className="flex h-14 bg-white border-2 border-outline-variant rounded-xl overflow-hidden focus-within:border-primary transition-all">
                  <span className="flex items-center px-4 border-r border-outline-variant bg-surface-container-low text-on-surface-variant text-sm font-semibold">
                    +234
                  </span>
                  <input
                    type="tel"
                    placeholder="801 234 5678"
                    value={patPhone}
                    onChange={e => setPatPhone(e.target.value)}
                    className="flex-grow px-4 outline-none text-sm bg-transparent"
                  />
                </div>
              </div>

              {/* Gender — only for patients */}
              {selectedRole === 'patient' && (
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-on-surface text-sm ml-1">Gender</label>
                  <div className="flex gap-3">
                    {['Male', 'Female'].map(g => (
                      <label
                        key={g}
                        className="flex-1 flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all"
                        style={{
                          borderColor: patGender === g ? '#005c55' : '#bdc9c6',
                          background: patGender === g ? 'rgba(0,92,85,0.05)' : '#fff',
                        }}
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={g}
                          checked={patGender === g}
                          onChange={() => setPatGender(g)}
                          className="accent-primary"
                        />
                        <span className="text-sm font-medium">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy note */}
              <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(0,92,85,0.05)' }}>
                <svg translate="no" width="18" height="18" viewBox="0 0 24 24" fill="#005c55" className="flex-shrink-0 mt-0.5">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Your data is secured with AES-256 encryption. We never share your health records with third parties.
                </p>
              </div>
            </div>

            <button
              onClick={completeSetup}
              className="w-full h-14 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md"
              style={{ background: '#0f766e', color: '#a3faef', boxShadow: '0 4px 14px rgba(15,118,110,0.35)' }}
            >
              {selectedRole === 'doctor' ? 'PROCEED TO REGISTRATION' : 'COMPLETE SETUP'}
              <svg translate="no" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button
              onClick={() => {
                // Allow skipping details
                localStorage.setItem('patientName', patName.trim() || 'Patient')
                localStorage.setItem('selectedLanguage', selectedLang || 'English')
                localStorage.setItem('userRole', selectedRole || 'patient')
                
                // Handle GTranslate cookie
                const langMap = { 'English': 'en', 'Yoruba': 'yo', 'Hausa': 'ha', 'Igbo': 'ig', 'Pidgin': 'en' }
                const targetLang = langMap[selectedLang || 'English'] || 'en'
                if (targetLang !== 'en') {
                  document.cookie = `googtrans=/en/${targetLang}; path=/`
                } else {
                  document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
                }

                // Trigger translate instantly without reload
                setTimeout(() => {
                  const combo = document.querySelector('.goog-te-combo');
                  if (combo) {
                    combo.value = targetLang;
                    combo.dispatchEvent(new Event('change'));
                  }
                }, 100);

                navigate('/home')
              }}
              className="w-full py-3 text-on-surface-variant font-bold flex items-center justify-center text-sm hover:text-primary transition-colors"
            >
              Skip for now
            </button>
            <button onClick={() => goTo(2)} className="w-full py-2 text-primary flex items-center justify-center gap-2 text-sm font-semibold">
              <svg translate="no" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Go Back
            </button>
          </div>
        )}

      </main>
    </div>
  )
}


