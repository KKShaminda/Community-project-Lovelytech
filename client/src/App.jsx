import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { HomePage } from './pages/home/HomePage'
import { AboutUs } from './pages/home/AboutUs'
import { ServicesPage } from './pages/home/ServicesPage'
import { SigninPage } from './pages/login/SigninPage'
import { UserDashboard } from './pages/dashboard/UserDashboard'
import { AdminDashboard } from './pages/dashboard/AdminDashboard'
import { ReceptionistDashboard } from './pages/dashboard/ReceptionistDashboard'

function App() {
  return (
    <>
      <Router>
        <Routes>

          {/* Home Page */}
          <Route path="/" element={<HomePage />} />

          {/* About Us Page */}
          <Route path="/about-us" element={<AboutUs />} />

          {/* Services Page */}
          <Route path="/services" element={<ServicesPage />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<SigninPage />} />

          {/* Role-based Dashboard Routes */}
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
        
        </Routes>
      </Router>
    </>
  )
}

export default App
