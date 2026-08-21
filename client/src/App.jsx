import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { HomePage } from './pages/home/HomePage'
import { AboutUs } from './pages/home/AboutUs'
import { ServicesPage } from './pages/home/ServicesPage'
import { ContactUsPage } from './pages/home/ContactUsPage'
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
import { WishlistPage } from './pages/products/Wishlist'
import { ProductDetailsPage } from './pages/products/ProductDetailsPage'
import { RepairPage } from './pages/repair/RepairPage'
import { BookRepairPage } from './pages/repair/BookRepairPage'
import { RepairHistoryPage } from './pages/repair/RepairHistoryPage'
import { RepairTrackingPage } from './pages/repair/RepairTrackingPage'
import { OrderPage } from './pages/order/OrderPage'
import Payment from './pages/Payment/Payment'
import Profile from './pages/user/Profile'

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<HomePage />} />

          {/* About Us Page */}
          <Route path="/about-us" element={<AboutUs />} />

          {/* Services Page */}
          <Route path="/services" element={<ServicesPage />} />

          {/* Contact Us Page */}
          <Route path="/contact-us" element={<ContactUsPage />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/orders" element={<OrderPage />} />

          {/* Repair Services Pages */}
          <Route path="/repair" element={<RepairPage />} />
           <Route path="/repair/book" element={<BookRepairPage />} />
           <Route path="/repair/history" element={<RepairHistoryPage />} />
          <Route path="/repair/track" element={<RepairTrackingPage />} />

          
         
        
        
      
          <Route path="/payment" element={<Payment />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<SigninPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Role-based Dashboard Routes */}
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/profile" element={<Profile />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/inventory" element={<InventoryManagementPage />} />
          <Route path="/admin/repair-orders" element={<RepairOrdersPage />} />
          <Route path="/admin/sales-log" element={<SalesLogPage />} />
          <Route path="/admin/customers" element={<CustomersPage />} />
          <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />

          
        </Routes>
      </Router>
    </>
  )
}

export default App
