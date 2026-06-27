import { useState } from 'react';
import {
  CalendarCheck, Search, Bed, Loader2, Sparkles, CheckCircle,
  Wifi, Users, Star, ChevronRight, ShieldCheck, Tag
} from 'lucide-react';
import { api } from '../services/api.js';

// Room type badge colours
const TYPE_COLOURS = {
  Single:    'bg-teal-100  text-teal-700  dark:bg-teal-950/60  dark:text-teal-300',
  Twin:      'bg-rose-100  text-rose-700  dark:bg-rose-950/60  dark:text-rose-300',
  Standard:  'bg-zinc-100  text-zinc-700  dark:bg-zinc-800  dark:text-zinc-300',
  Deluxe:    'bg-blue-100  text-blue-700  dark:bg-blue-950/60  dark:text-blue-300',
  Executive: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
  Suite:     'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
};

function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000));
}

export function Booking() {
  const [dates, setDates]               = useState({ checkInDate: '', checkOutDate: '' });
  const [rooms, setRooms]               = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [customer, setCustomer]         = useState({ fullName: '', email: '', phone: '', nationality: '' });
  const [loading, setLoading]           = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage]           = useState('');
  const [isError, setIsError]           = useState(false);
  const [success, setSuccess]           = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [searched, setSearched]         = useState(false);

  const nights = nightsBetween(dates.checkInDate, dates.checkOutDate);
  const totalCost = selectedRoom ? Number(selectedRoom.base_price) * nights : 0;

  async function searchRooms(e) {
    e.preventDefault();
    if (!dates.checkInDate || !dates.checkOutDate) {
      setMessage('Please select check-in and check-out dates.');
      setIsError(true);
      return;
    }
    if (new Date(dates.checkOutDate) <= new Date(dates.checkInDate)) {
      setMessage('Check-out date must be after check-in date.');
      setIsError(true);
      return;
    }
    setLoading(true);
    setMessage('');
    setIsError(false);
    setSelectedRoom(null);
    setSearched(true);
    try {
      const response = await api.get('/hotel/availability', {
        params: { checkIn: dates.checkInDate, checkOut: dates.checkOutDate }
      });
      setRooms(response.data.data || []);
      if ((response.data.data || []).length === 0) {
        setMessage('No rooms are available for the selected dates.');
        setIsError(false);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to fetch available rooms.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  async function submitBooking(e) {
    e.preventDefault();
    if (!selectedRoom) { setMessage('Please select a room.'); setIsError(true); return; }
    if (!customer.fullName) { setMessage('Please enter your full name.'); setIsError(true); return; }
    setBookingLoading(true);
    setMessage('');
    setIsError(false);
    try {
      const res = await api.post('/hotel/bookings', {
        customer,
        roomId: selectedRoom.id,
        checkInDate: dates.checkInDate,
        checkOutDate: dates.checkOutDate,
      });
      setConfirmedBooking(res.data.data);
      setSuccess(true);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking submission failed. Please try again.');
      setIsError(true);
    } finally {
      setBookingLoading(false);
    }
  }

  function resetAll() {
    setSuccess(false);
    setSearched(false);
    setRooms([]);
    setSelectedRoom(null);
    setDates({ checkInDate: '', checkOutDate: '' });
    setCustomer({ fullName: '', email: '', phone: '', nationality: '' });
    setMessage('');
    setIsError(false);
    setConfirmedBooking(null);
  }

  /* ── Success screen ─────────────────────────────────────────────────── */
  if (success && confirmedBooking) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center reveal-up">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400">
          <CheckCircle size={44} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight dark:text-white">Booking Confirmed!</h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300">
          Thank you, <strong>{customer.fullName}</strong>! Your reservation is secured.
        </p>

        {/* Summary card */}
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand-700 dark:text-brand-50">
            Reservation Summary
          </h2>
          <dl className="grid gap-3 text-sm">
            {[
              ['Booking ID',   confirmedBooking.id?.slice(0, 8).toUpperCase() + '…'],
              ['Room',         `Room ${selectedRoom.room_number} — ${selectedRoom.room_type}`],
              ['Check-in',     dates.checkInDate],
              ['Check-out',    dates.checkOutDate],
              ['Nights',       nights],
              ['Total cost',   `$${totalCost.toFixed(2)}`],
              ['Status',       confirmedBooking.status || 'Confirmed'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-zinc-100 pb-2 last:border-0 last:pb-0 dark:border-zinc-800">
                <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
                <dd className="font-medium dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="mt-4 text-sm text-zinc-500">
          Our reception team will verify the details and prepare for your arrival. A confirmation will be sent to {customer.email || 'you'}.
        </p>
        <button
          onClick={resetAll}
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-brand-700 px-6 py-3 font-semibold text-white shadow-lg hover:bg-brand-500 transition-colors"
        >
          <CalendarCheck size={18} />
          Book another stay
        </button>
      </section>
    );
  }

  /* ── Main booking flow ──────────────────────────────────────────────── */
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10 reveal-up">
        <p className="text-sm font-semibold uppercase tracking-[.25em] text-brand-700 dark:text-brand-50">Reserve your stay</p>
        <h1 className="mt-3 text-4xl font-bold md:text-5xl">Online Booking</h1>
        <p className="mt-4 max-w-2xl mx-auto text-zinc-600 dark:text-zinc-300">
          Select your dates, find your perfect room, and secure your booking at Vora Addis Hotel instantly.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] items-start">

        {/* ── Left column ─────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Step 1 — Dates */}
          <form
            id="booking-date-form"
            onSubmit={searchRooms}
            className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 reveal-up"
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-700 text-xs font-bold text-white">1</span>
              Choose Dates
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                <span>Check-in</span>
                <input
                  id="checkin-date"
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-2 w-full rounded-md border border-zinc-300 bg-white p-3 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-zinc-700 dark:bg-zinc-950 transition"
                  value={dates.checkInDate}
                  onChange={(e) => setDates({ ...dates, checkInDate: e.target.value })}
                />
              </label>
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                <span>Check-out</span>
                <input
                  id="checkout-date"
                  type="date"
                  required
                  min={dates.checkInDate || new Date().toISOString().split('T')[0]}
                  className="mt-2 w-full rounded-md border border-zinc-300 bg-white p-3 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-zinc-700 dark:bg-zinc-950 transition"
                  value={dates.checkOutDate}
                  onChange={(e) => setDates({ ...dates, checkOutDate: e.target.value })}
                />
              </label>
            </div>
            {nights > 0 && (
              <p className="mt-3 text-sm text-brand-700 dark:text-brand-50 font-medium">
                {nights} night{nights !== 1 ? 's' : ''} selected
              </p>
            )}
            <button
              id="search-rooms-btn"
              type="submit"
              disabled={loading}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-md bg-brand-700 px-5 py-3 font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-500 disabled:bg-zinc-400 disabled:cursor-not-allowed transition"
            >
              {loading ? <><Loader2 className="animate-spin" size={18} /> Searching…</> : <><Search size={18} /> Search Available Rooms</>}
            </button>
          </form>

          {/* Step 3 — Guest details (visible after room selected) */}
          {selectedRoom && (
            <form
              id="booking-guest-form"
              onSubmit={submitBooking}
              className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 reveal-up"
            >
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-700 text-xs font-bold text-white">3</span>
                Guest Information
              </h2>
              <div className="grid gap-4">
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  <span>Full name <span className="text-red-500">*</span></span>
                  <input
                    id="guest-fullname"
                    type="text"
                    required
                    placeholder="John Doe"
                    className="mt-2 w-full rounded-md border border-zinc-300 bg-white p-3 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-zinc-700 dark:bg-zinc-950 transition"
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                    <span>Email</span>
                    <input
                      id="guest-email"
                      type="email"
                      placeholder="john@example.com"
                      className="mt-2 w-full rounded-md border border-zinc-300 bg-white p-3 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-zinc-700 dark:bg-zinc-950 transition"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    />
                  </label>
                  <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                    <span>Phone</span>
                    <input
                      id="guest-phone"
                      type="tel"
                      placeholder="+251…"
                      className="mt-2 w-full rounded-md border border-zinc-300 bg-white p-3 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-zinc-700 dark:bg-zinc-950 transition"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    />
                  </label>
                </div>
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  <span>Nationality</span>
                  <input
                    id="guest-nationality"
                    type="text"
                    placeholder="Ethiopian"
                    className="mt-2 w-full rounded-md border border-zinc-300 bg-white p-3 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-zinc-700 dark:bg-zinc-950 transition"
                    value={customer.nationality}
                    onChange={(e) => setCustomer({ ...customer, nationality: e.target.value })}
                  />
                </label>
              </div>

              {/* Cost summary */}
              <div className="mt-5 rounded-lg bg-brand-50 p-4 dark:bg-zinc-800">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-700 dark:text-brand-50 mb-2">Booking Summary</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                    <span>Room {selectedRoom.room_number} ({selectedRoom.room_type})</span>
                    <span>${Number(selectedRoom.base_price).toFixed(2)}/night</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                    <span>Nights</span>
                    <span>{nights}</span>
                  </div>
                  <div className="flex justify-between border-t border-brand-200 pt-2 font-bold text-brand-700 dark:border-zinc-700 dark:text-brand-50">
                    <span>Total</span>
                    <span>${totalCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                id="confirm-booking-btn"
                type="submit"
                disabled={bookingLoading}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-md bg-green-700 px-5 py-3 font-semibold text-white shadow-lg hover:bg-green-600 disabled:bg-zinc-400 disabled:cursor-not-allowed transition"
              >
                {bookingLoading
                  ? <><Loader2 className="animate-spin" size={18} /> Confirming…</>
                  : <><CalendarCheck size={18} /> Confirm Booking</>}
              </button>
            </form>
          )}

          {/* Message banner */}
          {message && (
            <div className={`p-4 rounded-lg text-sm ${isError ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300' : 'bg-blue-50 text-blue-700 dark:bg-zinc-900 dark:text-blue-300'}`}>
              {message}
            </div>
          )}
        </div>

        {/* ── Right column — room list ─────────────────────────────────── */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 reveal-up-delay-1 min-h-[420px]">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-700 text-xs font-bold text-white">2</span>
            Select a Room
          </h2>

          {/* Idle state */}
          {!searched && (
            <div className="flex flex-col items-center justify-center h-72 text-zinc-400 dark:text-zinc-500 text-center gap-3">
              <CalendarCheck size={52} className="stroke-[1.2]" />
              <p className="max-w-xs text-sm">Enter your dates above and click <strong>Search</strong> to see available rooms.</p>
            </div>
          )}

          {/* Loading */}
          {searched && loading && (
            <div className="flex flex-col items-center justify-center h-72 text-brand-700 dark:text-brand-50 gap-3">
              <Loader2 className="animate-spin" size={52} />
              <p className="text-sm">Checking availability…</p>
            </div>
          )}

          {/* No rooms */}
          {searched && !loading && rooms.length === 0 && (
            <div className="flex flex-col items-center justify-center h-72 text-zinc-400 dark:text-zinc-500 gap-3">
              <Bed size={52} className="stroke-[1.2]" />
              <p className="text-sm">No rooms are available for those dates. Try different dates.</p>
            </div>
          )}

          {/* Room cards */}
          {searched && !loading && rooms.length > 0 && (
            <div className="grid gap-3 max-h-[640px] overflow-y-auto pr-1">
              {rooms.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                const amenities  = (room.amenities || '').split(',').map(a => a.trim()).filter(Boolean);
                const typeColor  = TYPE_COLOURS[room.room_type] || TYPE_COLOURS.Standard;
                return (
                  <div
                    key={room.id}
                    id={`room-card-${room.id}`}
                    onClick={() => { setSelectedRoom(room); setMessage(''); setIsError(false); }}
                    className={`group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-brand-700 bg-brand-50/40 dark:border-brand-50/70 dark:bg-zinc-800'
                        : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    {/* Selected tick */}
                    {isSelected && (
                      <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-brand-700 text-white dark:bg-brand-50 dark:text-zinc-900">
                        <ShieldCheck size={14} />
                      </span>
                    )}

                    {/* Room header */}
                    <div className="flex items-start justify-between pr-6">
                      <div>
                        <h3 className="font-bold text-base flex items-center gap-2">
                          <Bed size={16} className="text-brand-700 dark:text-brand-50 shrink-0" />
                          Room {room.room_number}
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColor}`}>
                            {room.room_type}
                          </span>
                        </h3>
                        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Floor {room.floor}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xl font-bold text-brand-700 dark:text-brand-50">
                          ${Number(room.base_price).toFixed(0)}
                        </span>
                        <p className="text-xs text-zinc-500">/night</p>
                        {nights > 0 && (
                          <p className="text-xs font-semibold text-green-700 dark:text-green-400 mt-0.5">
                            ${(Number(room.base_price) * nights).toFixed(0)} total
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Capacity */}
                    <div className="mt-3 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <Users size={12} />
                      <span>Up to {room.capacity} guest{room.capacity !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Amenities */}
                    {amenities.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {amenities.map((a) => (
                          <span key={a} className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                            {a === 'Wi-Fi' ? <Wifi size={10} /> : <Tag size={10} />}
                            {a}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CTA hint */}
                    {!isSelected && (
                      <p className="mt-3 text-xs text-zinc-400 flex items-center gap-1 group-hover:text-brand-700 dark:group-hover:text-brand-50 transition-colors">
                        <ChevronRight size={12} /> Click to select this room
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 reveal-up">
        {[
          { icon: <ShieldCheck size={22} />, label: 'Secure Booking' },
          { icon: <Star size={22} />,        label: 'Best Rate Guarantee' },
          { icon: <CalendarCheck size={22} />, label: 'Free Cancellation*' },
          { icon: <Sparkles size={22} />,    label: 'Instant Confirmation' },
        ].map(({ icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-brand-700 dark:text-brand-50">{icon}</span>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
