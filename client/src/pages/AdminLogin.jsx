import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar.jsx'

const API_BASE = 'http://localhost:4000';

export default function AdminLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Login failed')
        setLoading(false)
        return
      }

      // Store token
      localStorage.setItem('admin_token', data.token)
      localStorage.setItem('admin_user', JSON.stringify({ username: data.username, role: data.role }))
      
      // Redirect to admin dashboard
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Failed to login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-md mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-8"
        >
          <h1 className="text-3xl font-bold mb-2">Admin Login</h1>
          <p className="text-gray-400 mb-6">Sign in to manage events</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="admin"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 focus:border-brand-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter password"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 focus:border-brand-500 focus:outline-none transition"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg bg-brand-500 hover:bg-brand-600 transition text-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-xs text-gray-500 text-center">
            Default: admin / admin123 (set ADMIN_USERNAME and ADMIN_PASSWORD in .env)
          </div>
        </motion.div>
      </div>
    </div>
  )
}

