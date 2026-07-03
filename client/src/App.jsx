import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { SigninPage } from './pages/login/SigninPage'

function App() {
  return (
    <>
      <Router>
        <Routes>

          {/* Home Page */}
          <Route path="/" element={<p>Home Page</p>} />

          {/* Authentication Routes */}
          <Route path="/login" element={<SigninPage />} />
        
        </Routes>
      </Router>
    </>
  )
}

export default App
