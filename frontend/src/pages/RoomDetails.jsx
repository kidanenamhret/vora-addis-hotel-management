import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bed, Users, Wifi, Tv, Coffee, Bath, Wind, Star, Calendar,
  ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, CheckCircle,
  Clock, Sparkles, Utensils, Plane, Wine, Info,
  Phone, Volume2, Lightbulb, Thermometer, PhoneCall, PhoneOff
} from 'lucide-react';
import { roomTypes } from '../data/content.js';
import { api } from '../services/api.js';

// Map amenity strings to Lucide Icons
const getAmenityIcon = (name) => {
  const normalized = name.toLowerCase();
  if (normalized.includes('wi-fi') || normalized.includes('wifi')) return <Wifi size={18} />;
  if (normalized.includes('air conditioning') || normalized.includes('ac')) return <Wind size={18} />;
  if (normalized.includes('tv') || normalized.includes('television')) return <Tv size={18} />;
  if (normalized.includes('coffee') || normalized.includes('espresso')) return <Coffee size={18} />;
  if (normalized.includes('bathroom') || normalized.includes('shower')) return <Bath size={18} />;
  if (normalized.includes('guest') || normalized.includes('capacity')) return <Users size={18} />;
  if (normalized.includes('bed')) return <Bed size={18} />;
  if (normalized.includes('breakfast') || normalized.includes('dining')) return <Utensils size={18} />;
  if (normalized.includes('shuttle') || normalized.includes('airport')) return <Plane size={18} />;
  if (normalized.includes('wine') || normalized.includes('butler')) return <Wine size={18} />;
  return <Sparkles size={18} />;
};

export function RoomDetails() {
  const { type } = useParams();
  const navigate = useNavigate();

  // Find room details from content.js
  const room = roomTypes.find(
    (r) => r.name.toLowerCase() === type?.toLowerCase()
  );

  // States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [checkIn, setCheckIn] = useState(localStorage.getItem('sticky_checkIn') || '');
  const [checkOut, setCheckOut] = useState(localStorage.getItem('sticky_checkOut') || '');
  const [guests, setGuests] = useState(Number(localStorage.getItem('sticky_guests') || '2'));
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoomInstance, setSelectedRoomInstance] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Booking states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Active status count for real-time badge
  const [statusBadge, setStatusBadge] = useState({ text: 'Checking Status...', color: 'text-zinc-500 bg-zinc-100' });

  // Smart Room Simulator states
  const roomNumbersMap = {
    single: ['103', '104'],
    twin: ['105', '106'],
    standard: ['101', '102'],
    deluxe: ['201', '202'],
    executive: ['301', '302'],
    suite: ['401', '402']
  };
  const [simRoomNo, setSimRoomNo] = useState('');
  const [activeGuest, setActiveGuest] = useState(null);
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [simTab, setSimTab] = useState('tv');

  // TV controls
  const [tvOn, setTvOn] = useState(true);
  const [tvTemp, setTvTemp] = useState(21);
  const [tvLights, setTvLights] = useState({ main: true, ambient: true, reading: false });
  const [tvMenu, setTvMenu] = useState('welcome');

  // Phone controls
  const [phoneStatus, setPhoneStatus] = useState('idle'); // idle, calling, active, ended
  const [phoneTarget, setPhoneTarget] = useState('');
  const [phoneMessage, setPhoneMessage] = useState('');

  useEffect(() => {
    if (room) {
      const numbers = roomNumbersMap[room.name.toLowerCase()] || [];
      if (numbers.length > 0) {
        setSimRoomNo(numbers[0]);
      }
    }
  }, [room]);

  useEffect(() => {
    if (!simRoomNo) return;
    setLoadingGuest(true);
    api.get(`/hotel/public/rooms/${simRoomNo}/active-guest`)
      .then(res => {
        setActiveGuest(res.data.data);
      })
      .catch(() => {
        setActiveGuest(null);
      })
      .finally(() => {
        setLoadingGuest(false);
      });
  }, [simRoomNo]);

  useEffect(() => {
    if (!room) {
      navigate('/rooms', { replace: true });
      return;
    }
    // Fetch live rooms from backend to compute real-time status count
    const fetchStatus = async () => {
      try {
        const { data } = await api.get('/hotel/public/rooms');
        const ofType = data.data.filter(r => r.type.toLowerCase() === room.name.toLowerCase());
        const available = ofType.filter(r => r.status === 'Available');
        
        if (ofType.length === 0 || available.length > 2) {
          setStatusBadge({ text: '🟢 Available Today', color: 'text-green-700 bg-green-100 dark:bg-green-950/40 dark:text-green-300' });
        } else if (available.length === 0) {
          setStatusBadge({ text: '🔴 Fully Booked Today', color: 'text-red-700 bg-red-100 dark:bg-red-950/40 dark:text-red-300' });
        } else {
          setStatusBadge({ text: `🟡 Limited Rooms Left (${available.length} room${available.length > 1 ? 's' : ''})`, color: 'text-amber-700 bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300' });
        }
      } catch (err) {
        // Fallback to static realistic status
        setStatusBadge({ text: '🟢 Available Today', color: 'text-green-700 bg-green-100 dark:bg-green-950/40 dark:text-green-300' });
      }
    };
    fetchStatus();
  }, [room, navigate]);

  if (!room) return null;

  const nights = checkIn && checkOut ? Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)) : 0;
  const totalCost = selectedRoomInstance ? Number(selectedRoomInstance.base_price) * nights : room.price * nights;

  // Check Availability
  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setErrorMsg('Please select check-in and check-out dates.');
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setErrorMsg('Check-out date must be after check-in date.');
      return;
    }
    setCheckingAvailability(true);
    setErrorMsg('');
    setHasSearched(true);
    setSelectedRoomInstance(null);

    try {
      const { data } = await api.get('/hotel/availability', {
        params: { checkIn, checkOut, roomType: room.name }
      });
      setAvailableRooms(data.data || []);
      if (data.data && data.data.length > 0) {
        setSelectedRoomInstance(data.data[0]); // auto-select first available room instance
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to check availability.');
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Submit Reservation
  const handleReserve = async (e) => {
    e.preventDefault();
    if (!selectedRoomInstance) {
      setErrorMsg('Please find and select an available room first.');
      return;
    }
    if (!fullName) {
      setErrorMsg('Full name is required.');
      return;
    }
    setBookingLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/hotel/bookings', {
        customer: { fullName, email, phone, nationality },
        roomId: selectedRoomInstance.id,
        checkInDate: checkIn,
        checkOutDate: checkOut
      });
      setConfirmedBooking(res.data.data);
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit reservation.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Gallery Navigation
  const prevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? room.images.length - 1 : prev - 1));
  };
  const nextImage = () => {
    setActiveImageIndex((prev) => (prev === room.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="pt-6 pb-24 bg-brand-50/20 dark:bg-ink-950/20">
      <div className="mx-auto max-w-7xl px-4">
        {/* Back Link */}
        <Link to="/rooms" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-8 transition-colors">
          <ChevronLeft size={16} /> Back to Rooms & Suites
        </Link>

        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusBadge.color}`}>
                {statusBadge.text}
              </span>
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={16} className="fill-amber-500" />
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{room.rating}</span>
                <span className="text-xs text-zinc-500">({room.reviewsCount} reviews)</span>
              </div>
            </div>
            <h1 className="mt-3 font-heading text-4xl font-light md:text-5xl lg:text-6xl text-zinc-900 dark:text-white">
              {room.name} <span className="font-semibold text-brand-500">Room</span>
            </h1>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Starting From</p>
            <p className="font-heading text-3xl font-semibold text-brand-500 md:text-4xl mt-1">
              ${room.price} <span className="text-sm font-normal text-zinc-500">/ Night</span>
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-start">
          {/* Left Column: Media Gallery, Info, Policies */}
          <div className="space-y-8">
            {/* Interactive Image Slider */}
            <div className="relative group overflow-hidden rounded-lg aspect-[16/10] bg-zinc-100 dark:bg-zinc-900 shadow-xl">
              <img
                src={room.images[activeImageIndex]}
                alt={`${room.name} Gallery ${activeImageIndex + 1}`}
                className="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

              {/* Slider Controls */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-zinc-800 hover:bg-white shadow-md dark:bg-black/70 dark:text-white transition"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-zinc-800 hover:bg-white shadow-md dark:bg-black/70 dark:text-white transition"
              >
                <ChevronRight size={20} />
              </button>

              {/* Indicator dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {room.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      i === activeImageIndex ? 'w-6 bg-brand-500' : 'bg-white/60 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Thumbnail list */}
            <div className="grid grid-cols-3 gap-3">
              {room.images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`cursor-pointer overflow-hidden rounded-md aspect-[4/3] border-2 transition ${
                    i === activeImageIndex ? 'border-brand-500 scale-[0.98]' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={img} className="h-full w-full object-cover" alt="thumbnail" />
                </div>
              ))}
            </div>

            {/* Room Description */}
            <div className="glass-panel rounded-lg p-6 md:p-8">
              <h2 className="font-heading text-2xl font-medium text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4">
                Room Overview
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-lg font-light">
                {room.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="glass-panel rounded-lg p-6 md:p-8">
              <h2 className="font-heading text-2xl font-medium text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
                Premium Amenities & Features
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {room.amenitiesList.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      {getAmenityIcon(amenity)}
                    </span>
                    <span className="text-sm font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* In-Room AI Smart Hub Experience Simulator */}
            <div className="glass-panel bg-[#0d1527] border border-brand-500/20 text-white rounded-lg p-6 md:p-8 relative overflow-hidden shadow-2xl">
              {/* Ambient Glow */}
              <div className="absolute -top-24 -left-24 h-48 w-48 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 h-48 w-48 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-zinc-800 pb-4 relative z-10">
                <div>
                  <h3 className="text-xl font-medium font-heading text-white flex items-center gap-2">
                    <Sparkles className="text-brand-400" size={18} />
                    In-Room Smart Experience
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-light mt-1">Interactive TV & speed-dial systems automatically synced with Reception.</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Simulate Room:</label>
                  <select
                    value={simRoomNo}
                    onChange={(e) => {
                      setSimRoomNo(e.target.value);
                      setPhoneStatus('idle');
                    }}
                    className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-white outline-none focus:border-brand-500"
                  >
                    {(roomNumbersMap[room.name.toLowerCase()] || []).map(num => (
                      <option key={num} value={num}>Room {num}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Navigation tabs */}
              <div className="flex gap-2 mb-6 relative z-10">
                <button
                  onClick={() => setSimTab('tv')}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded border transition ${
                    simTab === 'tv'
                      ? 'bg-brand-500 border-brand-500 text-zinc-950 shadow-md font-semibold'
                      : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white bg-[#080d1a]'
                  }`}
                >
                  📺 AI Pro TV
                </button>
                <button
                  onClick={() => setSimTab('phone')}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded border transition ${
                    simTab === 'phone'
                      ? 'bg-brand-500 border-brand-500 text-zinc-950 shadow-md font-semibold'
                      : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white bg-[#080d1a]'
                  }`}
                >
                  📞 Telephone
                </button>
              </div>

              {/* Tab 1: AI Pro TV Screen */}
              {simTab === 'tv' && (
                <div className="space-y-4 relative z-10">
                  <div className="relative rounded-xl border-8 border-zinc-800 bg-[#02050a] aspect-[16/10] overflow-hidden flex flex-col justify-between shadow-2xl">
                    {!tvOn ? (
                      /* TV Screen Standby */
                      <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 bg-zinc-950 p-6">
                        <Tv size={42} className="opacity-20 mb-2" />
                        <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">Standby Mode</p>
                        <button
                          onClick={() => setTvOn(true)}
                          className="mt-4 px-4 py-1.5 bg-zinc-900 border border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-300 hover:text-white rounded hover:border-brand-500 transition"
                        >
                          Power On Screen
                        </button>
                      </div>
                    ) : (
                      /* TV Screen Active */
                      <div className="flex-1 bg-gradient-to-br from-[#0a1122] to-[#03060c] text-zinc-200 flex flex-col justify-between p-4 relative">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
                        
                        {/* Screen Header */}
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                          <span className="font-heading text-[10px] font-bold text-brand-400 tracking-[0.15em] uppercase">Vora Addis AI Pro TV</span>
                          <span className="text-[9px] text-zinc-500 font-semibold uppercase">Room {simRoomNo}</span>
                        </div>

                        {/* Screen Main content */}
                        <div className="flex-1 flex gap-3 py-3 overflow-hidden">
                          {/* Left Navigation */}
                          <div className="w-1/3 border-r border-white/5 flex flex-col gap-1 pr-1.5 justify-center">
                            {[
                              { id: 'welcome', label: 'Welcome Screen' },
                              { id: 'dining', label: 'In-Room Dining' },
                              { id: 'channels', label: 'TV Channels' },
                              { id: 'attractions', label: 'City Guide' }
                            ].map(m => (
                              <button
                                key={m.id}
                                onClick={() => setTvMenu(m.id)}
                                className={`text-left px-2 py-1.5 rounded text-[9px] font-bold tracking-wide transition ${
                                  tvMenu === m.id
                                    ? 'bg-brand-500/10 text-brand-400 border-l-2 border-brand-500'
                                    : 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200'
                                }`}
                              >
                                {m.label}
                              </button>
                            ))}
                          </div>

                          {/* Right Content display */}
                          <div className="flex-1 overflow-y-auto pr-1 text-[11px] font-light flex flex-col justify-center">
                            {tvMenu === 'welcome' && (
                              <div className="space-y-1.5">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                  {loadingGuest ? 'Loading Profile...' : activeGuest ? `Hello, ${activeGuest.full_name}!` : 'Hello, Guest!'}
                                </h4>
                                <p className="text-[10px] text-zinc-400 leading-normal font-light">
                                  {activeGuest ? (
                                    <>Welcome back to Vora Addis. We are pleased to host you for your booking in Room {simRoomNo} from <strong>{activeGuest.check_in_date}</strong> to <strong>{activeGuest.check_out_date}</strong>.</>
                                  ) : (
                                    <>No active check-in registered at reception for Room {simRoomNo}. (You can check in a guest in the Staff Dashboard to see the PMS automatic greetings here!)</>
                                  )}
                                </p>
                                <div className="p-2 rounded bg-white/5 border border-white/10 text-[9px] space-y-0.5">
                                  <div className="flex justify-between"><span className="text-zinc-500">Wi-Fi</span><span className="font-semibold text-white">VoraAddis_Guest</span></div>
                                  <div className="flex justify-between"><span className="text-zinc-500">Password</span><span className="font-semibold text-brand-400">voraaddis2026</span></div>
                                </div>
                              </div>
                            )}

                            {tvMenu === 'dining' && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">In-Room Dining Menu</h4>
                                <div className="space-y-1 text-[10px]">
                                  <div className="flex justify-between border-b border-white/5 pb-0.5"><span>Vora Breakfast Platter</span><span className="text-brand-400 font-bold">$12</span></div>
                                  <div className="flex justify-between border-b border-white/5 pb-0.5"><span>Grilled Nile Perch</span><span className="text-brand-400 font-bold">$18</span></div>
                                  <div className="flex justify-between pb-0.5"><span>Signature Fresh Juice</span><span className="text-brand-400 font-bold">$5</span></div>
                                </div>
                                <p className="text-[8px] text-zinc-500 italic">Dial Ext 9 on your room telephone to place an order.</p>
                              </div>
                            )}

                            {tvMenu === 'channels' && (
                              <div className="space-y-1.5">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Live TV</h4>
                                <div className="grid grid-cols-2 gap-1 text-[9px] font-semibold text-center">
                                  {['Vora Cinema', 'Addis TV', 'BBC World', 'CNN News'].map(ch => (
                                    <div key={ch} className="p-1 bg-white/5 rounded border border-white/5 text-zinc-300">
                                      📺 {ch}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {tvMenu === 'attractions' && (
                              <div className="space-y-1.5">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">City Highlights</h4>
                                <div className="space-y-1 text-[9px] text-zinc-400">
                                  <p>🏛️ <strong>National Museum:</strong> Home of Lucy (5 min away)</p>
                                  <p>🌲 <strong>Entoto Park:</strong> Panoramic city views (15 min away)</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Screen Footer */}
                        <div className="flex justify-between items-center border-t border-white/10 pt-2 text-[9px] text-zinc-500">
                          <span>Addis Ababa, ET · 24°C Sunny</span>
                          <button
                            onClick={() => setTvOn(false)}
                            className="px-2 py-0.5 bg-red-950 border border-red-500/20 hover:bg-red-600 text-red-400 hover:text-white rounded text-[8px] transition font-bold"
                          >
                            Power Off
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Remote Controls (AC & Lights) */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* AC */}
                    <div className="p-4 rounded bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded bg-zinc-800 text-brand-400"><Thermometer size={14} /></span>
                        <div>
                          <span className="block text-xs font-semibold">Climate</span>
                          <span className="text-[9px] text-zinc-500 font-light">Target Temperature</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-zinc-800 rounded p-1">
                        <button
                          onClick={() => setTvTemp(t => Math.max(16, t - 1))}
                          className="h-5 w-5 flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 rounded text-xs font-bold text-white"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold px-1.5">{tvTemp}°C</span>
                        <button
                          onClick={() => setTvTemp(t => Math.min(30, t + 1))}
                          className="h-5 w-5 flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 rounded text-xs font-bold text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Lights */}
                    <div className="p-4 rounded bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded bg-zinc-800 text-brand-400"><Lightbulb size={14} /></span>
                        <div>
                          <span className="block text-xs font-semibold">Lights</span>
                          <span className="text-[9px] text-zinc-500 font-light">Custom Ambient Dimmer</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        {[
                          { key: 'main', label: 'Main' },
                          { key: 'ambient', label: 'Mood' },
                          { key: 'reading', label: 'Bed' }
                        ].map(l => (
                          <button
                            key={l.key}
                            onClick={() => setTvLights(prev => ({ ...prev, [l.key]: !prev[l.key] }))}
                            className={`px-2 py-1 rounded text-[9px] font-bold transition ${
                              tvLights[l.key]
                                ? 'bg-brand-500 text-zinc-950'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50 hover:text-white'
                            }`}
                          >
                            {l.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Room Telephone Speed Dial */}
              {simTab === 'phone' && (
                <div className="grid gap-4 sm:grid-cols-[1fr_1.5fr] relative z-10">
                  {/* Phone controls / numbers */}
                  <div className="p-4 rounded bg-zinc-900/60 border border-zinc-800 space-y-3 flex flex-col justify-center">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-1.5 mb-1 flex items-center gap-1.5">
                      <Phone size={12} className="text-brand-400" />
                      Speed Dial Extensions
                    </span>
                    {[
                      { ext: '0', label: 'Reception Desk', target: 'Receptionist Betty' },
                      { ext: '9', label: 'In-Room Dining', target: 'Room Service Chef' },
                      { ext: '3', label: 'Wellness & Gym', target: 'Trainer Joseph' },
                      { ext: '4', label: 'Housekeeping', target: 'Cleaning Services' }
                    ].map(p => (
                      <button
                        key={p.ext}
                        disabled={phoneStatus === 'calling' || phoneStatus === 'active'}
                        onClick={() => {
                          setPhoneTarget(p.target);
                          setPhoneStatus('calling');
                          const guestName = activeGuest ? activeGuest.full_name : 'Guest';
                          
                          // Custom dialogue lines
                          let msg = '';
                          if (p.ext === '0') {
                            msg = `Vora Front Desk: Welcome to Vora Addis! Betty at your service. Hello, ${guestName}. How can I assist you in Room ${simRoomNo} today?`;
                          } else if (p.ext === '9') {
                            msg = `Vora Dining: Greetings from the Chef! Ready to take your dinner order for Room ${simRoomNo}, ${guestName}. Our Nile Perch special is popular tonight!`;
                          } else if (p.ext === '3') {
                            msg = `Vora Wellness Club: Hello, ${guestName}! Joseph here. Ready to book your fitness session or gym trainer for Room ${simRoomNo}?`;
                          } else if (p.ext === '4') {
                            msg = `Housekeeping: Hello, ${guestName}. Need fresh towels, pillows, or checkout assistance in Room ${simRoomNo}?`;
                          }
                          setPhoneMessage(msg);

                          setTimeout(() => {
                            setPhoneStatus('active');
                          }, 1500);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded bg-zinc-800 hover:bg-zinc-700/80 transition text-left border border-zinc-700/40 text-xs disabled:opacity-50"
                      >
                        <span className="font-semibold">{p.label}</span>
                        <span className="text-[10px] text-brand-400 font-bold px-2 py-0.5 bg-zinc-900 rounded">Ext {p.ext}</span>
                      </button>
                    ))}
                  </div>

                  {/* Phone Status Screen */}
                  <div className="p-4 rounded bg-[#02050a] border border-zinc-800 flex flex-col justify-between min-h-[180px]">
                    {phoneStatus === 'idle' && (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-500">
                        <Phone size={32} className="opacity-20 mb-2 animate-bounce" />
                        <p className="text-xs font-semibold text-zinc-400">Handset Lifted</p>
                        <p className="text-[10px] text-zinc-600 mt-1">Select a speed-dial extension key to call Reception or Room Service.</p>
                      </div>
                    )}

                    {phoneStatus === 'calling' && (
                      <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="relative mb-3">
                          <span className="absolute inset-0 rounded-full bg-brand-500/20 animate-ping" />
                          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-zinc-950">
                            <PhoneCall size={16} className="animate-pulse" />
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white">Dialing {phoneTarget}...</p>
                        <p className="text-[10px] text-zinc-500 mt-1 italic">Connecting with PMS Database</p>
                      </div>
                    )}

                    {phoneStatus === 'active' && (
                      <div className="flex-grow flex flex-col justify-between">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-bold text-white">{phoneTarget}</span>
                          </div>
                          <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Call Active</span>
                        </div>
                        <div className="flex-1 flex items-center p-3 rounded bg-zinc-900/50 border border-zinc-800 text-xs leading-relaxed text-zinc-300 font-light italic">
                          "{phoneMessage}"
                        </div>
                      </div>
                    )}

                    {phoneStatus !== 'idle' && (
                      <button
                        onClick={() => setPhoneStatus('idle')}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-red-950/80 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white rounded text-xs font-bold transition"
                      >
                        <PhoneOff size={14} /> Hang Up Call
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Policies */}
            <div className="glass-panel rounded-lg p-6 md:p-8">
              <h2 className="font-heading text-2xl font-medium text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4">
                Hotel Policies & Rules
              </h2>
              <ul className="space-y-3.5 text-zinc-600 dark:text-zinc-300">
                {room.policies.map((policy, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <Clock size={16} className="text-brand-500 shrink-0 mt-0.5" />
                    <span>{policy}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock Calendar Widget */}
            <div className="glass-panel rounded-lg p-6 md:p-8">
              <h2 className="font-heading text-2xl font-medium text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4">
                Availability Calendar (Addis Timezone)
              </h2>
              <div className="flex items-center gap-2 mb-4 text-xs text-zinc-500">
                <Info size={14} className="text-brand-500" />
                <span>Green dates indicate available standard slots. Dark blocks represent existing bookings.</span>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 30 }, (_, i) => {
                  const dayNum = i + 1;
                  const isBooked = dayNum % 5 === 0 || dayNum % 7 === 0;
                  return (
                    <div
                      key={dayNum}
                      className={`h-10 flex items-center justify-center rounded-sm font-semibold ${
                        isBooked
                          ? 'bg-zinc-200/50 text-zinc-400 line-through dark:bg-zinc-800/40 dark:text-zinc-600'
                          : 'bg-green-500/10 text-green-700 border border-green-500/20 dark:bg-green-950/20 dark:text-green-400'
                      }`}
                    >
                      {dayNum}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Booking Form Card */}
          <div className="sticky top-24">
            <div className="glass-panel rounded-lg p-6 shadow-xl border-t-4 border-brand-500">
              {success && confirmedBooking ? (
                /* Booking Success Content */
                <div className="text-center py-6">
                  <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400">
                    <CheckCircle size={36} />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-950 dark:text-white">Stay Confirmed!</h3>
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
                    Thank you, <strong>{fullName}</strong>. Your luxury suite reservation is locked.
                  </p>

                  <div className="my-6 rounded-md bg-brand-50 dark:bg-zinc-900 p-4 text-left border border-zinc-200 dark:border-zinc-800 text-xs space-y-2">
                    <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1.5 font-semibold text-brand-600 dark:text-brand-400">
                      <span>Room ID</span>
                      <span>{confirmedBooking.id?.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Category</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-100">{room.name} Room</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Dates</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-100">{checkIn} to {checkOut}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Total Price</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-100">${totalCost.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSuccess(false);
                      setConfirmedBooking(null);
                      setHasSearched(false);
                      setCheckIn('');
                      setCheckOut('');
                      setFullName('');
                      setEmail('');
                      setPhone('');
                      setNationality('');
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-brand-500 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-brand-600 dark:text-ink-950 transition"
                  >
                    Book Another Stay
                  </button>
                </div>
              ) : (
                /* Availability Check & Booking Flow */
                <div>
                  <h3 className="font-heading text-xl font-semibold mb-4 text-zinc-950 dark:text-white flex items-center gap-2">
                    <Calendar size={18} className="text-brand-500" />
                    Reservation Portal
                  </h3>

                  {errorMsg && (
                    <div className="p-3 mb-4 rounded bg-red-50 text-red-700 text-xs font-medium dark:bg-red-950/40 dark:text-red-300">
                      {errorMsg}
                    </div>
                  )}

                  {/* Step 1: Availability Dates */}
                  <form onSubmit={handleCheckAvailability} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Check-in</label>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="mt-1.5 w-full rounded border border-zinc-300 bg-white p-2.5 text-xs outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900 transition"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Check-out</label>
                        <input
                          type="date"
                          required
                          min={checkIn || new Date().toISOString().split('T')[0]}
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="mt-1.5 w-full rounded border border-zinc-300 bg-white p-2.5 text-xs outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900 transition"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Guests</label>
                      <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-xs focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900"
                      >
                        <option value={1}>1 Guest</option>
                        <option value={2}>2 Guests</option>
                        <option value={3}>3 Guests</option>
                        <option value={4}>4 Guests</option>
                      </select>
                    </div>

                    {!hasSearched && (
                      <button
                        type="submit"
                        disabled={checkingAvailability}
                        className="w-full inline-flex items-center justify-center gap-2 rounded bg-brand-500 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-brand-600 dark:text-ink-950 transition"
                      >
                        {checkingAvailability ? 'Checking...' : 'Check Availability'}
                      </button>
                    )}
                  </form>

                  {/* Step 2: Guest Booking details if room available */}
                  {hasSearched && (
                    <div className="mt-6 border-t border-zinc-200 dark:border-zinc-800 pt-6 space-y-4">
                      {availableRooms.length > 0 ? (
                        <>
                          <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-700 rounded text-xs dark:bg-green-950/20 dark:text-green-400 font-semibold">
                            ✓ Standard availability verified for {availableRooms[0].room_number}.
                          </div>

                          <form onSubmit={handleReserve} className="space-y-4">
                            <div>
                              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Full Name *</label>
                              <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Sarah Miller"
                                className="mt-1 w-full rounded border border-zinc-300 bg-white p-2.5 text-xs outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Email</label>
                                <input
                                  type="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="sarah@example.com"
                                  className="mt-1 w-full rounded border border-zinc-300 bg-white p-2.5 text-xs outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Phone</label>
                                <input
                                  type="tel"
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  placeholder="+251..."
                                  className="mt-1 w-full rounded border border-zinc-300 bg-white p-2.5 text-xs outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Nationality</label>
                              <input
                                type="text"
                                value={nationality}
                                onChange={(e) => setNationality(e.target.value)}
                                placeholder="American"
                                className="mt-1 w-full rounded border border-zinc-300 bg-white p-2.5 text-xs outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900"
                              />
                            </div>

                            {/* Summary cost */}
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
                              <div className="flex justify-between">
                                <span>Daily Base Cost</span>
                                <span className="font-semibold">${room.price}.00</span>
                              </div>
                              <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                                <span>Nights</span>
                                <span>{nights}</span>
                              </div>
                              <div className="flex justify-between font-bold text-zinc-800 dark:text-white pt-1">
                                <span>Total Price</span>
                                <span>${totalCost.toFixed(2)}</span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setHasSearched(false)}
                                className="flex-1 rounded border border-zinc-300 py-3 text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition text-center"
                              >
                                Modify Dates
                              </button>
                              <button
                                type="submit"
                                disabled={bookingLoading}
                                className="flex-[2] inline-flex items-center justify-center gap-2 rounded bg-green-700 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-green-600 disabled:bg-zinc-400 transition shadow-lg shadow-green-700/20"
                              >
                                {bookingLoading ? 'Confirming...' : 'Book Room Now'}
                              </button>
                            </div>
                          </form>
                        </>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-sm text-zinc-500">
                            No rooms are available for these dates.
                          </p>
                          <button
                            onClick={() => setHasSearched(false)}
                            className="mt-3 text-xs font-bold uppercase tracking-wider text-brand-500 hover:text-brand-600"
                          >
                            Select Different Dates
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Trust indicator badges */}
                  <div className="mt-6 border-t border-zinc-200 dark:border-zinc-800 pt-4 flex justify-between text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-brand-500" /> Secure Payment</span>
                    <span className="flex items-center gap-1"><Star size={12} className="text-brand-500" /> Best Price</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
