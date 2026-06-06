import { useState, useRef } from 'react';
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

/* ─── Data ─────────────────────────────────────────────────── */
const SPECIALTIES = [
  'General Practice / Family Medicine',
  'Internal Medicine',
  'Paediatrics / Paediatric Surgery',
  'Obstetrics & Gynaecology',
  'General Surgery',
  'Orthopaedics & Traumatology',
  'Ophthalmology',
  'ENT (Ear, Nose & Throat)',
  'Dermatology & Venereology',
  'Psychiatry & Mental Health',
  'Cardiology',
  'Neurology / Neurosurgery',
  'Radiology & Imaging',
  'Anaesthesiology & Critical Care',
  'Emergency & Trauma Medicine',
  'Urology',
  'Oncology',
  'Endocrinology & Diabetes',
  'Gastroenterology & Hepatology',
  'Pulmonology / Chest Medicine',
  'Nephrology',
  'Rheumatology',
  'Infectious Disease & Tropical Medicine',
  'Haematology & Blood Transfusion',
  'Pathology & Laboratory Medicine',
  'Community Health / Public Health',
  'Dentistry / Oral & Maxillofacial Surgery',
  'Physiotherapy & Rehabilitation',
  'Clinical Pharmacy',
  'Advanced Practice Nursing',
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* ─── Shared Styles ─────────────────────────────────────────── */
const inputBase = {
  width: '100%',
  height: 56,
  padding: '0 16px',
  background: '#fff',
  border: `2px solid ${C.outlineVariant}`,
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 500,
  color: C.onSurface,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  fontFamily: 'inherit',
};

/* ─── Field Wrapper ─────────────────────────────────────────── */
function Field({ label, required, error, hint, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 13, fontWeight: 600, color: C.onSurfaceVariant, marginBottom: 7,
      }}>
        {label}
        {required && <span style={{ color: C.error }}>*</span>}
        {hint && (
          <span
            title={hint}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 16, height: 16, borderRadius: '50%', fontSize: 10, fontWeight: 700,
              background: C.surfaceVariant, color: C.primary, cursor: 'help', flexShrink: 0,
            }}
          >ⓘ</span>
        )}
      </label>
      {children}
      {error && (
        <p style={{ color: C.error, fontSize: 12, marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

/* ─── Success Screen ────────────────────────────────────────── */
function SuccessScreen({ navigate }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: C.bg,
      fontFamily: 'system-ui,-apple-system,sans-serif', padding: '0 32px',
      textAlign: 'center',
    }}>
      <style>{`
        @keyframes scaleIn {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes drawCheck {
          from { stroke-dashoffset: 60; }
          to   { stroke-dashoffset: 0; }
        }
        .success-circle {
          animation: scaleIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .success-check {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: drawCheck 0.4s ease 0.45s forwards;
        }
        @keyframes fadeUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        .fade-up { animation: fadeUp 0.5s ease 0.7s both; }
        .fade-up-2 { animation: fadeUp 0.5s ease 0.9s both; }
        .fade-up-3 { animation: fadeUp 0.5s ease 1.05s both; }
      `}</style>

      <div className="success-circle" style={{
        width: 96, height: 96, borderRadius: '50%',
        background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 8px 32px ${C.primary}55`, marginBottom: 28,
      }}>
        <svg translate="no" width="48" height="48" viewBox="0 0 24 24" fill="none">
          <polyline
            className="success-check"
            points="5,12 10,17 19,7"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="fade-up" style={{ fontSize: 26, fontWeight: 800, color: C.onSurface, margin: '0 0 12px', letterSpacing: '-0.4px' }}>
        Application Submitted!
      </h1>
      <p className="fade-up-2" style={{ fontSize: 15, color: C.onSurfaceVariant, lineHeight: 1.6, maxWidth: 320, margin: '0 0 36px' }}>
        Our team will review your credentials within <strong>24–48 hours</strong>. You'll receive an email confirmation shortly.
      </p>

      <div className="fade-up-3" style={{
        background: C.surfaceContainerLow, borderRadius: 16, padding: '16px 20px',
        marginBottom: 32, width: '100%', maxWidth: 320, boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ fontSize: 20 }}>📋</span>
        </div>
        <div style={{ textAlign: 'left' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.onSurface, margin: '0 0 2px' }}>What's next?</p>
          <p style={{ fontSize: 12, color: C.onSurfaceVariant, margin: 0, lineHeight: 1.5 }}>
            Check your email inbox for your verification reference.
          </p>
        </div>
      </div>

      <button
        className="fade-up-3"
        onClick={() => navigate('/doctor-portal')}
        style={{
          width: '100%', maxWidth: 320, height: 52, borderRadius: 14,
          border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 700,
          background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
          color: '#fff', boxShadow: `0 4px 16px ${C.primary}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        Go to Portal
        <svg translate="no" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>
  );
}

/* ─── Step 1: Personal Information ─────────────────────────── */
function Step1({ formData, update, errors }) {
  const [focused, setFocused] = useState('');

  const inp = (field) => ({
    ...inputBase,
    borderColor: errors[field] ? C.error : focused === field ? C.primary : C.outlineVariant,
    boxShadow: focused === field ? `0 0 0 3px ${C.primary}22` : 'none',
  });

  return (
    <div>
      {/* Full Name */}
      <Field label="Full Name" required error={errors.fullName}>
        <input
          type="text"
          placeholder="e.g. Dr. Adeoti Clinton"
          value={formData.fullName}
          onChange={e => update('fullName', e.target.value)}
          onFocus={() => setFocused('fullName')}
          onBlur={() => setFocused('')}
          style={inp('fullName')}
        />
      </Field>

      {/* Email */}
      <Field label="Email Address" required error={errors.email}>
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: focused === 'email' ? C.primary : C.onSurfaceVariant,
            transition: 'color 0.2s', pointerEvents: 'none',
          }}>
            <svg translate="no" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M22 7l-10 7L2 7"/>
            </svg>
          </div>
          <input
            type="email"
            placeholder="doctor@example.com"
            value={formData.email}
            onChange={e => update('email', e.target.value)}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused('')}
            style={{ ...inp('email'), paddingLeft: 44 }}
          />
        </div>
      </Field>

      {/* Phone */}
      <Field label="Phone Number" required error={errors.phone}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            ...inputBase, width: 80, flexShrink: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 14, fontWeight: 700, color: C.onSurface,
            background: C.surfaceContainerLow, cursor: 'default',
          }}>
            🇳🇬 +234
          </div>
          <input
            type="tel"
            placeholder="8012345678"
            value={formData.phone}
            onChange={e => update('phone', e.target.value)}
            onFocus={() => setFocused('phone')}
            onBlur={() => setFocused('')}
            style={{ ...inp('phone'), flex: 1, width: 'auto' }}
          />
        </div>
      </Field>

      {/* NIN */}
      <Field
        label="National Identification Number (NIN)"
        required
        error={errors.nin}
        hint="Your NIN is required for NIMC identity verification"
      >
        <input
          type="number"
          placeholder="Enter 11-digit NIN"
          value={formData.nin}
          onChange={e => update('nin', e.target.value.slice(0, 11))}
          onFocus={() => setFocused('nin')}
          onBlur={() => setFocused('')}
          style={inp('nin')}
        />
      </Field>

      {/* Date of Birth */}
      <Field label="Date of Birth" required error={errors.dob}>
        <input
          type="date"
          value={formData.dob}
          onChange={e => update('dob', e.target.value)}
          onFocus={() => setFocused('dob')}
          onBlur={() => setFocused('')}
          style={inp('dob')}
        />
      </Field>

      {/* Gender */}
      <Field label="Gender" required error={errors.gender}>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Male', 'Female', 'Non-binary'].map(g => (
            <button
              key={g}
              type="button"
              onClick={() => update('gender', g)}
              style={{
                flex: 1, height: 48, borderRadius: 12, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.18s',
                border: formData.gender === g ? `2px solid ${C.primary}` : `2px solid ${C.outlineVariant}`,
                background: formData.gender === g ? `${C.primary}12` : '#fff',
                color: formData.gender === g ? C.primary : C.onSurfaceVariant,
                transform: formData.gender === g ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {g === 'Male' ? '♂ ' : g === 'Female' ? '♀ ' : '⚧ '}{g}
            </button>
          ))}
        </div>
        {errors.gender && (
          <p style={{ color: C.error, fontSize: 12, marginTop: 5 }}>⚠ {errors.gender}</p>
        )}
      </Field>
    </div>
  );
}

/* ─── Step 2: Professional Details ─────────────────────────── */
function Step2({ formData, update, errors, toggleDay }) {
  const [focused, setFocused] = useState('');

  const inp = (field) => ({
    ...inputBase,
    borderColor: errors[field] ? C.error : focused === field ? C.primary : C.outlineVariant,
    boxShadow: focused === field ? `0 0 0 3px ${C.primary}22` : 'none',
  });

  return (
    <div>
      {/* MDCN Number */}
      <Field
        label="MDCN Registration Number"
        required
        error={errors.mdcnNumber}
        hint="Medical and Dental Council of Nigeria registration"
      >
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            fontSize: 12, fontWeight: 700, color: C.primary, pointerEvents: 'none',
            background: `${C.primary}12`, padding: '3px 8px', borderRadius: 6,
          }}>
            MDCN #
          </div>
          <input
            type="text"
            placeholder="e.g. 4567"
            value={formData.mdcnNumber}
            onChange={e => update('mdcnNumber', e.target.value)}
            onFocus={() => setFocused('mdcnNumber')}
            onBlur={() => setFocused('')}
            style={{ ...inp('mdcnNumber'), paddingLeft: 80 }}
          />
        </div>
      </Field>

      {/* Specialty */}
      <Field label="Medical Specialty" required error={errors.specialty}>
        <div style={{ position: 'relative' }}>
          <select
            value={formData.specialty}
            onChange={e => update('specialty', e.target.value)}
            onFocus={() => setFocused('specialty')}
            onBlur={() => setFocused('')}
            style={{
              ...inp('specialty'),
              appearance: 'none', WebkitAppearance: 'none',
              paddingRight: 40, cursor: 'pointer',
              color: formData.specialty ? C.onSurface : '#9ca3af',
            }}
          >
            <option value="">Select your specialty…</option>
            {SPECIALTIES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none', color: C.onSurfaceVariant,
          }}>
            <svg translate="no" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
        </div>
      </Field>

      {/* Sub-specialty */}
      <Field label="Sub-specialty" error={errors.subSpecialty}>
        <input
          type="text"
          placeholder="e.g. Interventional Cardiology (optional)"
          value={formData.subSpecialty}
          onChange={e => update('subSpecialty', e.target.value)}
          onFocus={() => setFocused('subSpecialty')}
          onBlur={() => setFocused('')}
          style={inp('subSpecialty')}
        />
      </Field>

      {/* Years of Experience */}
      <Field label="Years of Experience" error={errors.yearsExp}>
        <input
          type="number"
          min="0" max="50"
          placeholder="e.g. 8"
          value={formData.yearsExp}
          onChange={e => update('yearsExp', e.target.value)}
          onFocus={() => setFocused('yearsExp')}
          onBlur={() => setFocused('')}
          style={inp('yearsExp')}
        />
      </Field>

      {/* Hospital / Clinic */}
      <Field label="Current Hospital / Clinic Affiliation" required error={errors.hospital}>
        <input
          type="text"
          placeholder="e.g. Lagos University Teaching Hospital"
          value={formData.hospital}
          onChange={e => update('hospital', e.target.value)}
          onFocus={() => setFocused('hospital')}
          onBlur={() => setFocused('')}
          style={inp('hospital')}
        />
      </Field>

      {/* Hospital Address */}
      <Field label="Hospital Address" error={errors.hospitalAddress}>
        <textarea
          rows={2}
          placeholder="Full address of your primary hospital or clinic"
          value={formData.hospitalAddress}
          onChange={e => update('hospitalAddress', e.target.value)}
          onFocus={() => setFocused('hospitalAddress')}
          onBlur={() => setFocused('')}
          style={{
            ...inputBase, height: 'auto', padding: '14px 16px',
            resize: 'none', lineHeight: 1.55,
            borderColor: focused === 'hospitalAddress' ? C.primary : C.outlineVariant,
            boxShadow: focused === 'hospitalAddress' ? `0 0 0 3px ${C.primary}22` : 'none',
          }}
        />
      </Field>

      {/* Consultation Fee */}
      <Field label="Consultation Fee" hint="The consultation fee is fixed across the platform">
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            fontSize: 15, fontWeight: 700, color: C.primary, pointerEvents: 'none',
          }}>₦</div>
          <input
            type="text"
            value="1,000"
            disabled
            style={{ 
              ...inputBase, 
              paddingLeft: 36, 
              background: C.surfaceContainerLow, 
              color: C.onSurfaceVariant, 
              cursor: 'not-allowed', 
              borderColor: C.outlineVariant 
            }}
          />
        </div>
      </Field>

      {/* Available Days */}
      <Field label="Available Days" error={errors.availableDays}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DAYS.map(day => {
            const active = formData.availableDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                style={{
                  height: 40, minWidth: 52, paddingInline: 12, borderRadius: 20,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.18s',
                  border: active ? `2px solid ${C.primary}` : `2px solid ${C.outlineVariant}`,
                  background: active ? C.primary : '#fff',
                  color: active ? '#fff' : C.onSurfaceVariant,
                  transform: active ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: active ? `0 3px 10px ${C.primary}33` : 'none',
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </Field>

      {/* Available Hours */}
      <Field label="Available Hours">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: C.onSurfaceVariant, margin: '0 0 4px', fontWeight: 600 }}>FROM</p>
            <input
              type="time"
              value={formData.availableFrom}
              onChange={e => update('availableFrom', e.target.value)}
              onFocus={() => setFocused('from')}
              onBlur={() => setFocused('')}
              style={inp('from')}
            />
          </div>
          <div style={{ color: C.onSurfaceVariant, paddingTop: 20, fontSize: 18, fontWeight: 300 }}>→</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: C.onSurfaceVariant, margin: '0 0 4px', fontWeight: 600 }}>TO</p>
            <input
              type="time"
              value={formData.availableTo}
              onChange={e => update('availableTo', e.target.value)}
              onFocus={() => setFocused('to')}
              onBlur={() => setFocused('')}
              style={inp('to')}
            />
          </div>
        </div>
      </Field>
    </div>
  );
}

/* ─── Step 3: Documents & Agreement ────────────────────────── */
function Step3({ formData, update, errors, photoPreview, handlePhotoChange, photoRef, mdcnRef, ninRef }) {
  const renderFileUploadRow = ({ label, fileRef, fieldKey, accept }) => {
    const file = formData[fieldKey];
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', borderRadius: 14, marginBottom: 14,
        border: `2px dashed ${file ? C.primary : C.outlineVariant}`,
        background: file ? `${C.primary}06` : '#fff',
        cursor: 'pointer', transition: 'all 0.2s',
      }}
        onClick={() => fileRef.current?.click()}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: file ? `${C.primary}18` : C.surfaceContainerLow,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {file
            ? <span style={{ fontSize: 20 }}>✓</span>
            : <svg translate="no" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.onSurfaceVariant} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.onSurface, margin: '0 0 2px' }}>{label}</p>
          <p style={{
            fontSize: 12, color: file ? C.primary : C.onSurfaceVariant, margin: 0,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {file ? file.name : 'Tap to upload file (PDF, JPG, PNG)'}
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          onChange={e => {
            const f = e.target.files[0];
            if (f) update(fieldKey, f);
          }}
        />
      </div>
    );
  };

  return (
    <div>
      {/* Profile Photo */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.onSurfaceVariant, marginBottom: 14 }}>
          Profile Photo <span style={{ color: C.error }}>*</span>
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            onClick={() => photoRef.current?.click()}
            style={{
              width: 88, height: 88, borderRadius: '50%', flexShrink: 0,
              background: photoPreview ? 'transparent' : C.surfaceContainerLow,
              border: `3px dashed ${photoPreview ? C.primary : C.outlineVariant}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.2s',
              position: 'relative',
            }}
          >
            {photoPreview
              ? <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 2 }}>📷</div>
                  <p style={{ fontSize: 10, color: C.onSurfaceVariant, margin: 0, fontWeight: 600 }}>Upload</p>
                </div>
            }
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.onSurface, margin: '0 0 4px' }}>
              {photoPreview ? 'Photo selected ✓' : 'Upload profile photo'}
            </p>
            <p style={{ fontSize: 12, color: C.onSurfaceVariant, margin: '0 0 10px', lineHeight: 1.5 }}>
              Professional headshot. Patients see this when booking.
            </p>
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              style={{
                height: 34, paddingInline: 16, borderRadius: 10,
                border: `1.5px solid ${C.primary}`, background: 'transparent',
                color: C.primary, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {photoPreview ? 'Change Photo' : 'Choose File'}
            </button>
          </div>
        </div>
        <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
      </div>

      {/* Credential Uploads */}
      <p style={{ fontSize: 13, fontWeight: 600, color: C.onSurfaceVariant, marginBottom: 10 }}>
        Verification Documents <span style={{ color: C.error }}>*</span>
      </p>
      {renderFileUploadRow({ label: "MDCN Certificate", fileRef: mdcnRef, fieldKey: "mdcnCertFile", accept: ".pdf,image/*" })}
      {renderFileUploadRow({ label: "NIN Slip / Document", fileRef: ninRef, fieldKey: "ninSlipFile", accept: ".pdf,image/*" })}

      {/* Agreements */}
      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { field: 'agreeTerms', label: 'I agree to the ', link: 'Terms of Service', err: errors.agreeTerms },
          { field: 'agreePrivacy', label: 'I accept the ', link: 'Privacy Policy', err: errors.agreePrivacy },
        ].map(({ field, label, link, err }) => (
          <div key={field}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
              <div
                onClick={() => update(field, !formData[field])}
                style={{
                  width: 22, height: 22, borderRadius: 7, flexShrink: 0, marginTop: 1,
                  border: `2px solid ${formData[field] ? C.primary : C.outlineVariant}`,
                  background: formData[field] ? C.primary : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.18s', cursor: 'pointer',
                }}
              >
                {formData[field] && (
                  <svg translate="no" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 14, color: C.onSurfaceVariant, lineHeight: 1.55 }}>
                {label}
                <span style={{ color: C.primary, fontWeight: 600, textDecoration: 'underline' }}>{link}</span>
                {' '}and understand how Àlàáfíà Connect processes my information.
              </span>
            </label>
            {err && <p style={{ color: C.error, fontSize: 12, marginTop: 5, marginLeft: 34 }}>⚠ {err}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────── */
export default function DoctorOnboarding() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [animDir, setAnimDir] = useState('forward');
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', nin: '', dob: '', gender: '',
    mdcnNumber: '', specialty: '', subSpecialty: '', yearsExp: '', hospital: '', hospitalAddress: '',
    consultationFee: '', availableDays: [], availableFrom: '08:00', availableTo: '18:00',
    profilePhoto: null, mdcnCertFile: null, ninSlipFile: null,
    agreeTerms: false, agreePrivacy: false,
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const photoRef = useRef(null);
  const mdcnRef  = useRef(null);
  const ninRef   = useRef(null);

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const toggleDay = (day) => setFormData(prev => ({
    ...prev,
    availableDays: prev.availableDays.includes(day)
      ? prev.availableDays.filter(d => d !== day)
      : [...prev.availableDays, day],
  }));

  function validateStep1() {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Valid email required';
    if (!formData.phone.trim()) errs.phone = 'Phone number required';
    if (!/^\d{11}$/.test(formData.nin)) errs.nin = 'NIN must be exactly 11 digits';
    if (!formData.dob) errs.dob = 'Date of birth required';
    if (!formData.gender) errs.gender = 'Please select a gender';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep2() {
    const errs = {};
    if (!formData.mdcnNumber.trim()) errs.mdcnNumber = 'MDCN number required';
    if (!formData.specialty) errs.specialty = 'Please select a specialty';
    if (!formData.hospital.trim()) errs.hospital = 'Hospital affiliation required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function goNext() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setErrors({});
    setAnimDir('forward');
    setStep(s => s + 1);
  }

  function goBack() {
    setErrors({});
    setAnimDir('back');
    setStep(s => s - 1);
  }

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  async function handleSubmit() {
    const errs = {};
    if (!formData.agreeTerms) errs.agreeTerms = 'You must accept the Terms of Service';
    if (!formData.agreePrivacy) errs.agreePrivacy = 'You must accept the Privacy Policy';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    
    try {
      // Create first_name and last_name from fullName
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || 'Unknown';

      const res = await fetch(`${API_BASE_URL}/api/verification/nin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nin: formData.nin,
          first_name: firstName,
          last_name: lastName
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`NIN Verification Failed: ${errorData.detail || 'Invalid NIN'}`);
        return;
      }
      
      const verificationResult = await res.json();
      console.log('NIN Verification successful:', verificationResult);

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Failed to connect to verification service');
    }
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    update('profilePhoto', file);
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  const progressHeight = step === 1 ? '33%' : step === 2 ? '66%' : '100%';

  const stepTitles = ['Personal Information', 'Professional Details', 'Documents & Agreement'];

  if (submitted) return <SuccessScreen navigate={navigate} />;

  return (
    <div style={{
      background: C.bg, minHeight: '100vh',
      fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,sans-serif',
      display: 'flex', flexDirection: 'column',
      maxWidth: 480, margin: '0 auto',
    }}>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(52px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-52px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        .slide-forward { animation: slideInRight 0.32s cubic-bezier(0.25,0.46,0.45,0.94) both; }
        .slide-back    { animation: slideInLeft  0.32s cubic-bezier(0.25,0.46,0.45,0.94) both; }
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
      `}</style>

      {/* ── Sticky Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '14px 20px',
        background: '#fff', borderBottom: `1px solid ${C.outlineVariant}`,
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
      }}>
        <div style={{ width: 40 }}>
          {step > 1 && (
            <button
              onClick={goBack}
              style={{
                width: 36, height: 36, borderRadius: 10,
                border: `1.5px solid ${C.outlineVariant}`,
                background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg translate="no" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.onSurfaceVariant} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
          )}
        </div>

        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontStyle: 'italic', fontWeight: 800, fontSize: 17, color: C.primary, letterSpacing: '-0.3px' }}>
            Àlàáfíà Connect
          </span>
        </div>

        <div style={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: C.primary,
            background: `${C.primary}14`, borderRadius: 20, padding: '4px 10px',
          }}>
            {step}/3
          </span>
        </div>
      </div>

      {/* ── Body: Left progress strip + content ── */}
      <div style={{ display: 'flex', flex: 1 }}>

        {/* Vertical Progress Bar */}
        <div style={{ width: 4, background: C.outlineVariant, flexShrink: 0, position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%',
            height: progressHeight,
            background: `linear-gradient(to bottom, ${C.primary}, ${C.primaryContainer})`,
            transition: 'height 0.55s cubic-bezier(0.25,0.46,0.45,0.94)',
            borderRadius: '0 0 4px 4px',
          }} />
          {/* Step dots */}
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute',
              top: `calc(${33 * (i + 1)}% - 6px)`,
              left: '50%', transform: 'translateX(-50%)',
              width: 12, height: 12, borderRadius: '50%',
              background: step > i ? C.primary : C.outlineVariant,
              border: `2px solid ${step > i ? C.primary : C.outlineVariant}`,
              transition: 'background 0.4s',
              zIndex: 1,
            }} />
          ))}
        </div>

        {/* Scrollable Step Content */}
        <div style={{ flex: 1, overflowX: 'hidden' }}>
          <div
            key={step}
            className={animDir === 'forward' ? 'slide-forward' : 'slide-back'}
            style={{ padding: '24px 20px 120px' }}
          >
            {/* Step heading */}
            <div style={{ marginBottom: 26 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 13, fontWeight: 800, flexShrink: 0,
                }}>
                  {step}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.onSurfaceVariant }}>
                  Step {step} of 3
                </span>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: C.onSurface, margin: '0 0 6px', letterSpacing: '-0.3px' }}>
                {stepTitles[step - 1]}
              </h1>
              <p style={{ fontSize: 14, color: C.onSurfaceVariant, margin: 0, lineHeight: 1.55 }}>
                {step === 1 && "Let's start with your basic personal details."}
                {step === 2 && 'Tell us about your medical practice and availability.'}
                {step === 3 && 'Upload your credentials and read our policies.'}
              </p>
            </div>

            {step === 1 && (
              <Step1 formData={formData} update={update} errors={errors} />
            )}
            {step === 2 && (
              <Step2 formData={formData} update={update} errors={errors} toggleDay={toggleDay} />
            )}
            {step === 3 && (
              <Step3
                formData={formData}
                update={update}
                errors={errors}
                photoPreview={photoPreview}
                handlePhotoChange={handlePhotoChange}
                photoRef={photoRef}
                mdcnRef={mdcnRef}
                ninRef={ninRef}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Fixed Bottom CTA ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, background: '#fff',
        borderTop: `1px solid ${C.outlineVariant}`,
        padding: '14px 20px', boxSizing: 'border-box',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
      }}>
        <button
          onClick={step === 3 ? handleSubmit : goNext}
          style={{
            width: '100%', height: 52, borderRadius: 14, border: 'none',
            background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
            color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 4px 18px ${C.primary}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
        >
          {step === 3 ? (
            <>
              <svg translate="no" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Submit Application
            </>
          ) : (
            <>
              Continue
              <svg translate="no" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}



