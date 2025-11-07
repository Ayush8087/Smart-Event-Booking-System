import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import confetti from 'canvas-confetti'
import Navbar from '../components/Navbar.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { formatCurrency } from '../utils/formatCurrency.js'
import { API_BASE } from '../config.js'

export default function BookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [ticket, setTicket] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/events/${id}`).then(r => r.json()).then(setEvent)
  }, [id])

  const total = event ? Number(event.price) * Number(quantity || 0) : 0

  async function submit(e) {
    e.preventDefault()
    setError('')
    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: Number(id), name, email, mobile, quantity: Number(quantity) })
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data?.error || 'Booking failed')
      return
    }
    const payload = data.booking
    setTicket(payload)
    setSuccess('Booking confirmed!')
    try { confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } }) } catch {}
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link to={`/events/${id}`} className="text-sm text-gray-300 hover:text-white transition inline-flex items-center gap-2 mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to event
        </Link>
        <h1 className="text-3xl font-bold mb-2">Book: {event.title}</h1>
        <p className="text-gray-400 mb-8">{event.location} • {new Date(event.date).toLocaleDateString()}</p>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm text-gray-300 mb-2">Full Name</label>
              <input 
                value={name} 
                onChange={e=>setName(e.target.value)} 
                required 
                placeholder="John Doe" 
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 focus:border-brand-500 focus:outline-none transition" 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Email</label>
              <input 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                required 
                type="email" 
                placeholder="john@example.com" 
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 focus:border-brand-500 focus:outline-none transition" 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Mobile (Optional)</label>
              <input 
                value={mobile} 
                onChange={e=>setMobile(e.target.value)} 
                placeholder="+1 234 567 8900" 
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 focus:border-brand-500 focus:outline-none transition" 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Number of Tickets</label>
              <div className="flex items-center gap-3">
                <input 
                  value={quantity} 
                  onChange={e=>setQuantity(e.target.value)} 
                  type="number" 
                  min="1" 
                  max={event.available_seats} 
                  className="w-32 rounded-lg bg-white/5 border border-white/10 px-4 py-3 focus:border-brand-500 focus:outline-none transition" 
                />
                <div className="text-sm text-gray-300">
                  <span className="text-emerald-400 font-medium">{event.available_seats}</span> available
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Amount</span>
                <span className="text-2xl font-bold text-brand-500">{formatCurrency(total)}</span>
              </div>
            </div>
            <AnimatePresence>
              {error && (
                <motion.div
                  key="err"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                >{error}</motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {success && (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
                >{success}</motion.div>
              )}
            </AnimatePresence>
            <button 
              type="submit" 
              className="w-full px-6 py-4 rounded-lg bg-brand-500 hover:bg-brand-600 transition text-lg font-medium shadow-lg shadow-brand-500/30"
            >
              Confirm Booking
            </button>
          </motion.form>

          <AnimatePresence>
            {ticket && (
              <motion.div
                key="ticket"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-8 text-center backdrop-blur-lg"
              >
                <div className="text-2xl font-bold mb-1">Your Ticket</div>
                <div className="text-sm text-gray-400 mb-6">Booking Confirmed</div>
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-xl bg-white/5">
                    <QRCodeSVG
                      value={JSON.stringify({ id: ticket.id, event_id: ticket.event_id, name: ticket.name, qty: ticket.quantity })}
                      size={200}
                      bgColor="transparent"
                      fgColor="#ffffff"
                    />
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="text-gray-300">Booking #{'{'}ticket.id{'}'}</div>
                  <div className="text-gray-300">Total: <span className="text-brand-500 font-semibold">{formatCurrency(ticket.total_amount)}</span></div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {ticket.status}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}


