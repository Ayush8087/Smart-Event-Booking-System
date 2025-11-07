import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

const API_BASE = 'http://localhost:4000';

export default function LandingPage() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 400], [-20, 20])
  const y2 = useTransform(scrollY, [0, 400], [30, -30])
  const [featuredEvent, setFeaturedEvent] = useState(null)

  useEffect(() => {
    // Fetch first event for featured display
    fetch(`${API_BASE}/api/events`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setFeaturedEvent(data[0])
        }
      })
      .catch(() => {}) // Silently fail - use fallback image
  }, [])

  const getEventImage = (ev) => {
    if (ev?.img) return ev.img
    return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop&q=80'
  }

  return (
    <div className="min-h-screen text-white hero-gradient overflow-x-hidden">
      <Navbar />

      <header className="max-w-7xl mx-auto px-6 pt-10 pb-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-extrabold leading-tight"
          >
            Discover. Book. Enjoy.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-5 text-gray-300 text-lg"
          >
            Find the best events near you and reserve your seat in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-8 flex gap-3"
          >
            <Link to="/events" className="px-6 py-3 rounded-lg bg-brand-500 text-white font-medium shadow-lg shadow-brand-500/30">
              Browse Events
            </Link>
            <a href="#learn" className="px-6 py-3 rounded-lg border border-white/20 hover:bg-white/10 transition">Learn more</a>
          </motion.div>
        </div>

        <div className="relative">
          <motion.div style={{ y: y1 }} className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-brand-500/30 blur-3xl" />
          <motion.div style={{ y: y2 }} className="absolute bottom-0 -right-10 w-56 h-56 rounded-full bg-emerald-400/20 blur-3xl" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          >
            <img
              src={getEventImage(featuredEvent)}
              alt={featuredEvent?.title || "Event booking preview"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {featuredEvent && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-white font-semibold text-lg">{featuredEvent.title}</div>
                <div className="text-white/80 text-sm mt-1">
                  {featuredEvent.location} • {new Date(featuredEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </header>

      <section id="learn" className="max-w-7xl mx-auto px-6 pb-24">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-3xl font-semibold mb-6"
        >
          Why choose Smart Event Booking?
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-6">
          {['Curated events', 'Instant booking', 'Secure payments'].map((t, i) => (
            <motion.div key={t} className="rounded-2xl border border-white/10 bg-white/5 p-6"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i*0.1 }}>
              <div className="text-lg font-medium">{t}</div>
              <p className="text-sm text-gray-300 mt-2">Experience a smooth, modern booking flow with delightful animations.</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}


