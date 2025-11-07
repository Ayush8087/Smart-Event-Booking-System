import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { formatCurrency } from '../utils/formatCurrency.js'

const API_BASE = 'http://localhost:4000';

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')

  const query = useMemo(() => {
    const p = new URLSearchParams()
    if (location) p.set('location', location)
    if (date) p.set('date', date)
    return p.toString()
  }, [location, date])

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    fetch(`${API_BASE}/api/events${query ? `?${query}` : ''}`)
      .then(r => r.json())
      .then(data => { if (isMounted) { setEvents(Array.isArray(data) ? data : []); setError('') } })
      .catch(err => { if (isMounted) setError(err.message) })
      .finally(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [query])

  const getEventImage = (ev) => {
    if (ev.img) return ev.img
    // Fallback images based on event type or use a default
    const images = [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop&q=80'
    ]
    return images[ev.id % images.length]
  }

  return (
    <div className="min-h-screen text-white bg-black">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Events</h1>
          <p className="text-gray-400">Discover amazing events happening near you</p>
        </div>
        
        <div className="mb-8 grid sm:grid-cols-3 gap-4">
          <input 
            value={location} 
            onChange={e=>setLocation(e.target.value)} 
            placeholder="Filter by location" 
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-brand-500 transition" 
          />
          <input 
            value={date} 
            onChange={e=>setDate(e.target.value)} 
            type="date" 
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-brand-500 transition" 
          />
          <button 
            onClick={()=>{ setLocation(''); setDate('') }} 
            className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-3 transition"
          >
            Clear Filters
          </button>
        </div>

        {loading && <LoadingSpinner />}
        
        {error && (
          <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev, idx) => (
            <motion.div 
              key={ev.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-brand-500/10"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getEventImage(ev)}
                  alt={ev.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full bg-brand-500/90 text-sm font-medium">
                    {formatCurrency(ev.price)}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-white font-bold text-lg line-clamp-1">{ev.title}</div>
                  <div className="text-white/80 text-sm mt-1">{ev.location}</div>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="text-white/40">•</span>
                  <span>{new Date(ev.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                </div>
                
                {ev.description && (
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{ev.description}</p>
                )}
                
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-300">
                    <span className="text-emerald-400 font-medium">{ev.available_seats}</span> seats available
                  </div>
                  <Link 
                    to={`/events/${ev.id}`} 
                    className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 transition text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {!loading && events.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="text-gray-400 text-lg mb-2">No events found</div>
            <p className="text-gray-500 text-sm">Try adjusting your filters or check back later</p>
          </div>
        )}
      </div>
    </div>
  )
}


