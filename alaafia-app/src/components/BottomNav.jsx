import { useLocation, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  {
    path: '/home',
    label: 'Home',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    path: '/assess',
    label: 'Assess',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2zm-1 12.5v7l-3-2.5-1 3-2-8 3 1.5 1-3 2 2z" />
      </svg>
    ),
  },
  {
    path: '/history',
    label: 'History',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    path: '/facilities',
    label: 'Facilities',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },

]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const currentPath = location.pathname

  const isActive = (path) => {
    if (path === '/assess' && currentPath === '/symptom-intake') return true;
    return currentPath === path;
  }

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {NAV_ITEMS.map(({ path, label, icon }) => {
          const active = isActive(path)
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`bottom-nav-item ${active ? 'bottom-nav-item--active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="bottom-nav-icon">{icon(active)}</span>
              <span className="bottom-nav-label">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
