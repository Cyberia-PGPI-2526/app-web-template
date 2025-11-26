import { NavLink, useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { logout } from "../service/auth.service"
import { useState } from "react"
import Logo from "../assets/logo_natursur.webp"

export default function Navbar() {
  const navigate = useNavigate()
  const { token, role } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    setIsOpen(false)
  }

  const toggleMenu = () => setIsOpen(!isOpen)

  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded transition ${isActive
      ? "bg-[#009BA6] text-white"
      : "hover:bg-[#009BA6] hover:text-white text-[#009BA6]"
    }`

  let publicRoutes = <></>
  let privateRoutes = <></>
  let customerRoutes = <></>
  let adminRoutes = <></>

  switch (role) {
    case "ADMIN":
      adminRoutes =
        <>
          <NavLink className={linkClass} to="/" onClick={() => setIsOpen(false)}>Inicio</NavLink>
          <NavLink className={linkClass} to="/calendar" onClick={() => setIsOpen(false)}>Calendario</NavLink>
          <NavLink className={linkClass} to="/reservations" onClick={() => setIsOpen(false)}>Reservas</NavLink>
          <NavLink className={linkClass} to="/users" onClick={() => setIsOpen(false)}>Usuarios</NavLink>
          <NavLink className={linkClass} to="/services" onClick={() => setIsOpen(false)}>Servicios</NavLink>
          <NavLink className={linkClass} to="/products" onClick={() => setIsOpen(false)}>Productos</NavLink>
          <NavLink className={linkClass} to="/orders" onClick={() => setIsOpen(false)}>Pedidos</NavLink>
        </>
      break
    case "CUSTOMER":
      customerRoutes =
        <>
          <NavLink className={linkClass} to="/" onClick={() => setIsOpen(false)}>Inicio</NavLink>
          <NavLink className={linkClass} to="/services" onClick={() => setIsOpen(false)}>Servicios</NavLink>
          <NavLink className={linkClass} to="/products" onClick={() => setIsOpen(false)}>Productos</NavLink>
          <NavLink className={linkClass} to="/calendar" onClick={() => setIsOpen(false)}>Calendario</NavLink>
          <NavLink className={linkClass} to="/appointments/me" onClick={() => setIsOpen(false)}>Mis Reservas</NavLink>
          <NavLink className={linkClass} to="/orders/me" onClick={() => setIsOpen(false)}>Mis Pedidos</NavLink>
        </>
      break
    default:
      break
  }

  if (!token) {
    publicRoutes = (
      <>
        <NavLink className={linkClass} to="/" onClick={() => setIsOpen(false)}>Inicio</NavLink>
        <NavLink className={linkClass} to="/login" onClick={() => setIsOpen(false)}>Login</NavLink>
        <NavLink className={linkClass} to="/register" onClick={() => setIsOpen(false)}>Registro</NavLink>
      </>
    )
  } else {
    privateRoutes = (
      <>
        <NavLink className={linkClass} to="/profile" onClick={() => setIsOpen(false)}>Perfil</NavLink>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-300 text-white rounded hover:bg-red-400 transition"
        >
          Logout
        </button>
      </>
    )
  }

  return (
    <nav className="w-full sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center h-16">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2">
          <img src={Logo} alt="Natursur Logo" className="h-10 w-auto" />
          <span className="text-2xl font-bold text-[#009BA6]">Natursur</span>
        </NavLink>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-2">
          {adminRoutes}
          {customerRoutes}
          {privateRoutes}
          {publicRoutes}
        </div>

        {/* Hamburger button mobile */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-[#009BA6] focus:outline-none"
            aria-label="Menu"
          >
            {isOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-2 bg-white shadow-md">
          {adminRoutes}
          {customerRoutes}
          {privateRoutes}
          {publicRoutes}
        </div>
      )}
    </nav>
  )
}

