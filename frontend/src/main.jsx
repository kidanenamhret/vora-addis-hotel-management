import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import './index.css';
import { Layout } from './components/Layout.jsx';
import { Booking } from './pages/Booking.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Login } from './pages/Login.jsx';
import { About, Contact, Gallery, Gym, Home, MeetingRooms, NightClub, Restaurant, Rooms } from './pages/Website.jsx';
import { RoomDetails } from './pages/RoomDetails.jsx';
import { MyBookings } from './pages/MyBookings.jsx';
import { currentUser } from './services/api.js';

function ProtectedRoute({ children }) {
  const user = currentUser();
  if (!user || user.role === 'Guest') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

const router = createBrowserRouter([{ path: '/', element: <Layout />, children: [
  { index: true, element: <Home /> }, { path: 'about', element: <About /> }, { path: 'rooms', element: <Rooms /> },
  { path: 'rooms/:type', element: <RoomDetails /> },
  { path: 'restaurant', element: <Restaurant /> }, { path: 'gym', element: <Gym /> }, { path: 'night-club', element: <NightClub /> },
  { path: 'meeting-rooms', element: <MeetingRooms /> }, { path: 'gallery', element: <Gallery /> }, { path: 'contact', element: <Contact /> },
  { path: 'booking', element: <Booking /> }, { path: 'login', element: <Login /> },
  { path: 'my-bookings', element: <MyBookings /> },
  { path: 'dashboard', element: <ProtectedRoute><Dashboard /></ProtectedRoute> }
]}]);

createRoot(document.getElementById('root')).render(<React.StrictMode><RouterProvider router={router} /></React.StrictMode>);
