import { useState } from 'react';
import { Mail, Search, Calendar, BedDouble, CreditCard, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyReservations, cancelReservation } from '../services/api.js';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_PILL = {
  Confirmed:  'bg-blue-100   text-blue-700  dark:bg-blue-950/60  dark:text-blue-300',
  Pending:    'bg-amber-100  text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  CheckedIn:  'bg-green-100  text-green-700 dark:bg-green-950/60 dark:text-green-300',
  CheckedOut: 'bg-zinc-100   text-zinc-600  dark:bg-zinc-800     dark:text-zinc-400',
  Cancelled:  'bg-red-100    text-red-700   dark:bg-red-950/60   dark:text-red-300',
};

const PAYMENT_PILL = {
  Paid:    'bg-green-100  text-green-700  dark:bg-green-950/60  dark:text-green-300',
  Pending: 'bg-amber-100  text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  Refunded: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
};

export function MyBookings() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cancellingId, setCancellingId] = useState(null); // ID of booking awaiting confirmation
  const [cancelLoading, setCancelLoading] = useState(false);

  async function handleSearch(e) {
    if (e) e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setBookings(null);
    try {
      const data = await getMyReservations(email);
      setBookings(data);
      if (data.length === 0) {
        setError('No reservations found for this email address.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reservations. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id) {
    setCancelLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await cancelReservation(id, email);
      setSuccessMsg('Your reservation was cancelled successfully.');
      setCancellingId(null);
      // Refresh the search
      const data = await getMyReservations(email);
      setBookings(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel reservation. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  }

  function formatDate(dStr) {
    return new Date(dStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function calculateNights(start, end) {
    const diffTime = Math.abs(new Date(end) - new Date(start));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 md:py-20">
      <div className="mb-8 md:mb-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-brand-600 transition dark:text-zinc-400 dark:hover:text-brand-400">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        {/* Left Search Panel */}
        <div className="reveal-up rounded-lg bg-zinc-950 p-8 text-white shadow-2xl shadow-zinc-950/20">
          <span className="grid h-12 w-12 place-items-center rounded-md bg-white text-brand-700">
            <Mail size={22} />
          </span>
          <h1 className="mt-5 text-3xl font-semibold font-heading tracking-wide">My Bookings</h1>
          <p className="mt-4 text-sm leading-relaxed text-zinc-300">
            Enter the email address you used during reservation to view details, check payment status, or cancel bookings.
          </p>

          <form onSubmit={handleSearch} className="mt-8 grid gap-4">
            <div className="relative">
              <input
                required
                type="email"
                className="w-full rounded-md border border-zinc-800 bg-zinc-900/60 p-3.5 pl-10 text-sm text-white outline-none focus:-translate-y-0.5 focus:border-brand-500 transition focus:ring-4 focus:ring-brand-500/10"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Search className="absolute left-3 top-3.5 text-zinc-500" size={18} />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-700 px-5 py-3.5 font-medium text-white shadow-lg shadow-brand-700/20 hover:-translate-y-0.5 hover:bg-brand-500 active:translate-y-0 disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Searching...
                </>
              ) : (
                'Find Bookings'
              )}
            </button>
          </form>
        </div>

        {/* Right Bookings Results */}
        <div className="flex flex-col gap-6">
          {successMsg && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-300 border border-green-200 dark:border-green-800/40">
              {successMsg}
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300 border border-red-200 dark:border-red-800/40">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {bookings === null && !loading && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel flex flex-col items-center justify-center py-20 text-center rounded-lg p-6"
              >
                <BedDouble size={48} className="text-zinc-300 dark:text-zinc-700 mb-4" />
                <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 font-heading">Lookup Reservations</h3>
                <p className="mt-2 text-sm text-zinc-400 max-w-sm">
                  Search by your email to view existing bookings, statuses, and costs.
                </p>
              </motion.div>
            )}

            {bookings && bookings.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid gap-6"
              >
                {bookings.map((booking) => {
                  const isUpcoming = new Date(booking.check_in_date) > new Date();
                  const canCancel = isUpcoming && ['Pending', 'Confirmed'].includes(booking.status);
                  const nights = calculateNights(booking.check_in_date, booking.check_out_date);

                  return (
                    <div
                      key={booking.id}
                      className="glass-panel overflow-hidden rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition hover:shadow-md"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Reservation Ref</p>
                          <p className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">{booking.id}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_PILL[booking.status] || 'bg-zinc-100 text-zinc-600'}`}>
                            {booking.status}
                          </span>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PAYMENT_PILL[booking.payment_status] || 'bg-zinc-100 text-zinc-600'}`}>
                            {booking.payment_status === 'Paid' ? 'Paid' : 'Payment: ' + booking.payment_status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                            <BedDouble size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Room</p>
                            <p className="text-sm font-semibold dark:text-white">
                              {booking.room_type} (Room {booking.room_number})
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                            <Calendar size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Duration</p>
                            <p className="text-sm font-semibold dark:text-white">
                              {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                              <span className="block text-xs font-normal text-zinc-400">{nights} {nights === 1 ? 'night' : 'nights'}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                            <CreditCard size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Total Cost</p>
                            <p className="text-sm font-semibold dark:text-white">
                              ${booking.total_cost.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Cancel Block */}
                      {canCancel && (
                        <div className="mt-6 border-t border-zinc-100 pt-4 flex items-center justify-end dark:border-zinc-800">
                          {cancellingId === booking.id ? (
                            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-3 rounded-md w-full sm:w-auto sm:justify-end">
                              <span className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300 font-medium">
                                <AlertTriangle size={14} /> Are you sure you want to cancel?
                              </span>
                              <button
                                disabled={cancelLoading}
                                onClick={() => handleCancel(booking.id)}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition disabled:opacity-50"
                              >
                                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
                              </button>
                              <button
                                disabled={cancelLoading}
                                onClick={() => setCancellingId(null)}
                                className="bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold px-3 py-1.5 rounded transition"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setCancellingId(booking.id)}
                              className="text-xs font-semibold border border-red-200 hover:border-red-500 text-red-600 dark:border-red-900/60 dark:hover:border-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 px-4 py-2 rounded transition"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
