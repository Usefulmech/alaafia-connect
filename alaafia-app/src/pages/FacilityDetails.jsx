import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BottomNav from '../components/BottomNav.jsx'
import PrimaryHeader from '../components/PrimaryHeader.jsx'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function FacilityDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [facility, setFacility] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchFacility() {
      if (!id) return
      setIsLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE_URL}/api/facilities/${id}`)
        if (!res.ok) throw new Error(`Server returned ${res.status}`)
        const data = await res.json()
        setFacility(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load facility')
      } finally {
        setIsLoading(false)
      }
    }
    fetchFacility()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col page-shell">
        <PrimaryHeader title="Àlàáfíà Connect" subtitle="FACILITY DETAILS" showBack onBack={() => navigate('/facilities')} />
        <main className="flex-1 pt-20 pb-6 page-content">
          <div className="text-on-surface-variant text-sm font-medium">Loading facility details…</div>
        </main>
        <BottomNav active="/facilities" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col page-shell">
        <PrimaryHeader title="Àlàáfíà Connect" subtitle="FACILITY DETAILS" showBack onBack={() => navigate('/facilities')} />
        <main className="flex-1 pt-20 pb-6 page-content">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900 text-sm">
            <p className="font-semibold mb-2 text-base">Facility load error</p>
            <p className="mb-4">{error}</p>
            <button
              onClick={() => navigate('/facilities')}
              className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:opacity-90 active:scale-95 transition-all shadow"
            >
              Back to Facilities
            </button>
          </div>
        </main>
        <BottomNav active="/facilities" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col page-shell">
      <PrimaryHeader
        title="Àlàáfíà Connect"
        subtitle="FACILITY DETAILS"
        showBack
        onBack={() => navigate('/facilities')}
      />

      <main className="flex-1 pt-20 pb-6 page-content">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow border border-outline-variant/30 slide-up">
          <h1 className="text-2xl font-bold mb-1 text-on-surface" style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans','Satoshi', sans-serif" }}>{facility.name}</h1>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">{facility.facility_type} · {facility.public_private}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Address</p>
              <p className="text-sm text-on-surface">{facility.address}</p>
              <p className="text-sm font-semibold text-on-surface mt-2">{facility.city}, {facility.state}</p>
            </div>
            <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Contacts</p>
              <div className="space-y-1 text-sm text-on-surface">
                {facility.phone && <p><strong>Phone:</strong> {facility.phone}</p>}
                {facility.email && <p><strong>Email:</strong> {facility.email}</p>}
                {facility.website && (
                  <p>
                    <strong>Website:</strong>{' '}
                    <a href={facility.website} target="_blank" rel="noreferrer" className="text-primary underline font-medium">
                      Visit Website
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-outline-variant bg-surface-container-low p-4">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Services</p>
            <div className="flex flex-wrap gap-1.5">
              {facility.services?.map((service) => (
                <span key={service} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary font-semibold">
                  {service}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-outline-variant bg-surface-container-low p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Open 24/7</p>
              <p className="text-sm text-on-surface font-semibold">{facility.open_24_7 ? 'Yes — Open Always' : 'No — Limited Hours'}</p>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${facility.open_24_7 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {facility.open_24_7 ? '?' : '!'}
            </div>
          </div>
        </div>
      </main>

      <BottomNav active="/facilities" />
    </div>
  )
}


