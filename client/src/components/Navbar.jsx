import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Navbar() {
  const location = useLocation()
  
  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-semibold tracking-tight text-xl hover:text-brand-500 transition">
          Smart Event Booking
        </Link>
        <div className="flex items-center gap-4">
          <Link 
            to="/events" 
            className={`px-4 py-2 rounded-md transition ${
              location.pathname === '/events' 
                ? 'bg-brand-500 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Events
          </Link>
          <Link 
            to="/admin" 
            className={`px-4 py-2 rounded-md transition ${
              location.pathname === '/admin' 
                ? 'bg-brand-500 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  )
}

