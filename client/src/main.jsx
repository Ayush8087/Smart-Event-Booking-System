import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import EventsPage from './pages/EventsPage.jsx'
import EventDetailsPage from './pages/EventDetailsPage.jsx'
import BookingPage from './pages/BookingPage.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import './styles.css'

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/events', element: <EventsPage /> },
  { path: '/events/:id', element: <EventDetailsPage /> },
  { path: '/book/:id', element: <BookingPage /> },
  { path: '/admin/login', element: <AdminLogin /> },
  { path: '/admin', element: <AdminDashboard /> },
])

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)


