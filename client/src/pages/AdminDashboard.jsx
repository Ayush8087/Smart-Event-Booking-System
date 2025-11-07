import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { formatCurrency } from '../utils/formatCurrency.js'

const API_BASE = 'http://localhost:4000';

function toLocalInput(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const token = localStorage.getItem('admin_token')
  const adminUser = localStorage.getItem('admin_user')

  const headers = useMemo(() => {
    const h = { 'Content-Type': 'application/json' }
    if (token) {
      h['Authorization'] = `Bearer ${token}`
    }
    // Legacy support for x-admin-key
    const adminKey = localStorage.getItem('ADMIN_KEY')
    if (adminKey) h['x-admin-key'] = adminKey
    return h
  }, [token])

  // Check authentication on mount
  useEffect(() => {
    async function checkAuth() {
      if (!token) {
        setCheckingAuth(false)
        navigate('/admin/login')
        return
      }

      try {
        const res = await fetch(`${API_BASE}/api/auth/verify`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.valid) {
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_user')
          navigate('/admin/login')
        }
      } catch (err) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        navigate('/admin/login')
      } finally {
        setCheckingAuth(false)
      }
    }
    checkAuth()
  }, [token, navigate])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/events`)
      const data = await res.json()
      if (!res.ok) {
        setError(data?.message || data?.error || 'Failed to load events')
        setEvents([])
      } else {
        setEvents(Array.isArray(data) ? data : [])
      }
    } catch (e) {
      setError(e.message || 'Failed to connect to server')
      setEvents([])
    } finally { setLoading(false) }
  }

  useEffect(() => { 
    // Check database connection first
    fetch(`${API_BASE}/api/health`)
      .then(r => r.json())
      .then(data => {
        if (!data.db) {
          setError('Database connection failed. Make sure MySQL is running and the database is initialized.')
        }
      })
      .catch(() => setError('Cannot connect to server. Make sure the backend is running on port 4000.'))
    load() 
  }, [])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 1800)
  }

  // New/Edit modal state
  const emptyForm = { title:'', description:'', location:'', date:'', total_seats:'', available_seats:'', price:'', img:'' }
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [showModal, setShowModal] = useState(false)

  function openNew() { 
    setForm(emptyForm)
    setEditingId(null)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingId(null)
    setForm(emptyForm)
  }
  function openEdit(ev) {
    setEditingId(ev.id)
    setForm({
      title: ev.title,
      description: ev.description || '',
      location: ev.location,
      date: toLocalInput(ev.date),
      total_seats: ev.total_seats,
      available_seats: ev.available_seats,
      price: ev.price,
      img: ev.img || ''
    })
    setShowModal(true)
  }

  async function saveEvent(e) {
    e.preventDefault()
    setError('')
    try {
      // Format date properly - datetime-local returns "YYYY-MM-DDTHH:mm" which is ISO8601
      const dateValue = form.date || new Date().toISOString().slice(0, 16)
      const totalSeats = Number(form.total_seats)
      const payload = { 
        ...form, 
        date: new Date(dateValue).toISOString(),
        total_seats: totalSeats,
        // For new events, available_seats = total_seats. For edits, use the form value
        available_seats: editingId ? Number(form.available_seats) : totalSeats,
        price: Number(form.price)
      }
      const res = await fetch(`${API_BASE}/api/events${editingId ? `/${editingId}` : ''}` , {
        method: editingId ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) {
        const errorMsg = data?.message || data?.error || (data?.errors ? JSON.stringify(data.errors) : 'Save failed')
        setError(errorMsg)
        return
      }
      await load()
      showToast(editingId ? 'Event updated' : 'Event created')
      closeModal()
    } catch (err) {
      setError(err.message || 'Failed to save event')
    }
  }

  async function deleteEvent(id) {
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/events/${id}`, { method: 'DELETE', headers })
      const data = await res.json()
      if (!res.ok) {
        const errorMsg = data?.message || data?.error || 'Delete failed'
        setError(errorMsg)
        setConfirmId(null)
        return
      }
      await load()
      setConfirmId(null)
      showToast('Event deleted')
    } catch (err) {
      setError(err.message || 'Failed to delete event')
      setConfirmId(null)
    }
  }

  function handleLogout() {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    navigate('/admin/login')
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  const user = adminUser ? JSON.parse(adminUser) : null

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            {user && <p className="text-sm text-gray-400 mt-1">Logged in as {user.username}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={openNew} className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 transition">New Event</button>
            <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition">Logout</button>
          </div>
        </div>

        {loading && <LoadingSpinner />}
        {error && (
          <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            <div className="font-semibold mb-1">Error:</div>
            <div className="text-sm">{error}</div>
            {error.includes('db_error') && (
              <div className="mt-2 text-xs text-red-300">
                Make sure MySQL is running and the database is initialized. Run: <code className="bg-black/30 px-2 py-1 rounded">mysql -u root -p &lt; event_booking.sql</code>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-300">
              <tr>
                <th className="py-2">Title</th>
                <th className="py-2">Date</th>
                <th className="py-2">Location</th>
                <th className="py-2">Avail.</th>
                <th className="py-2">Price</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {events.map((ev) => (
                  <motion.tr key={ev.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="border-t border-white/10"
                  >
                    <td className="py-3 pr-3">{ev.title}</td>
                    <td className="py-3 pr-3">{new Date(ev.date).toLocaleString()}</td>
                    <td className="py-3 pr-3">{ev.location}</td>
                    <td className="py-3 pr-3">{ev.available_seats}</td>
                    <td className="py-3 pr-3">{formatCurrency(ev.price)}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(ev)} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Edit</button>
                        <button onClick={() => setConfirmId(ev.id)} className="px-3 py-1 rounded bg-red-500/80 hover:bg-red-500">Delete</button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <AnimatePresence>
          {showModal && (
            <motion.div key="modal" className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full max-w-2xl rounded-2xl bg-zinc-900 border border-white/10 p-6">
                <div className="text-lg font-semibold mb-4">{editingId ? 'Edit Event' : 'New Event'}</div>
                <form onSubmit={saveEvent} className="grid md:grid-cols-2 gap-4">
                  <input className="rounded bg-white/5 border border-white/10 px-3 py-2" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
                  <input className="rounded bg-white/5 border border-white/10 px-3 py-2" placeholder="Location" value={form.location} onChange={e=>setForm({...form, location:e.target.value})} required />
                  <input className="rounded bg-white/5 border border-white/10 px-3 py-2" type="datetime-local" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} required />
                  <input className="rounded bg-white/5 border border-white/10 px-3 py-2" type="number" placeholder="Total seats" value={form.total_seats} onChange={e=>{
                    const val = e.target.value
                    setForm({...form, total_seats: val, available_seats: editingId ? form.available_seats : val})
                  }} min="1" required />
                  {editingId ? (
                    <input className="rounded bg-white/5 border border-white/10 px-3 py-2" type="number" placeholder="Available seats" value={form.available_seats} onChange={e=>setForm({...form, available_seats:e.target.value})} min="0" required />
                  ) : null}
                  <input className="rounded bg-white/5 border border-white/10 px-3 py-2" type="number" placeholder="Price" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} min="0" step="0.01" required />
                  <input className="rounded bg-white/5 border border-white/10 px-3 py-2" placeholder="Image URL" value={form.img} onChange={e=>setForm({...form, img:e.target.value})} />
                  <textarea className="md:col-span-2 rounded bg-white/5 border border-white/10 px-3 py-2" rows="3" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
                  <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                    <button type="button" onClick={closeModal} className="px-4 py-2 rounded bg-white/10">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded bg-brand-500">Save</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {confirmId && (
            <motion.div key="confirm" className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 p-6 text-center">
                <div className="text-lg font-semibold">Delete this event?</div>
                <div className="text-sm text-gray-300 mt-2">This action cannot be undone.</div>
                <div className="mt-6 flex justify-center gap-3">
                  <button onClick={()=>setConfirmId(null)} className="px-4 py-2 rounded bg-white/10">Cancel</button>
                  <button onClick={()=>deleteEvent(confirmId)} className="px-4 py-2 rounded bg-red-500/80 hover:bg-red-500">Delete</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast && (
            <motion.div key="toast" className="fixed bottom-6 right-6 px-4 py-2 rounded-lg bg-emerald-500 text-black"
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}>
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}


