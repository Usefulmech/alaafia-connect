import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PrimaryHeader from '../components/PrimaryHeader.jsx'
import BottomNav from '../components/BottomNav.jsx'

const LANG_NAMES = { EN: 'English', YO: 'Yorùbá', HA: 'Hausa', English: 'English', Yoruba: 'Yorùbá', Hausa: 'Hausa', Igbo: 'Igbo', Pidgin: 'Pidgin' }

const MEDICATION_HISTORY = [
  {
    medicine: 'Amoxicillin 500mg',
    status: 'Verified',
    date: 'May 2, 2026',
    note: 'Prescribed for bacterial throat infection',
    source: 'Clinic RX AL-0345',
  },
  {
    medicine: 'Lisinopril 10mg',
    status: 'Verified',
    date: 'Apr 16, 2026',
    note: 'Hypertension follow-up prescription',
    source: 'Family Health Centre',
  },
]

// Consultation history will be pulled dynamically from localStorage

export default function History() {
  const navigate = useNavigate()
  const selectedLang = localStorage.getItem('selectedLanguage') || ''
  const patientName = localStorage.getItem('patientName') || 'Patient'

  const hasActiveSymptoms = !!localStorage.getItem('symptoms')
  const hasCompletedTriage = !!localStorage.getItem('triageResult')
  const hasActiveConsultation = hasActiveSymptoms && !hasCompletedTriage

  const [consultations, setConsultations] = useState([])

  useEffect(() => {
    // Dynamically build consultation history from active local session data
    const historyList = []
    const triageRes = localStorage.getItem('triageResult')
    const consultSummary = localStorage.getItem('consultationSummary')
    
    if (triageRes) {
      historyList.push({
        title: 'AI Symptom Triage',
        facility: 'Àlàáfíà AI',
        date: new Date().toLocaleDateString('en-NG'),
        outcome: triageRes.length > 60 ? triageRes.substring(0, 60) + '...' : triageRes,
      })
    }
    
    if (consultSummary) {
      historyList.push({
        title: 'Teleconsultation',
        facility: localStorage.getItem('doctorName') || 'Dr. Adeoti Clinton',
        date: localStorage.getItem('consultationStart') || new Date().toLocaleDateString('en-NG'),
        outcome: 'Completed teleconsultation. Review Patient Pass for details.',
      })
    }

    setConsultations(historyList.reverse())
  }, [])

  useEffect(() => {
    if (!selectedLang) {
      navigate('/', { replace: true })
    }
  }, [selectedLang, navigate])

  return (
    <div className="bg-background text-on-surface page-shell">
      <PrimaryHeader
        title="Àlàáfíà Connect"
        subtitle="HEALTH RECORDS"
        showBack
        onBack={() => navigate('/home')}
      />

      <main className="pt-20 pb-6 page-content flex flex-col gap-6">
        <div className="rounded-xl border border-outline-variant bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }} translate="no">person</span>
            </div>
            <div>
              <p className="font-bold text-on-surface text-sm">Welcome back, {patientName}</p>
              <p className="text-xs text-on-surface-variant">
                {selectedLang ? `Language: ${LANG_NAMES[selectedLang]}` : ''}
              </p>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            This screen shows your verified drug history and recent consultation activity.
          </p>
        </div>

        {hasActiveConsultation && (
          <section className="flex flex-col gap-3">
            <div>
              <h2 className="font-bold text-on-surface" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 18 }}>
                In Progress
              </h2>
            </div>
            <div 
              onClick={() => navigate('/symptom-intake')}
              className="rounded-xl border border-secondary/30 bg-secondary/5 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="font-bold text-secondary text-sm">AI Symptom Assessment</p>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">Tap to resume your ongoing consultation</p>
              </div>
              <span className="material-symbols-outlined text-secondary text-[24px]">chevron_right</span>
            </div>
          </section>
        )}

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="font-bold text-on-surface" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 18 }}>
              Verified Medication History
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Prescriptions that have been recorded and verified for this patient.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {MEDICATION_HISTORY.map((item, index) => (
              <div key={index} className="rounded-xl border border-outline-variant bg-white p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-on-surface text-sm">{item.medicine}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{item.source}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-3 leading-relaxed">{item.note}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-3" style={{ fontFamily: "'Noto Sans','Satoshi', sans-serif" }}>
                  {item.date}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="font-bold text-on-surface" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif", fontSize: 18 }}>
              Recent Consultations
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              The latest visits recorded for this patient.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {consultations.length > 0 ? consultations.map((item, index) => (
              <div key={index} className="rounded-xl border border-outline-variant bg-white p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-on-surface text-sm">{item.title}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{item.facility}</p>
                  </div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{item.date}</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-3 leading-relaxed">{item.outcome}</p>
              </div>
            )) : (
              <div className="rounded-xl border border-outline-variant border-dashed bg-surface-container-lowest p-6 text-center">
                <p className="text-sm text-on-surface-variant">No recent consultations recorded.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNav active="/history" />
    </div>
  )
}
