import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { HomePage } from './pages/home/HomePage'
import { SigninPage } from './pages/login/SigninPage'
import { SignupPage } from './pages/login/SignupPage'
import { UserDashboard } from './pages/dashboard/UserDashboard'
import { AdminDashboard } from './pages/dashboard/AdminDashboard'
import { ReceptionistDashboard } from './pages/dashboard/ReceptionistDashboard'
import { Products } from './pages/products/Products'
import { BookRepairPage } from './pages/repair/BookRepairPage'
import { RepairPage } from './pages/repair/RepairPage'

function App() {
  return (
    <>
      <Router>
        <Routes>

          {/* Public Pages */}
          <Route path="/" element={<p>Home Page</p>} />
          <Route path="/products" element={<Products />} />
          {/* Home Page */}
          <Route path="/" element={<HomePage />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<SigninPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Role-based Dashboard Routes */}
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />

            {/* Repair Routes */}
          <Route path="/repair" element={<RepairPage />} />
          <Route path="/repair/book" element={<BookRepairPage />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
