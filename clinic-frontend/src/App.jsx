import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import OurDoctors from './pages/OurDoctors'
import Login from './pages/Login'
import Register from './pages/Register'
import MyDashboard from './pages/MyDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import Schedule from './pages/Schedule'
import Debug from './pages/Debug'
import TestFetch from './pages/TestFetch'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes without Layout (no Navbar/Footer) */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        
        {/* Routes with Layout (includes Navbar/Footer) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="our-doctors" element={<OurDoctors />} />
          <Route path="debug" element={<Debug />} />
          <Route path="test-fetch" element={<TestFetch />} />
          <Route
            path="schedule" 
            element={
              <ProtectedRoute>
                <Schedule />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="my-dashboard" 
            element={
              <ProtectedRoute>
                <MyDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="doctor-dashboard" 
            element={
              <ProtectedRoute>
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
