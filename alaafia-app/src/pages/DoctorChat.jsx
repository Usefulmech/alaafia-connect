import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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

/* ─── Common Nigerian Drugs ─────────────────────────────────── */
const COMMON_DRUGS = [
  'Paracetamol 500mg', 'Ibuprofen 400mg', 'Diclofenac 50mg', 'Tramadol 50mg',
  'Amoxicillin 500mg', 'Azithromycin 500mg', 'Metronidazole 400mg', 'Cotrimoxazole 480mg',
  'Coartem (Artemether/Lumefantrine)', 'Omeprazole 20mg', 'Metoclopramide 10mg',
  'Cetirizine 10mg', 'Chlorphenamine 4mg', 'Dexamethasone 8mg', 'Prednisolone 5mg',
  'Amlodipine 5mg', 'Lisinopril 5mg', 'Metformin 500mg', 'Glibenclamide 5mg',
  'Diclofenac Gel (topical)', 'Vitamin C 500mg', 'Zinc Sulfate 20mg',
];

/* ─── Avatar helper ─────────────────────────────────────────── */
function initials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

/* ─── Bottom Nav ────────────────────────────────────────────── */
function BottomNav({ navigate }) {
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
      id: 'patients', label: 'My Patients', active: true,
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
        const isActive = !!tab.active;
        return (
          <button
            key={tab.id}
            onClick={() => navigate('/doctor-portal', { state: { activeTab: tab.id } })}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: isActive ? C.primary : C.onSurfaceVariant,
              transition: 'color 0.2s', position: 'relative',
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

/* ─── Notes Modal ───────────────────────────────────────────── */
function NotesModal({ notes, setNotes, onIssuePass, onSaveDraft, onClose }) {
  const [focused, setFocused] = useState('');

  const taStyle = (field) => ({
    width: '100%', padding: '12px 14px', borderRadius: 12,
    border: `2px solid ${focused === field ? C.primary : C.outlineVariant}`,
    background: '#fff', fontSize: 14, fontWeight: 500,
    color: C.onSurface, outline: 'none', resize: 'none',
    lineHeight: 1.55, boxSizing: 'border-box', fontFamily: 'inherit',
    boxShadow: focused === field ? `0 0 0 3px ${C.primary}22` : 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  });

  const inpStyle = (field) => ({
    width: '100%', height: 48, padding: '0 14px', borderRadius: 12,
    border: `2px solid ${focused === field ? C.primary : C.outlineVariant}`,
    background: '#fff', fontSize: 14, fontWeight: 500,
    color: C.onSurface, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: focused === field ? `0 0 0 3px ${C.primary}22` : 'none',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(17,28,45,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: '100%', maxWidth: 480, margin: '0 auto',
        background: C.bg, borderRadius: '24px 24px 0 0',
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
        animation: 'slideUpModal 0.3s cubic-bezier(0.25,0.46,0.45,0.94) both',
      }}>
        {/* Handle */}
        <div style={{ padding: '12px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: C.outlineVariant }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px 16px',
          borderBottom: `1px solid ${C.outlineVariant}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${C.primary}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>📋</div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: C.onSurface, margin: 0 }}>Clinical Notes</p>
              <p style={{ fontSize: 11, color: C.onSurfaceVariant, margin: 0, fontWeight: 500 }}>Salami Olusegun · AL-90234</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 10,
            border: `1.5px solid ${C.outlineVariant}`, background: 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg translate="no" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.onSurfaceVariant} strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Scrollable form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>
          {[
            { key: 'complaint', label: 'Chief Complaint', rows: 2, placeholder: 'Describe the chief complaint…' },
            { key: 'examination', label: 'Examination Notes', rows: 3, placeholder: 'Physical examination findings…' },
          ].map(({ key, label, rows, placeholder }) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.onSurfaceVariant, display: 'block', marginBottom: 6 }}>
                {label}
              </label>
              <textarea
                rows={rows}
                placeholder={placeholder}
                value={notes[key]}
                onChange={e => setNotes(prev => ({ ...prev, [key]: e.target.value }))}
                onFocus={() => setFocused(key)}
                onBlur={() => setFocused('')}
                style={taStyle(key)}
              />
            </div>
          ))}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.onSurfaceVariant, display: 'block', marginBottom: 6 }}>
              Diagnosis
            </label>
            <input
              type="text"
              placeholder="e.g. Acute lumbar strain"
              value={notes.diagnosis}
              onChange={e => setNotes(prev => ({ ...prev, diagnosis: e.target.value }))}
              onFocus={() => setFocused('diagnosis')}
              onBlur={() => setFocused('')}
              style={inpStyle('diagnosis')}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.onSurfaceVariant, display: 'block', marginBottom: 6 }}>
              Additional Instructions
            </label>
            <textarea
              rows={3}
              placeholder="Instructions for the patient (rest, diet, follow-up…)"
              value={notes.instructions}
              onChange={e => setNotes(prev => ({ ...prev, instructions: e.target.value }))}
              onFocus={() => setFocused('instructions')}
              onBlur={() => setFocused('')}
              style={taStyle('instructions')}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div style={{
          padding: '16px 20px 28px', display: 'flex', gap: 10,
          borderTop: `1px solid ${C.outlineVariant}`,
          background: '#fff',
        }}>
          <button
            onClick={onSaveDraft}
            style={{
              flex: 1, height: 48, borderRadius: 12,
              border: `1.5px solid ${C.primary}`, background: 'transparent',
              color: C.primary, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Save Draft
          </button>
          <button
            onClick={onIssuePass}
            style={{
              flex: 2, height: 48, borderRadius: 12, border: 'none',
              background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
              color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: `0 4px 14px ${C.primary}44`,
            }}
          >
            <span>🪪</span> Issue Patient Pass
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Prescribe Modal ───────────────────────────────────────── */
function PrescribeModal({ prescriptions, setPrescriptions, onSave, onClose }) {
  const FREQS = ['OD', 'BD', 'TDS', 'QDS', 'PRN'];
  const [focused, setFocused] = useState('');

  function updateRx(i, field, value) {
    setPrescriptions(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  }

  function addDrug() {
    setPrescriptions(prev => [...prev, { drug: '', dosage: '', frequency: 'TDS', duration: '5', instructions: '' }]);
  }

  function removeRx(i) {
    if (prescriptions.length === 1) return;
    setPrescriptions(prev => prev.filter((_, idx) => idx !== i));
  }

  const inpStyle = (key) => ({
    width: '100%', height: 44, padding: '0 12px', borderRadius: 10,
    border: `2px solid ${focused === key ? C.primary : C.outlineVariant}`,
    background: '#fff', fontSize: 13, fontWeight: 500,
    color: C.onSurface, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
    boxShadow: focused === key ? `0 0 0 3px ${C.primary}22` : 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(17,28,45,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: '100%', maxWidth: 480, margin: '0 auto',
        background: C.bg, borderRadius: '24px 24px 0 0',
        maxHeight: '94vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
        animation: 'slideUpModal 0.3s cubic-bezier(0.25,0.46,0.45,0.94) both',
      }}>
        {/* Handle */}
        <div style={{ padding: '12px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: C.outlineVariant }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px 16px', borderBottom: `1px solid ${C.outlineVariant}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#fef3c7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>💊</div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: C.onSurface, margin: 0 }}>Prescriptions</p>
              <p style={{ fontSize: 11, color: C.onSurfaceVariant, margin: 0, fontWeight: 500 }}>Salami Olusegun · AL-90234</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 10,
            border: `1.5px solid ${C.outlineVariant}`, background: 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg translate="no" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.onSurfaceVariant} strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Drug list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 0' }}>
          {prescriptions.map((rx, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 16, padding: '16px',
              marginBottom: 14, border: `1.5px solid ${C.outlineVariant}`,
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            }}>
              {/* Drug number + remove */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: C.primary,
                  background: `${C.primary}14`, padding: '3px 10px', borderRadius: 20,
                }}>
                  Drug {i + 1}
                </span>
                {prescriptions.length > 1 && (
                  <button
                    onClick={() => removeRx(i)}
                    style={{
                      fontSize: 11, color: C.error, fontWeight: 700, background: '#fee2e2',
                      border: 'none', borderRadius: 8, padding: '4px 10px', cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Drug name with datalist */}
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.onSurfaceVariant, display: 'block', marginBottom: 5 }}>
                  Drug Name
                </label>
                <input
                  list={`drugs-${i}`}
                  type="text"
                  placeholder="Type or select a drug…"
                  value={rx.drug}
                  onChange={e => updateRx(i, 'drug', e.target.value)}
                  onFocus={() => setFocused(`drug-${i}`)}
                  onBlur={() => setFocused('')}
                  style={inpStyle(`drug-${i}`)}
                />
                <datalist id={`drugs-${i}`}>
                  {COMMON_DRUGS.map(d => <option key={d} value={d} />)}
                </datalist>
              </div>

              {/* Dosage */}
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.onSurfaceVariant, display: 'block', marginBottom: 5 }}>
                  Dosage
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 tablet, 400mg"
                  value={rx.dosage}
                  onChange={e => updateRx(i, 'dosage', e.target.value)}
                  onFocus={() => setFocused(`dosage-${i}`)}
                  onBlur={() => setFocused('')}
                  style={inpStyle(`dosage-${i}`)}
                />
              </div>

              {/* Frequency */}
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.onSurfaceVariant, display: 'block', marginBottom: 5 }}>
                  Frequency
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {FREQS.map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => updateRx(i, 'frequency', f)}
                      style={{
                        flex: 1, height: 36, borderRadius: 10, fontSize: 12, fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.15s',
                        border: rx.frequency === f ? `2px solid ${C.primary}` : `2px solid ${C.outlineVariant}`,
                        background: rx.frequency === f ? C.primary : '#fff',
                        color: rx.frequency === f ? '#fff' : C.onSurfaceVariant,
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration + instructions row */}
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.onSurfaceVariant, display: 'block', marginBottom: 5 }}>
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    min="1" max="365"
                    value={rx.duration}
                    onChange={e => updateRx(i, 'duration', e.target.value)}
                    onFocus={() => setFocused(`dur-${i}`)}
                    onBlur={() => setFocused('')}
                    style={inpStyle(`dur-${i}`)}
                  />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.onSurfaceVariant, display: 'block', marginBottom: 5 }}>
                    Special Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. take after meals"
                    value={rx.instructions}
                    onChange={e => updateRx(i, 'instructions', e.target.value)}
                    onFocus={() => setFocused(`ins-${i}`)}
                    onBlur={() => setFocused('')}
                    style={inpStyle(`ins-${i}`)}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add drug */}
          <button
            onClick={addDrug}
            style={{
              width: '100%', height: 44, borderRadius: 12, marginBottom: 16,
              border: `2px dashed ${C.primary}`,
              background: `${C.primary}06`, color: C.primary,
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <svg translate="no" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Another Drug
          </button>
        </div>

        {/* Save */}
        <div style={{
          padding: '16px 20px 28px', borderTop: `1px solid ${C.outlineVariant}`,
          background: '#fff',
        }}>
          <button
            onClick={onSave}
            style={{
              width: '100%', height: 48, borderRadius: 12, border: 'none',
              background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: `0 4px 14px ${C.primary}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <svg translate="no" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Save Prescription
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── End Consult Modal ─────────────────────────────────────── */
function EndConsultModal({ elapsedTime, messageCount, formatTime, onIssuePass, onEndWithout, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(17,28,45,0.6)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{
        width: '100%', maxWidth: 360,
        background: '#fff', borderRadius: 24, padding: '28px 24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        animation: 'popIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
          background: '#fee2e2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26,
        }}>
          🏁
        </div>
        <h2 style={{
          fontSize: 20, fontWeight: 800, color: C.onSurface,
          margin: '0 0 8px', textAlign: 'center',
        }}>
          End Consultation?
        </h2>
        <p style={{ fontSize: 13, color: C.onSurfaceVariant, textAlign: 'center', margin: '0 0 20px', lineHeight: 1.55 }}>
          This will close the session with Salami Olusegun.
        </p>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 12, marginBottom: 24,
          padding: '14px 16px', background: C.surfaceContainerLow,
          borderRadius: 14,
        }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: C.primary, margin: 0 }}>
              {formatTime(elapsedTime)}
            </p>
            <p style={{ fontSize: 11, color: C.onSurfaceVariant, margin: '3px 0 0', fontWeight: 600 }}>Duration</p>
          </div>
          <div style={{ width: 1, background: C.outlineVariant }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: C.primary, margin: 0 }}>
              {messageCount}
            </p>
            <p style={{ fontSize: 11, color: C.onSurfaceVariant, margin: '3px 0 0', fontWeight: 600 }}>Messages</p>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={onIssuePass}
            style={{
              width: '100%', height: 48, borderRadius: 12, border: 'none',
              background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
              color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: `0 4px 14px ${C.primary}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            🪪 Issue Pass &amp; End
          </button>
          <button
            onClick={onEndWithout}
            style={{
              width: '100%', height: 48, borderRadius: 12,
              border: `1.5px solid ${C.outlineVariant}`, background: '#fff',
              color: C.onSurface, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            End Without Pass
          </button>
          <button
            onClick={onCancel}
            style={{
              width: '100%', height: 44, borderRadius: 12,
              border: 'none', background: 'transparent',
              color: C.primary, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Continue Consultation
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────── */
export default function DoctorChat() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    {
      id: '1', from: 'patient',
      content: "Doctor, the pain started yesterday morning. It's very sharp and located in my lower back. Pain is about 7 out of 10.",
      time: '10:42 AM',
    },
    {
      id: '2', from: 'doctor',
      content: "Good day. I've reviewed your triage summary. To help me better — does the pain radiate down to your legs or buttocks, or is it confined to the lower back only?",
      time: '10:43 AM',
    },
    {
      id: '3', from: 'patient',
      content: "It stays in the lower back. Sometimes I feel a bit of stiffness too.",
      time: '10:44 AM',
    },
  ]);
  const [input, setInput] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showPrescribeModal, setShowPrescribeModal] = useState(false);
  const [summaryCollapsed, setSummaryCollapsed] = useState(false);
  const [notes, setNotes] = useState({
    complaint: 'Sharp lower back pain (1 day), severity 7/10',
    examination: '',
    diagnosis: '',
    instructions: '',
  });
  const [prescriptions, setPrescriptions] = useState([
    { drug: '', dosage: '', frequency: 'TDS', duration: '5', instructions: '' },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /* Timer */
  useEffect(() => {
    const interval = setInterval(() => setElapsedTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  /* Auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  function sendMessage() {
    if (!input.trim()) return;
    const msg = {
      id: Date.now().toString(),
      from: 'doctor',
      content: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, msg]);
    setInput('');
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  }

  function issuePatientPass() {
    localStorage.setItem('consultationSummary', JSON.stringify({
      doctorName:    'Dr. Adeoti Clinton',
      mdcn:          'MDCN #4567',
      specialty:     'General Physician',
      date:          new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }),
      time:          new Date().toLocaleTimeString('en-NG'),
      notes:         notes,
      prescriptions: prescriptions.filter(p => p.drug.trim()),
      diagnosis:     notes.diagnosis || 'Acute lumbar strain',
      instructions:  notes.instructions || 'Rest, avoid heavy lifting. Apply warm compress. Return if symptoms worsen.',
    }));
    navigate('/patient-pass');
  }

  const hasActivePrescription = prescriptions.some(p => p.drug.trim());

  /* Action bar items */
  const actions = [
    {
      icon: '📋', label: 'Notes',
      badge: notes.diagnosis ? '✓' : null,
      onClick: () => setShowNotesModal(true),
    },
    {
      icon: '💊', label: 'Prescribe',
      badge: hasActivePrescription ? prescriptions.filter(p => p.drug.trim()).length.toString() : null,
      onClick: () => setShowPrescribeModal(true),
    },
    {
      icon: '📁', label: 'Records',
      badge: null,
      onClick: () => {},
    },
    {
      icon: '🎙', label: 'Voice',
      badge: null,
      onClick: () => {},
    },
  ];

  return (
    <div style={{
      background: C.surfaceContainerLow, minHeight: '100vh',
      fontFamily: "'Noto Sans',system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
      maxWidth: 480, margin: '0 auto',
      display: 'flex', flexDirection: 'column',
    }}>
      <style>{`
        @keyframes slideUpModal {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes popIn {
          from { transform: scale(0.85); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        @keyframes msgSlideIn {
          from { transform: translateY(12px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .msg-enter { animation: msgSlideIn 0.25s ease both; }
        .chat-scroll::-webkit-scrollbar { width: 0; }
        .action-pill:hover { filter: brightness(0.95); }
      `}</style>

      {/* ── Fixed Header ── */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, height: 56, zIndex: 100,
        background: '#fff', borderBottom: `1px solid ${C.outlineVariant}`,
        display: 'flex', alignItems: 'center', padding: '0 12px',
        boxSizing: 'border-box', gap: 10,
        boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
      }}>
        {/* Back */}
        <button
          onClick={() => navigate('/doctor-portal')}
          style={{
            width: 36, height: 36, borderRadius: 10,
            border: `1.5px solid ${C.outlineVariant}`, background: 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg translate="no" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.onSurfaceVariant} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        {/* Patient info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 11, flexShrink: 0,
            background: `linear-gradient(135deg, #005c55, #0f766e)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: '#a3faef',
          }}>
            {initials('Salami Olusegun')}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.onSurface, margin: 0 }}>Salami O.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: C.onSurfaceVariant, fontWeight: 600 }}>AL-90234</span>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <span style={{ fontSize: 10, color: '#15803d', fontWeight: 700 }}>Active</span>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <p style={{
            fontSize: 14, fontWeight: 800, color: C.primary,
            margin: 0, fontVariantNumeric: 'tabular-nums',
            letterSpacing: '0.5px',
          }}>
            {formatTime(elapsedTime)}
          </p>
          <p style={{ fontSize: 9, color: C.onSurfaceVariant, margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>
            Duration
          </p>
        </div>

        {/* End Consult */}
        <button
          onClick={() => setShowEndModal(true)}
          style={{
            height: 34, paddingInline: 12, borderRadius: 10, border: 'none',
            background: `${C.tertiary}15`, color: C.tertiary,
            fontSize: 11, fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
            letterSpacing: '0.3px',
          }}
        >
          <svg translate="no" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18.36 6.64A9 9 0 0 1 20.77 15"/><path d="M6.16 6.16a9 9 0 1 0 12.68 12.68"/>
            <line x1="2" y1="2" x2="22" y2="22"/>
          </svg>
          END
        </button>
      </div>

      {/* ── Content area ── */}
      <div style={{ paddingTop: 56, paddingBottom: 146, display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* ── Patient Summary Card ── */}
        <div style={{
          margin: '8px 12px 0',
          background: '#fff', borderRadius: 16,
          border: `1px solid ${C.outlineVariant}`,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          {/* Toggle header */}
          <button
            onClick={() => setSummaryCollapsed(v => !v)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', border: 'none', background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: `${C.primary}12`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14,
              }}>🤖</div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: C.onSurface, margin: 0 }}>AI Triage Summary</p>
                <p style={{ fontSize: 10, color: C.onSurfaceVariant, margin: 0, fontWeight: 500 }}>
                  Salami Olusegun · Male, 38y · 🟡 Moderate
                </p>
              </div>
            </div>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={C.onSurfaceVariant} strokeWidth="2.5" strokeLinecap="round"
              style={{ transform: summaryCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.25s' }}
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          {/* Expandable content */}
          <div style={{
            maxHeight: summaryCollapsed ? 0 : 220,
            overflow: 'hidden',
            transition: 'max-height 0.35s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}>
            <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${C.outlineVariant}` }}>
              <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{
                    padding: '8px 12px', borderRadius: 10, flex: 1,
                    background: '#fef3c7', border: '1px solid #fde68a',
                  }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#92400e', margin: '0 0 2px' }}>Chief Complaint</p>
                    <p style={{ fontSize: 12, color: '#78350f', margin: 0 }}>
                      Sharp lower back pain (1 day), severity 7/10
                    </p>
                  </div>
                  <div style={{
                    padding: '8px 12px', borderRadius: 10, flex: 1,
                    background: C.surfaceContainerLow, border: `1px solid ${C.outlineVariant}`,
                  }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: C.onSurfaceVariant, margin: '0 0 2px' }}>Vitals</p>
                    <p style={{ fontSize: 12, color: C.onSurface, margin: 0 }}>
                      BP: 128/82 · Temp: 36.8°C
                    </p>
                  </div>
                </div>
                <div style={{
                  padding: '10px 12px', borderRadius: 10,
                  background: `${C.primary}08`, border: `1px solid ${C.primary}22`,
                }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: C.primary, margin: '0 0 3px' }}>
                    AI Assessment
                  </p>
                  <p style={{ fontSize: 12, color: C.onSurface, margin: 0, lineHeight: 1.55 }}>
                    Possible acute lumbar strain or musculoskeletal back pain. No red flags for disc herniation detected.
                    Recommend history of onset, activity, and neurological screen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Messages ── */}
        <div
          className="chat-scroll"
          style={{
            flex: 1, overflowY: 'auto', padding: '12px 12px 0',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}
        >
          {/* Date separator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: C.outlineVariant }} />
            <span style={{
              fontSize: 11, color: C.onSurfaceVariant, fontWeight: 600,
              background: C.surfaceContainerLow, padding: '2px 10px', borderRadius: 20,
            }}>
              Today
            </span>
            <div style={{ flex: 1, height: 1, background: C.outlineVariant }} />
          </div>

          {messages.map((msg, i) => {
            const isDoctor = msg.from === 'doctor';
            return (
              <div
                key={msg.id}
                className="msg-enter"
                style={{
                  display: 'flex',
                  justifyContent: isDoctor ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: 8,
                  animationDelay: `${Math.min(i * 0.05, 0.2)}s`,
                }}
              >
                {/* Patient avatar (left) */}
                {!isDoctor && (
                  <div style={{
                    width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                    background: 'linear-gradient(135deg, #005c55, #0f766e)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: '#a3faef', marginBottom: 4,
                  }}>
                    SO
                  </div>
                )}

                <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: isDoctor ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: isDoctor
                      ? '18px 4px 18px 18px'
                      : '4px 18px 18px 18px',
                    background: isDoctor ? C.primaryContainer : C.surfaceVariant,
                    color: isDoctor ? C.onPrimaryContainer : C.onSurface,
                    fontSize: 13.5, lineHeight: 1.55, fontWeight: 450,
                    boxShadow: isDoctor
                      ? `0 3px 12px ${C.primary}30`
                      : '0 2px 6px rgba(0,0,0,0.06)',
                  }}>
                    {msg.content}
                  </div>
                  <span style={{ fontSize: 10, color: C.onSurfaceVariant, marginTop: 4, fontWeight: 500 }}>
                    {msg.time}
                  </span>
                </div>

                {/* Doctor avatar (right) */}
                {isDoctor && (
                  <div style={{
                    width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                    background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: C.onPrimaryContainer, marginBottom: 4,
                  }}>
                    AC
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator (subtle) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 4 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #005c55, #0f766e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: '#a3faef',
            }}>
              SO
            </div>
            <div style={{
              padding: '10px 16px', borderRadius: '4px 18px 18px 18px',
              background: C.surfaceVariant, display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: C.onSurfaceVariant,
                  animation: `typingDot 1.2s ease ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>

          <style>{`
            @keyframes typingDot {
              0%, 80%, 100% { transform: scale(1); opacity: 0.4; }
              40% { transform: scale(1.3); opacity: 1; }
            }
          `}</style>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Fixed Bottom: Action Bar + Input ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, background: '#fff',
        borderTop: `1px solid ${C.outlineVariant}`,
        boxShadow: '0 -3px 16px rgba(0,0,0,0.07)',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {/* Prescription / Notes active chips */}
        {(notes.diagnosis || hasActivePrescription) && (
          <div style={{
            display: 'flex', gap: 8, padding: '8px 14px 0', overflowX: 'auto',
            scrollbarWidth: 'none',
          }}>
            {notes.diagnosis && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                background: `${C.primary}12`, color: C.primary, whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                📋 Dx: {notes.diagnosis}
              </span>
            )}
            {hasActivePrescription && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                background: '#fef3c7', color: '#92400e', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                💊 {prescriptions.filter(p => p.drug.trim()).length} drug(s) prescribed
              </span>
            )}
          </div>
        )}

        {/* Rich action pills */}
        <div style={{ display: 'flex', gap: 8, padding: '10px 14px 8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              className="action-pill"
              style={{
                height: 34, paddingInline: 14, borderRadius: 20, flexShrink: 0,
                border: `1.5px solid ${C.outlineVariant}`, background: '#fff',
                color: C.onSurface, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'background 0.15s, border-color 0.15s',
                position: 'relative',
              }}
            >
              <span>{a.icon}</span> {a.label}
              {a.badge && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  minWidth: 16, height: 16, borderRadius: 8,
                  background: C.primary, color: '#fff',
                  fontSize: 9, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  paddingInline: 3,
                }}>
                  {a.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '0 12px 14px',
        }}>
          {/* Plus */}
          <button style={{
            width: 38, height: 38, borderRadius: 12, border: `1.5px solid ${C.outlineVariant}`,
            background: 'transparent', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg translate="no" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.onSurfaceVariant} strokeWidth="2.3" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>

          {/* Text input */}
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Type your response…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              style={{
                width: '100%', height: 42, padding: '0 14px',
                borderRadius: 12, border: `2px solid ${C.outlineVariant}`,
                background: C.surfaceContainerLow,
                fontSize: 14, color: C.onSurface, outline: 'none',
                boxSizing: 'border-box', fontFamily: 'inherit', fontWeight: 450,
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = C.primary}
              onBlur={e => e.target.style.borderColor = C.outlineVariant}
            />
          </div>

          {/* Send */}
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            style={{
              width: 42, height: 42, borderRadius: 12, border: 'none',
              background: input.trim()
                ? `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`
                : C.outlineVariant,
              cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: input.trim() ? `0 3px 12px ${C.primary}40` : 'none',
              transition: 'all 0.2s', flexShrink: 0,
            }}
          >
            <svg translate="no" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>



      {/* ── Modals ── */}
      {showNotesModal && (
        <NotesModal
          notes={notes}
          setNotes={setNotes}
          onIssuePass={() => { setShowNotesModal(false); issuePatientPass(); }}
          onSaveDraft={() => setShowNotesModal(false)}
          onClose={() => setShowNotesModal(false)}
        />
      )}

      {showPrescribeModal && (
        <PrescribeModal
          prescriptions={prescriptions}
          setPrescriptions={setPrescriptions}
          onSave={() => setShowPrescribeModal(false)}
          onClose={() => setShowPrescribeModal(false)}
        />
      )}

      {showEndModal && (
        <EndConsultModal
          elapsedTime={elapsedTime}
          messageCount={messages.length}
          formatTime={formatTime}
          onIssuePass={() => { setShowEndModal(false); issuePatientPass(); }}
          onEndWithout={() => navigate('/doctor-portal')}
          onCancel={() => setShowEndModal(false)}
        />
      )}
    </div>
  );
}




