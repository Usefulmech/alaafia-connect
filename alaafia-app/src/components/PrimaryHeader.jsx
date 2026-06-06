import { useNavigate } from 'react-router-dom'
import ProfileDropdown from './ProfileDropdown.jsx'

/**
 * PrimaryHeader — Dark green header used on all inner pages
 * Matches `bg-primary` header from HTML prototypes.
 *
 * Props:
 *   title    {string}  — brand title
 *   subtitle {string}  — small subtitle below title
 *   showBack {boolean} — show back chevron on left
 *   onBack   {fn}      — override default navigate(-1)
 *   right    {node}    — custom right-side element (defaults to ProfileDropdown)
 *   noProfile{boolean} — suppress the profile dropdown entirely
 */
export default function PrimaryHeader({ title = 'Àlàáfíà Connect', subtitle, showBack = false, onBack, right, noProfile = false }) {
  const navigate = useNavigate()
  const handleBack = onBack || (() => navigate(-1))

  return (
    <header
      className="fixed top-0 left-0 right-0 lg:left-[88px] z-50 bg-primary shadow-sm"
      style={{ height: 58 }}
    >
      <div className="flex items-center justify-between h-full header-content">

        {/* Left — back button */}
        {showBack ? (
          <button
            onClick={handleBack}
            aria-label="Go back"
            translate="no"
            className="p-2 -ml-1 rounded-full text-on-primary-container hover:bg-white/10 transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
        ) : (
          <div style={{ width: 40 }} />
        )}

        {/* Center — title block */}
        <div className="flex flex-col items-center leading-none">
          <span
            translate="no"
            className="italic font-bold text-on-primary-container"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 17 }}
          >
            {title}
          </span>
          {subtitle && (
            <span
              className="text-on-primary-container/60 mt-0.5 uppercase"
              style={{ fontFamily: 'Satoshi, sans-serif', fontSize: 9, letterSpacing: '0.06em', fontWeight: 600 }}
            >
              {subtitle}
            </span>
          )}
        </div>

        {/* Right — custom or ProfileDropdown */}
        <div className="flex items-center">
          {right ? (
            <div>{right}</div>
          ) : noProfile ? (
            <div style={{ width: 40 }} />
          ) : (
            <ProfileDropdown light />
          )}
        </div>

      </div>
    </header>
  )
}

