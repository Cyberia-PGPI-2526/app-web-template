import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Profile from './pages/private/Profile'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'
import { useAuthStore } from './store/authStore'
import Users from './pages/admin/Users'
import User from './pages/admin/User'
import AdminServices from './pages/admin/Services'
import AdminReservations from './pages/admin/Reservations'
import CustomerServices from './pages/Services'
import Products from './pages/Products'
import { useEffect, useState } from 'react'
import { refreshToken } from './service/auth.service'
import AppCalendar from './pages/customer/Calendar'
import AdminCalendar from './pages/admin/Calendar'
import Availability from './pages/customer/Availability'
import MyAppointments from './pages/customer/MyAppointments'
import Register from './pages/Register'
import ChatbotSidebar from './components/ChatbotSidebar'
import OrdersAdmin from './pages/admin/Orders'
import MyOrders from './pages/customer/MyOrders'

function App() {
  const { token, role } = useAuthStore()
  const [isAuthReady, setIsAuthReady] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      await refreshToken()
      setIsAuthReady(true)
    }
    initAuth()
  }, [])

  let publicRoutes = <></>
  let privateRoutes = <></>
  let customerRoutes = <></>
  let adminRoutes = <></>

  switch (role) {
    case "ADMIN":
      adminRoutes = (
        <>
          <Route path='/users' element={<PrivateRoute><Users /></PrivateRoute>} />
          <Route path='/users/:id' element={<PrivateRoute><User /></PrivateRoute>} />
          <Route path='/reservations' element={<PrivateRoute><AdminReservations /></PrivateRoute>} />
          <Route path='/services' element={<PrivateRoute><AdminServices /></PrivateRoute>} />
          <Route path='/products' element={<PrivateRoute><Products /></PrivateRoute>} />
          <Route path='/calendar' element={<PrivateRoute><AdminCalendar /></PrivateRoute>} />
          <Route path='/orders' element={<PrivateRoute><OrdersAdmin /></PrivateRoute>} />
        </>
      )
      break
    case "CUSTOMER":
      customerRoutes = (
        <>
          <Route path='/appointments/me' element={<PrivateRoute><MyAppointments /></PrivateRoute>} />
          <Route path='/services' element={<PrivateRoute><CustomerServices /></PrivateRoute>} />
          <Route path='/products' element={<PrivateRoute><Products /></PrivateRoute>} />
          <Route path='/reservations' element={<PrivateRoute><Login /></PrivateRoute>} />
          <Route path='/calendar' element={<PrivateRoute><AppCalendar /></PrivateRoute>} />
          <Route path='/orders/me' element={<PrivateRoute><MyOrders /></PrivateRoute>} />
        </>
      )
      break
    default:
      break
  }

  if (!token) {
    publicRoutes = (
      <>
        <Route path='/services' element={<CustomerServices />} />
        <Route path='/products' element={<Products />} />
      </>
    )
  } else {
    privateRoutes = (
      <>
        <Route path='/profile' element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/availability/:date" element={<PrivateRoute><Availability /></PrivateRoute>} />
      </>
    )
  }

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-[#009BA6]">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className='flex-1 mx-auto w-full max-w-7xl px-4 py-6 md:px-8 lg:px-16'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          {adminRoutes}
          {customerRoutes}
          {privateRoutes}
          {publicRoutes}
        </Routes>
        {token && role === 'CUSTOMER' && <ChatbotSidebar />}
      </main>
      <Footer />
    </div>
  )
}

export default App
