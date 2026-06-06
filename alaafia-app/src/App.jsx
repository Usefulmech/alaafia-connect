import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

// Pages
import Onboarding from './pages/Onboarding.jsx'
import Home from './pages/Home.jsx'
import SymptomIntake from './pages/SymptomIntake.jsx'
import CarePathway from './pages/CarePathway.jsx'
import Consultation from './pages/Consultation.jsx'
import PatientPass from './pages/PatientPass.jsx'
import Facilities from './pages/Facilities.jsx'
import FacilityDetails from './pages/FacilityDetails.jsx'
import History from './pages/History.jsx'
import DoctorOnboarding from './pages/DoctorOnboarding.jsx'
import DoctorPortal from './pages/DoctorPortal.jsx'
import DoctorChat from './pages/DoctorChat.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default → Onboarding wizard */}
        <Route path="/" element={<Onboarding />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Patient routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/assess" element={<SymptomIntake />} />
        <Route path="/symptom-intake" element={<SymptomIntake />} />
        <Route path="/care-pathway" element={<CarePathway />} />
        <Route path="/consultation" element={<Consultation />} />
        <Route path="/patient-pass" element={<PatientPass />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/facilities/:id" element={<FacilityDetails />} />
        <Route path="/history" element={<History />} />

        {/* Doctor routes */}
        <Route path="/doctor-onboarding" element={<DoctorOnboarding />} />
        <Route path="/doctor-portal" element={<DoctorPortal />} />
        <Route path="/doctor-chat" element={<DoctorChat />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

