import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * ProfileDropdown — Top-right avatar button that opens a user info + logout panel
 *
 * Reads from localStorage: patientName, patientPhone, selectedLanguage, userRole
 * Logout: clears localStorage, redirects to /
 */
export default function ProfileDropdown({ light = false }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const dropRef = useRef(null)

  const patientName = localStorage.getItem('patientName') || 'Patient'
  const patientPhone = localStorage.getItem('patientPhone') || ''
  const selectedLanguage = localStorage.getItem('selectedLanguage') || 'English'
  const userRole = localStorage.getItem('userRole') || 'patient'

  const initials = patientName
    .split(' ')
    .map(n => n[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'P'

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function handleLogout() {
    const preserveKeys = ['patientName', 'patientPhone', 'patientDob', 'patientGender', 'selectedLanguage', 'userRole']
    const preserved = preserveKeys.reduce((acc, key) => {
      const value = localStorage.getItem(key)
      if (value) acc[key] = value
      return acc
    }, {})

    localStorage.clear()
    Object.entries(preserved).forEach(([key, value]) => {
      localStorage.setItem(key, value)
    })

    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    navigate('/')
  }

  const avatarStyle = light
    ? { background: 'rgba(255,255,255,0.2)', color: '#a3faef', border: '1.5px solid rgba(255,255,255,0.3)' }
    : { background: '#0f766e', color: '#a3faef', border: '1.5px solid rgba(15,118,110,0.4)' }

  return (
    <div className="relative" ref={dropRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Profile menu"
        className="w-9 h-9 rounded-full flex items-center justify-center font-bold transition-all active:scale-95 shadow-sm"
        style={{ ...avatarStyle, fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {initials}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className="absolute right-0 top-12 z-[200] w-64 rounded-2xl shadow-xl overflow-hidden"
          style={{
            background: '#fff',
            border: '1px solid #e7eeff',
            boxShadow: '0 8px 32px rgba(0,92,85,0.15), 0 2px 8px rgba(0,0,0,0.08)',
            animation: 'fadeInUp 0.18s ease both',
          }}
        >
          {/* User Info Header */}
          <div className="p-4" style={{ background: 'linear-gradient(135deg, #005c55, #0f766e)' }}>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#a3faef', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16 }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15 }}>
                  {patientName}
                </p>
                {patientPhone && (
                  <p className="text-white/70 text-xs truncate">{patientPhone}</p>
                )}
                <span
                  className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: 'rgba(163,250,239,0.25)', color: '#a3faef', letterSpacing: '0.05em' }}
                >
                  {userRole === 'doctor' ? 'PRACTITIONER' : 'PATIENT'}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center gap-2.5 text-sm">
              <span className="material-symbols-outlined text-primary text-[18px]" translate="no">language</span>
              <span className="text-on-surface-variant font-medium">{selectedLanguage}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-outline-variant/40 mx-4" />

          {/* Actions */}
          <div className="p-2">
            <button
              onClick={() => { setOpen(false); navigate('/onboarding?edit=true') }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-on-surface hover:bg-surface-container-low transition-colors text-left"
            >
              <span className="material-symbols-outlined text-primary text-[18px]" translate="no">edit</span>
              Edit Profile
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left"
              style={{ color: '#ba1a1a' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fff0f0'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span className="material-symbols-outlined text-error text-[18px]" translate="no">logout</span>
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

