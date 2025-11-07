import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { formatCurrency } from '../utils/formatCurrency.js'

const API_BASE = 'http://localhost:4000';

export default function EventDetailsPage() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    fetch(`${API_BASE}/api/events/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Not found')))
      .then(data => { if (mounted) setEvent(data) })
      .catch(err => { if (mounted) setError(err.message) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [id])

  const getEventImage = (ev) => {
    if (ev.img) return ev.img
    const images = [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop&q=80'
    ]
    return images[ev.id % images.length]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <LoadingSpinner />
      </div>
    )
  }
  
  if (error || !event) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="text-red-400 text-xl mb-4">{error || 'Event not found'}</div>
          <Link to="/events" className="text-brand-500 hover:underline">← Back to events</Link>
        </div>
      </div>
    )
  }

  const mapQuery = encodeURIComponent(event.location || '')
  const googleMapsEmbedKey = import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY
  const mapSrc = mapQuery
    ? (googleMapsEmbedKey
      ? `https://www.google.com/maps/embed/v1/place?key=${googleMapsEmbedKey}&q=${mapQuery}&zoom=12`
      : `https://www.google.com/maps?q=${mapQuery}&output=embed`)
    : ''

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Link to="/events" className="text-sm text-gray-300 hover:text-white transition inline-flex items-center gap-2 mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to events
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-2 gap-8"
        >
          <div>
            <div className="relative h-64 lg:h-96 rounded-2xl overflow-hidden mb-6">
              <img
                src={getEventImage(event)}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            
            <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">{event.description || 'No description available.'}</p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-white font-medium">Location:</span> {event.location || 'To be announced'}
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-white font-medium">Date:</span> {new Date(event.date).toLocaleString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-white font-medium">Available Seats:</span> 
                <span className="text-emerald-400 font-semibold">{event.available_seats}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white font-medium">Price:</span> 
                <span className="text-2xl font-bold text-brand-500">{formatCurrency(event.price)}</span>
              </div>
            </div>
            
            <Link 
              to={`/book/${event.id}`} 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-brand-500 hover:bg-brand-600 transition text-lg font-medium shadow-lg shadow-brand-500/30"
            >
              Book Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          
          <div className="lg:sticky lg:top-20 h-fit">
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl">
              {mapSrc ? (
                <iframe
                  title="map"
                  width="100%"
                  height="400"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={mapSrc}
                  className="w-full"
                />
              ) : (
                <div className="p-6 text-center text-gray-400">Location details coming soon.</div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}


