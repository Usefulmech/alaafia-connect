import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import BottomNav from '../components/BottomNav.jsx'
import PrimaryHeader from '../components/PrimaryHeader.jsx'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');

// ─── Custom Premium Marker Icons ───────────────────────────────────────────────
const userIcon = L.divIcon({
  html: `<div class="relative flex items-center justify-center w-5 h-5">
    <div class="absolute w-5 h-5 bg-blue-500 rounded-full opacity-45 animate-ping"></div>
    <div class="w-4.5 h-4.5 bg-blue-600 rounded-full border-2 border-white shadow-md flex items-center justify-center">
      <div class="w-1.5 h-1.5 bg-blue-200 rounded-full"></div>
    </div>
  </div>`,
  className: 'custom-user-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

const facilityIcon = L.divIcon({
  html: `<div class="w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center bg-teal-700 text-teal-100 hover:bg-teal-600 transition-colors">
    <svg translate="no" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  </div>`,
  className: 'custom-facility-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
})

// ─── Map Controller (Recenter Map Programmatically) ────────────────────────────
function MapController({ center, zoom, viewMode }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom())
    }
  }, [center, zoom, map])

  useEffect(() => {
    // Add a ResizeObserver to guarantee the map resizes correctly
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })
    
    const container = map.getContainer()
    if (container) {
      resizeObserver.observe(container)
    }

    // Fallback timer for viewMode transitions
    let timer;
    if (viewMode === 'map') {
      timer = setTimeout(() => {
        map.invalidateSize()
      }, 150)
    }

    return () => {
      resizeObserver.disconnect()
      if (timer) clearTimeout(timer)
    }
  }, [viewMode, map])

  return null
}

// ─── Distance Calculator (Haversine Formula) ──────────────────────────────────
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in km
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}

export default function Facilities() {
  const navigate = useNavigate()

  // State variables
  const [facilities, setFacilities] = useState([])
  const [filteredFacilities, setFilteredFacilities] = useState([])
  const [query, setQuery] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [radiusFilter, setRadiusFilter] = useState('25') // '5' | '10' | '25' | 'all' (applied automatically)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Geolocation states
  const [userLocation, setUserLocation] = useState(null) // [lat, lng]
  const [mapCenter, setMapCenter] = useState([6.5244, 3.3792]) // Default: Lagos
  const [mapZoom, setMapZoom] = useState(11)
  const [isLocating, setIsLocating] = useState(false)

  // Navigation Routing States
  const [routeGeometry, setRouteGeometry] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null) // { distance, duration }
  const [activeRouteFacility, setActiveRouteFacility] = useState(null)

  // Mobile drawer toggle (removed in favor of global viewMode toggle)
  const [viewMode, setViewMode] = useState('map') // 'map' | 'list'

  // Fetch facilities list from backend
  useEffect(() => {
    async function fetchFacilities() {
      setIsLoading(true)
      setError('')
      try {
        const params = new URLSearchParams()
        if (query) params.set('query', query)
        if (stateFilter) params.set('state', stateFilter)
        if (typeFilter) params.set('type', typeFilter)

        const response = await fetch(`${API_BASE_URL}/api/facilities/?${params.toString()}`)
        if (!response.ok) throw new Error(`Server returned ${response.status}`)
        const data = await response.json()
        setFacilities(data.facilities || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to fetch facilities')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFacilities()
  }, [query, stateFilter, typeFilter])

  // Geolocate user on mount
  useEffect(() => {
    geolocateUser(false) // Quiet geolocation on mount
  }, [])

  // Geofence filter & Distance sort
  useEffect(() => {
    let result = [...facilities]

    // Calculate distances if userLocation is available
    if (userLocation) {
      result = result.map((f) => {
        if (f.latitude && f.longitude) {
          const dist = getDistance(userLocation[0], userLocation[1], f.latitude, f.longitude)
          return { ...f, distance: dist }
        }
        return f
      })

      // Sort by distance (closest first)
      result.sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance
        }
        return 0
      })

      // Geofencing Radius Filter
      if (radiusFilter !== 'all') {
        const maxDist = parseFloat(radiusFilter)
        result = result.filter((f) => f.distance !== undefined && f.distance <= maxDist)
      }
    }

    setFilteredFacilities(result)
  }, [facilities, userLocation, radiusFilter])

  // Get user browser location
  function geolocateUser(interactive = true) {
    if (!navigator.geolocation) {
      if (interactive) alert('Geolocation is not supported by your browser.')
      return
    }

    if (interactive) setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setUserLocation([lat, lng])
        setMapCenter([lat, lng])
        setMapZoom(13)
        if (interactive) setIsLocating(false)
      },
      (err) => {
        console.warn('Geolocation failed:', err.message)
        if (interactive) {
          alert('Could not get your location. Please ensure location services are enabled.')
          setIsLocating(false)
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  // Draw driving route using free OSRM API
  async function getDirections(facility) {
    if (!userLocation) {
      alert('Please enable location services or geolocate yourself first.')
      geolocateUser(true)
      return
    }

    if (!facility.latitude || !facility.longitude) {
      alert('Facility coordinates not available.')
      return
    }

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${facility.longitude},${facility.latitude}?overview=full&geometries=geojson`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Could not calculate route')
      const data = await res.json()

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        const coordinates = route.geometry.coordinates // [lng, lat]
        const routePoints = coordinates.map((coord) => [coord[1], coord[0]]) // to [lat, lng]

        setRouteGeometry(routePoints)
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(1), // km
          duration: Math.round(route.duration / 60), // mins
        })
        setActiveRouteFacility(facility)

        // Center map to show route midpoint or fit bounds (approximate center)
        const midIdx = Math.floor(routePoints.length / 2)
        setMapCenter(routePoints[midIdx])
        setMapZoom(12)
        
        // Auto-switch to map view to display directions
        setViewMode('map')
      } else {
        alert('No route found to this facility.')
      }
    } catch (err) {
      alert('Error calculating routing: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  function clearRoute() {
    setRouteGeometry(null)
    setRouteInfo(null)
    setActiveRouteFacility(null)
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col page-shell">
      <PrimaryHeader
        title="Àlàáfíà Connect"
        subtitle="FACILITY FINDER"
        showBack
        onBack={() => navigate('/home')}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row relative h-[calc(100vh-122px)] lg:h-[calc(100vh-58px)]">

        {/* Floating View Mode Selector */}
        <div className="lg:hidden absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur border border-outline-variant/40 rounded-full p-1 shadow-md flex gap-1">
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-4.5 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 ${viewMode === 'map' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: viewMode === 'map' ? "'FILL' 1" : "'FILL' 0" }} translate="no">map</span>
            Map View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-4.5 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: viewMode === 'list' ? "'FILL' 1" : "'FILL' 0" }} translate="no">list</span>
            List View
          </button>
        </div>

        {/* ── PANEL A: Filters and Search Results ── */}
        <aside
          className={`flex-col bg-surface-container-lowest border-r border-outline-variant/30 flex-shrink-0 z-30 w-full h-full lg:w-[380px]
            ${viewMode === 'list' ? 'flex' : 'hidden lg:flex'}`}
        >
          {/* Filter Bar */}
          <div className="p-4 pt-16 lg:pt-4 border-b border-outline-variant/30 bg-surface-container-low flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-on-surface uppercase tracking-wider">Search Facilities</h2>
              <button
                onClick={() => geolocateUser(true)}
                disabled={isLocating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
              >
                <svg translate="no" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" className={isLocating ? 'animate-spin' : ''}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                {isLocating ? 'Locating...' : 'Near Me'}
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              <input
                type="text"
                placeholder="Search hospital, city, services..."
                className="w-full px-3.5 py-2.5 bg-white border border-outline-variant rounded-xl text-sm focus:border-primary outline-none transition-colors"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="State (e.g. Lagos)"
                  className="w-full px-3.5 py-2 bg-white border border-outline-variant rounded-xl text-xs focus:border-primary outline-none transition-colors"
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                />
                <select
                  className="w-full px-3 py-2 bg-white border border-outline-variant rounded-xl text-xs focus:border-primary outline-none transition-colors text-on-surface font-medium"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Health Centre">Health Centre</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <p className="text-sm text-on-surface-variant text-center py-6">Loading facilities…</p>
            ) : error ? (
              <div className="rounded-xl bg-red-50 p-4 border border-red-100 text-red-900 text-xs">{error}</div>
            ) : filteredFacilities.length === 0 ? (
              <p className="text-sm text-on-surface-variant text-center py-6">No facilities found. Try clearing filters.</p>
            ) : (
              filteredFacilities.map((facility) => {
                const isRoutingActive = activeRouteFacility?.id === facility.id
                return (
                  <div
                    key={facility.id}
                    className={`rounded-2xl border bg-surface-container-low p-4 shadow-sm transition-all hover:shadow-md cursor-pointer
                      ${isRoutingActive ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-outline-variant/40'}`}
                    onClick={() => {
                      if (facility.latitude && facility.longitude) {
                        setMapCenter([facility.latitude, facility.longitude])
                        setMapZoom(14)
                        setViewMode('map') // Automatically switch to map view when clicking a list item
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-on-surface text-sm">{facility.name}</h3>
                        <p className="text-xs text-on-surface-variant">{facility.facility_type} · {facility.public_private}</p>
                      </div>
                      {facility.distance !== undefined && (
                        <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800 flex-shrink-0">
                          {facility.distance.toFixed(1)} km away
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-on-surface-variant">{facility.address}</p>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {facility.services?.slice(0, 3).map((service) => (
                        <span key={service} className="rounded-full bg-surface-variant px-2 py-0.5 text-[9px] text-on-surface-variant font-medium">
                          {service}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-outline-variant/30 pt-3">
                      <Link
                        to={`/facilities/${facility.id}`}
                        className="text-xs font-bold text-primary underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View details
                      </Link>
                      {facility.latitude && facility.longitude && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (isRoutingActive) {
                              clearRoute()
                            } else {
                              getDirections(facility)
                            }
                          }}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm
                            ${isRoutingActive ? 'bg-error text-white' : 'bg-primary text-white'}`}
                        >
                          <svg translate="no" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            {isRoutingActive ? (
                              <path d="M18 6L6 18M6 6l12 12"></path>
                            ) : (
                              <path d="M3 11l19-9-9 19-2-8-8-2z"></path>
                            )}
                          </svg>
                          {isRoutingActive ? 'Clear Route' : 'Get Directions'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </aside>

        {/* ── PANEL B: Leaflet OpenStreetMap View ── */}
        <main className={`flex-1 h-full min-h-0 relative z-10 flex-col bg-outline-variant/10
          ${viewMode === 'map' ? 'flex' : 'hidden lg:flex'}`}
        >

          {/* Route Info Overlay Card */}
          {routeGeometry && routeInfo && activeRouteFacility && (
            <div className="absolute top-18 left-4 right-4 lg:left-6 lg:right-auto lg:w-96 z-[1000] bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 shadow-xl slide-up flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 flex-shrink-0">
                <svg translate="no" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M3 11l19-9-9 19-2-8-8-2z"></path>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-teal-800 uppercase tracking-wider mb-0.5">Active Driving Directions</h4>
                <p className="font-bold text-sm text-on-surface truncate">{activeRouteFacility.name}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-sm font-bold text-primary">{routeInfo.duration} mins</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                  <span className="text-sm font-medium text-on-surface-variant">{routeInfo.distance} km</span>
                </div>
              </div>
              <button
                onClick={clearRoute}
                className="p-1 rounded-full hover:bg-surface-variant flex-shrink-0 text-on-surface-variant"
                aria-label="Clear Directions"
              >
                <svg translate="no" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          )}

          {/* Leaflet MapContainer */}
          <div className="w-full h-full flex-grow relative overflow-hidden min-h-0">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Recenter Map dynamically */}
              <MapController center={mapCenter} zoom={mapZoom} viewMode={viewMode} />

              {/* User Location Pulsing Dot & Geofence Boundary */}
              {userLocation && (
                <>
                  <Marker position={userLocation} icon={userIcon}>
                    <Popup>
                      <div className="p-1 font-sans">
                        <p className="font-bold text-sm text-primary">Your Location</p>
                        <p className="text-xs text-on-surface-variant">Accurate to browser GPS coordinates.</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Geofencing Radius Circle visual indicator */}
                  {radiusFilter !== 'all' && (
                    <Circle
                      center={userLocation}
                      radius={parseFloat(radiusFilter) * 1000} // radius in meters
                      pathOptions={{
                        color: '#0f766e',
                        fillColor: '#0f766e',
                        fillOpacity: 0.05,
                        weight: 1.5,
                        dashArray: '4, 6',
                      }}
                    />
                  )}
                </>
              )}

              {/* Facility Pins */}
              {filteredFacilities.map((f) => {
                if (!f.latitude || !f.longitude) return null
                return (
                  <Marker
                    key={f.id}
                    position={[f.latitude, f.longitude]}
                    icon={facilityIcon}
                  >
                    <Popup>
                      <div className="p-2 font-sans w-52">
                        <h4 className="font-bold text-sm text-on-surface leading-tight mb-1">{f.name}</h4>
                        <p className="text-[10px] text-primary uppercase font-bold tracking-wider mb-2">
                          {f.facility_type} · {f.public_private}
                        </p>
                        {f.distance !== undefined && (
                          <p className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-100 rounded px-1.5 py-0.5 mb-2 inline-block">
                            {f.distance.toFixed(1)} km away
                          </p>
                        )}
                        <p className="text-xs text-on-surface-variant mb-3 leading-snug">{f.address}</p>

                        <div className="flex gap-2 border-t border-outline-variant/30 pt-2">
                          <Link
                             to={`/facilities/${f.id}`}
                            className="flex-1 text-center bg-surface-container hover:bg-surface-variant rounded py-1.5 text-xs font-bold text-on-surface transition-colors"
                          >
                            Details
                          </Link>
                          <button
                            onClick={() => getDirections(f)}
                            className="flex-1 text-center bg-primary hover:bg-primary/90 rounded py-1.5 text-xs font-bold text-white transition-colors"
                          >
                            Directions
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}

              {/* Directions Route Polyline */}
              {routeGeometry && (
                <Polyline
                  positions={routeGeometry}
                  pathOptions={{
                    color: '#0f766e',
                    weight: 5,
                    opacity: 0.8,
                    lineJoin: 'round',
                  }}
                />
              )}
            </MapContainer>
          </div>
        </main>
      </div>

      <BottomNav active="/facilities" />
    </div>
  )
}




