import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { HomePage } from './pages/home/HomePage'
import { SigninPage } from './pages/login/SigninPage'
import { SignupPage } from './pages/login/SignupPage'
import { UserDashboard } from './pages/dashboard/UserDashboard'
import { AdminDashboard } from './pages/dashboard/AdminDashboard'
import { InventoryManagementPage } from './pages/admin/InventoryManagementPage'
import { RepairOrdersPage } from './pages/admin/RepairOrdersPage'
import { SalesLogPage } from './pages/admin/SalesLogPage'
import { CustomersPage } from './pages/admin/CustomersPage'
import { ReceptionistDashboard } from './pages/dashboard/ReceptionistDashboard'
import { Products } from './pages/products/Products'
import { RepairPage } from './pages/repair/RepairPage'
import { BookRepairPage } from './pages/repair/BookRepairPage'
import { RepairHistoryPage } from './pages/repair/RepairHistoryPage'
import { RepairTrackingPage } from './pages/repair/RepairTrackingPage'
import { ProtectedRoute } from './components/common/ProtectedRoute'

function App() {
  return (
    <>
      <Router>
        <Routes>

          {/* Public Pages */}
          <Route path="/" element={<HomePage />} />

          <Route path="/products" element={<Products />} />

          {/* Repair Services Pages */}
          <Route path="/repair" element={<RepairPage />} />
          <Route path="/repair/book" element={<BookRepairPage />} />
          <Route path="/repair/history" element={<RepairHistoryPage />} />
          <Route path="/repair/track" element={<RepairTrackingPage />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<SigninPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* User Dashboard */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute allowedRoles={['User', 'admin', 'Receptionist']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Receptionist Dashboard & Management Routes */}
          <Route
            path="/receptionist/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Receptionist', 'admin']}>
                <ReceptionistDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receptionist/inventory"
            element={
              <ProtectedRoute allowedRoles={['Receptionist', 'admin']}>
                <InventoryManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receptionist/repair-orders"
            element={
              <ProtectedRoute allowedRoles={['Receptionist', 'admin']}>
                <RepairOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receptionist/sales-log"
            element={
              <ProtectedRoute allowedRoles={['Receptionist', 'admin']}>
                <SalesLogPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Management Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <InventoryManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/repair-orders"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <RepairOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sales-log"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SalesLogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CustomersPage />
              </ProtectedRoute>
            }
          />

        </Routes>
      </Router>
    </>
  )
}

export default App
