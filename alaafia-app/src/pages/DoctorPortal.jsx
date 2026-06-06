import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader.jsx';
import ProfileDropdown from '../components/ProfileDropdown.jsx';

/* ─── Brand Tokens ─────────────────────────────────────────── */
const C = {
  primary:                '#005c55',
  primaryContainer:       '#0f766e',
  onPrimaryContainer:     '#a3faef',
  onPrimary:              '#ffffff',
  secondary:              '#904d00',
  secondaryContainer:     '#fe932c',
  onSecondaryContainer:   '#663500',
  bg:                     '#f9f9ff',
  onSurface:              '#111c2d',
  surfaceContainerLow:    '#f0f3ff',
  surfaceContainer:       '#e7eeff',
  surfaceContainerLowest: '#ffffff',
  surfaceVariant:         '#d8e3fb',
  outlineVariant:         '#bdc9c6',
  onSurfaceVariant:       '#3e4947',
  secondaryFixed:         '#ffdcc3',
  tertiary:               '#a6002f',
  error:                  '#ba1a1a',
};

/* ─── Demo Data ─────────────────────────────────────────────── */
const doctorInfo = {
  name:          'Dr. Adeoti Clinton',
  specialty:     'General Physician',
  mdcn:          'MDCN #4567',
  verified:      true,
  earnings:      24000,
  todayConsults: 8,
  pending:       3,
  rating:        4.8,
};

const pendingPatients = [
  {
    id: 'p1', name: 'Salami Olusegun', record: 'AL-90234',
    triage: 'moderate', complaint: 'Sharp lower back pain (1 day)',
    waiting: '5 mins', age: 38,
  },
  {
    id: 'p2', name: 'Adaeze Okonkwo', record: 'AL-90235',
    triage: 'mild', complaint: 'Persistent dry cough (3 days)',
    waiting: '12 mins', age: 27,
  },
  {
    id: 'p3', name: 'Ibrahim Musa', record: 'AL-90236',
    triage: 'emergency', complaint: 'Chest pain with shortness of breath',
    waiting: '2 mins', age: 52,
  },
];

const recentPatients = [
  { name: 'Chioma Eze',      date: 'Today, 09:15 AM',   diagnosis: 'Acute pharyngitis',           rating: 5 },
  { name: 'Tunde Bakare',    date: 'Yesterday, 3:30 PM', diagnosis: 'Type 2 DM follow-up',         rating: 4 },
  { name: 'Fatima Al-Hassan',date: 'Jun 3, 2026',        diagnosis: 'Antenatal visit — normal',    rating: 5 },
];

/* ─── Triage helpers ────────────────────────────────────────── */
const triageBadge = {
  emergency: { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' },
  moderate:  { bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  mild:      { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
};
const triageLabel = {
  emergency: 'Emergency',
  moderate:  'Moderate',
  mild:      'Mild',
};

/* ─── Avatar helper ─────────────────────────────────────────── */
const avatarColors = [
  ['#005c55', '#a3faef'], ['#904d00', '#ffdcc3'],
  ['#1d4ed8', '#bfdbfe'], ['#7c3aed', '#ede9fe'],
  ['#b91c1c', '#fee2e2'],
];
function initials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
function avatarColor(name) {
  const idx = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[idx];
}

/* ─── Stars ─────────────────────────────────────────────────── */
function Stars({ rating }) {
  return (
    <span style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: 12, color: i <= rating ? '#f59e0b' : '#d1d5db' }}>★</span>
      ))}
    </span>
  );
}

/* ─── Bottom Nav ────────────────────────────────────────────── */
function BottomNav({ active, setActiveTab }) {
  const tabs = [
    {
      id: 'dashboard', label: 'Dashboard',
      icon: (
        <svg translate="no" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
      ),
    },
    {
      id: 'patients', label: 'My Patients',
      icon: (
        <svg translate="no" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
    },
    {
      id: 'schedule', label: 'Schedule',
      icon: (
        <svg translate="no" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
    },
    {
      id: 'profile', label: 'Profile',
      icon: (
        <svg translate="no" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 480, height: 64, background: '#fff',
      borderTop: `1px solid ${C.outlineVariant}`,
      display: 'flex', alignItems: 'stretch',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.07)', zIndex: 50,
    }}>
      {tabs.map(tab => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: isActive ? C.primary : C.onSurfaceVariant,
              transition: 'color 0.2s',
              position: 'relative',
            }}
          >
            {isActive && (
              <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: 32, height: 3, borderRadius: '0 0 4px 4px',
                background: C.primary,
              }} />
            )}
            <div style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s' }}>
              {tab.icon}
            </div>
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────── */
import { useLocation } from 'react-router-dom';

export default function DoctorPortal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'dashboard');
  const [expandedTriage, setExpandedTriage] = useState({});
  const [showAllRecent, setShowAllRecent] = useState(false);

  const toggleTriage = (id) =>
    setExpandedTriage(prev => ({ ...prev, [id]: !prev[id] }));

  const [ac1, ac2] = avatarColor(doctorInfo.name);

  return (
    <div style={{
      background: C.bg, minHeight: '100vh',
      fontFamily: "'Noto Sans',system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
      maxWidth: 480, margin: '0 auto',
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .card-enter { animation: fadeInUp 0.35s ease both; }
        .stats-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <AppHeader
        title="Doctor Portal"
        subtitle={doctorInfo.specialty}
        actions={(
          <div className="flex items-center gap-3">
            <span className="hidden min-w-[100px] text-sm font-semibold text-on-surface md:block">
              {doctorInfo.name}
            </span>
            <div className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-semibold text-on-surface">
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <ProfileDropdown />
          </div>
        )}
      />

      {/* ── Scrollable Content ── */}
      <div style={{ paddingTop: 56, paddingBottom: 80, overflowY: 'auto', display: activeTab === 'dashboard' ? 'block' : 'none' }}>

        {/* ── 1. Welcome Banner ── */}
        <div style={{
          margin: '0 0 0 0',
          background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%)`,
          padding: '24px 20px 22px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute', top: -30, right: -30,
            width: 120, height: 120, borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
          }} />
          <div style={{
            position: 'absolute', bottom: -20, right: 60,
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative', zIndex: 1 }}>
            {/* Doctor avatar */}
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              background: `linear-gradient(135deg, ${ac2}, ${ac1})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 800, color: '#fff',
              border: '2.5px solid rgba(255,255,255,0.35)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}>
              {initials(doctorInfo.name)}
            </div>

            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: '0 0 2px', fontWeight: 500 }}>
                Good morning
              </p>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.3px' }}>
                Dr. Clinton
              </h2>

              {/* Badges */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                  background: 'rgba(255,255,255,0.18)', color: '#fff',
                }}>
                  {doctorInfo.specialty}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                  background: 'rgba(255,255,255,0.18)', color: '#fff',
                }}>
                  {doctorInfo.mdcn}
                </span>
                {doctorInfo.verified && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                    background: 'rgba(163,250,239,0.25)', color: C.onPrimaryContainer,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pending alert */}
          <div style={{
            marginTop: 16, padding: '10px 14px', borderRadius: 12,
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: isOnline ? '#4ade80' : '#9ca3af',
              boxShadow: isOnline ? '0 0 0 3px rgba(74,222,128,0.35)' : 'none',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
              {isOnline
                ? `You have ${doctorInfo.pending} pending consultations`
                : 'You are currently offline — patients cannot reach you'}
            </span>
          </div>
        </div>

        {/* ── 2. Stats Row ── */}
        <div style={{ padding: '16px 0 4px' }}>
          <div
            className="stats-scroll"
            style={{
              display: 'flex', gap: 12, paddingInline: 20,
              overflowX: 'auto', scrollbarWidth: 'none',
            }}
          >
            {[
              {
                icon: 'C', value: doctorInfo.todayConsults, label: 'Today\'s Consults',
                bg: `${C.primary}10`, iconBg: `${C.primary}20`, valueColor: C.primary,
              },
              {
                icon: 'P', value: doctorInfo.pending, label: 'Pending Reviews',
                bg: '#fff7ed', iconBg: '#fed7aa', valueColor: '#c2410c',
              },
              {
                icon: '₦', value: `${doctorInfo.earnings.toLocaleString()}`, label: 'This Week',
                bg: '#f0fdf4', iconBg: '#bbf7d0', valueColor: '#15803d',
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="card-enter"
                style={{
                  minWidth: 130, flexShrink: 0, borderRadius: 18,
                  background: stat.bg, padding: '16px 14px',
                  animationDelay: `${i * 0.08}s`,
                  border: `1px solid ${C.outlineVariant}44`,
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: stat.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, marginBottom: 10,
                }}>
                  {stat.icon}
                </div>
                <p style={{ fontSize: 26, fontWeight: 800, color: stat.valueColor, margin: '0 0 2px', lineHeight: 1 }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: 11, color: C.onSurfaceVariant, margin: 0, fontWeight: 600 }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. Pending Queue ── */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: C.onSurface, margin: 0 }}>
                Incoming Consultations
              </h2>
              <span style={{
                minWidth: 22, height: 22, borderRadius: 11,
                background: C.tertiary, color: '#fff',
                fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                paddingInline: 6,
              }}>
                {pendingPatients.length}
              </span>
            </div>
            <span style={{ fontSize: 12, color: C.primary, fontWeight: 700, cursor: 'pointer' }}>
              View all
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingPatients.map((p, i) => {
              const badge = triageBadge[p.triage];
              const triageExpanded = expandedTriage[p.id];
              const [bg, fg] = avatarColor(p.name);

              return (
                <div
                  key={p.id}
                  className="card-enter"
                  style={{
                    background: '#fff', borderRadius: 18,
                    border: `1.5px solid ${p.triage === 'emergency' ? '#fecaca' : C.outlineVariant}`,
                    overflow: 'hidden', animationDelay: `${i * 0.1}s`,
                    boxShadow: p.triage === 'emergency'
                      ? '0 4px 20px rgba(185,28,28,0.1)'
                      : '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Emergency top bar */}
                  {p.triage === 'emergency' && (
                    <div style={{
                      height: 3, background: 'linear-gradient(90deg, #dc2626, #ef4444)',
                    }} />
                  )}

                  <div style={{ padding: '14px 16px' }}>
                    {/* Top row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      {/* Avatar */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                        background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, fontWeight: 800, color: fg,
                      }}>
                        {initials(p.name)}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: C.onSurface, margin: 0 }}>{p.name}</p>
                            <p style={{ fontSize: 11, color: C.onSurfaceVariant, margin: 0, fontWeight: 500 }}>
                              {p.record} · Age {p.age}
                            </p>
                          </div>
                          {/* Triage badge */}
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                            background: badge.bg, color: badge.color,
                            border: `1px solid ${badge.border}`, flexShrink: 0,
                          }}>
                            {triageLabel[p.triage]}
                          </span>
                        </div>

                        {/* Complaint */}
                        <p style={{
                          fontSize: 13, color: C.onSurfaceVariant, margin: '6px 0',
                          lineHeight: 1.45,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {p.complaint}
                        </p>

                        {/* Waiting */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                          <svg translate="no" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.onSurfaceVariant} strokeWidth="2.5" strokeLinecap="round">
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                          </svg>
                          <span style={{ fontSize: 11, color: C.onSurfaceVariant, fontWeight: 600 }}>
                            Waiting: {p.waiting}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded triage detail */}
                    {triageExpanded && (
                      <div style={{
                        marginTop: 8, padding: '10px 12px', borderRadius: 10,
                        background: `${badge.bg}`, border: `1px solid ${badge.border}`,
                        fontSize: 12, color: badge.color, lineHeight: 1.55,
                        fontWeight: 500,
                      }}>
                        <p style={{ margin: '0 0 4px', fontWeight: 700 }}>🏥 AI Triage Assessment</p>
                        <p style={{ margin: 0 }}>
                          Triage level: <strong>{triageLabel[p.triage]}</strong>. Patient is {p.age} years old.
                          Complaint: <em>{p.complaint}</em>.
                          {p.triage === 'emergency'
                            ? ' Immediate attention required — potential cardiac event.'
                            : p.triage === 'moderate'
                            ? ' Moderate severity. Recommend consultation within 10 minutes.'
                            : ' Low severity. No immediate risk detected.'}
                        </p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button
                        onClick={() => navigate('/doctor-chat')}
                        style={{
                          flex: 1, height: 40, borderRadius: 12, border: 'none',
                          background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
                          color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          boxShadow: `0 3px 10px ${C.primary}30`,
                        }}
                      >
                        <svg translate="no" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                        </svg>
                        Accept &amp; Consult
                      </button>
                      <button
                        onClick={() => toggleTriage(p.id)}
                        style={{
                          height: 40, paddingInline: 16, borderRadius: 12,
                          border: `1.5px solid ${C.primary}`, background: 'transparent',
                          color: C.primary, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 5,
                          transition: 'background 0.15s',
                        }}
                      >
                        <svg translate="no" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {triageExpanded ? 'Hide' : 'View Triage'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 4. Recent Patients ── */}
        <div style={{ padding: '24px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: C.onSurface, margin: 0 }}>
              Recent Patients
            </h2>
            <button
              onClick={() => setShowAllRecent(v => !v)}
              style={{ fontSize: 12, color: C.primary, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {showAllRecent ? 'Show less' : 'See all'}
            </button>
          </div>

          <div style={{
            background: '#fff', borderRadius: 18, overflow: 'hidden',
            border: `1px solid ${C.outlineVariant}`,
          }}>
            {(showAllRecent ? recentPatients : recentPatients.slice(0, 2)).map((p, i) => {
              const [bg, fg] = avatarColor(p.name);
              const isLast = i === (showAllRecent ? recentPatients : recentPatients.slice(0, 2)).length - 1;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px',
                    borderBottom: isLast ? 'none' : `1px solid ${C.outlineVariant}`,
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800, color: fg,
                  }}>
                    {initials(p.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.onSurface, margin: '0 0 2px' }}>{p.name}</p>
                    <p style={{ fontSize: 11, color: C.onSurfaceVariant, margin: '0 0 3px', fontWeight: 500 }}>{p.date}</p>
                    <p style={{
                      fontSize: 12, color: C.onSurfaceVariant, margin: 0,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {p.diagnosis}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <Stars rating={p.rating} />
                    <p style={{ fontSize: 11, color: C.onSurfaceVariant, margin: '3px 0 0', fontWeight: 500 }}>
                      {p.rating}/5
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 5. Quick Actions ── */}
        <div style={{ padding: '24px 20px 0' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: C.onSurface, margin: '0 0 14px' }}>
            Quick Actions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              {
                icon: '🕐', label: 'Update Availability',
                sub: isOnline ? 'Currently Online' : 'Currently Offline',
                action: () => setIsOnline(v => !v),
                accent: C.primary,
              },
              {
                icon: '📅', label: 'View Schedule',
                sub: 'Manage your slots',
                action: () => setActiveTab('schedule'),
                accent: '#1d4ed8',
              },
              {
                icon: '₦', label: 'Earnings',
                sub: `₦${doctorInfo.earnings.toLocaleString()} this week`,
                action: () => setActiveTab('dashboard'),
                accent: '#15803d',
              },
            ].map((action, i) => (
              <button
                key={i}
                onClick={action.action}
                style={{
                  background: '#fff', borderRadius: 18,
                  border: `1.5px solid ${C.outlineVariant}`,
                  padding: '16px 14px', cursor: 'pointer', textAlign: 'left',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: `${action.accent}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, marginBottom: 10,
                }}>
                  {action.icon}
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.onSurface, margin: '0 0 3px' }}>
                  {action.label}
                </p>
                <p style={{ fontSize: 11, color: C.onSurfaceVariant, margin: 0, fontWeight: 500 }}>
                  {action.sub}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Rating banner */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{
            background: `linear-gradient(135deg, #fef3c7, #fde68a)`,
            borderRadius: 18, padding: '16px 18px',
            display: 'flex', alignItems: 'center', gap: 14,
            border: '1px solid #fde68a',
          }}>
            <span style={{ fontSize: 32 }}>⭐</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#78350f', margin: '0 0 2px' }}>
                Your Rating: {doctorInfo.rating} / 5.0
              </p>
              <Stars rating={Math.round(doctorInfo.rating)} />
              <p style={{ fontSize: 11, color: '#92400e', margin: '4px 0 0', fontWeight: 500 }}>
                Based on patient feedback this week
              </p>
            </div>
          </div>
        </div>

        <div style={{ height: 20 }} />
      </div>

      {/* ── Tab Views ── */}
      {activeTab === 'patients' && (
        <div style={{ paddingTop: 76, paddingBottom: 80, paddingInline: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.onSurface, marginBottom: 16 }}>My Patients</h2>
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: `1px solid ${C.outlineVariant}` }}>
            <p style={{ color: C.onSurfaceVariant, fontSize: 14 }}>Select a patient to view their records.</p>
            {pendingPatients.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${C.outlineVariant}` }}>
                <div>
                  <p style={{ fontWeight: 700, margin: 0 }}>{p.name}</p>
                  <p style={{ fontSize: 12, color: C.onSurfaceVariant, margin: 0 }}>Record: {p.record}</p>
                </div>
                <button onClick={() => navigate('/doctor-chat')} style={{ padding: '6px 12px', borderRadius: 8, background: C.primary, color: '#fff', border: 'none', fontWeight: 600 }}>Chat</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div style={{ paddingTop: 76, paddingBottom: 80, paddingInline: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.onSurface, marginBottom: 16 }}>My Schedule</h2>
          <div style={{ background: '#fff', borderRadius: 16, padding: 40, border: `1px solid ${C.outlineVariant}`, textAlign: 'center' }}>
            <span style={{ fontSize: 40 }}>📅</span>
            <p style={{ color: C.onSurfaceVariant, fontSize: 14, marginTop: 12 }}>You have no upcoming appointments today.</p>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div style={{ paddingTop: 76, paddingBottom: 80, paddingInline: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.onSurface, marginBottom: 16 }}>My Profile</h2>
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: `1px solid ${C.outlineVariant}` }}>
            <p style={{ fontWeight: 700, margin: '0 0 8px' }}>{doctorInfo.name}</p>
            <p style={{ fontSize: 14, color: C.onSurfaceVariant, margin: 0 }}>{doctorInfo.specialty}</p>
            <p style={{ fontSize: 12, color: C.onSurfaceVariant, margin: 0 }}>{doctorInfo.mdcn}</p>
          </div>
        </div>
      )}

      {/* ── Fixed Bottom Nav ── */}
      <BottomNav active={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
