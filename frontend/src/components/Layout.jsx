import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CalendarCheck, Menu, Moon, Sun, X, MapPin, Phone, Mail, LogOut, LayoutDashboard, UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { navItems } from '../data/content.js';
import { currentUser, logout } from '../services/api.js';

// Role badge colours
const ROLE_COLOURS = {
  Administrator: 'bg-red-100    text-red-700   dark:bg-red-950/60   dark:text-red-300',
  Manager:       'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
  Receptionist:  'bg-blue-100   text-blue-700  dark:bg-blue-950/60   dark:text-blue-300',
  Accountant:    'bg-green-100  text-green-700 dark:bg-green-950/60  dark:text-green-300',
  Guest:         'bg-zinc-100   text-zinc-700  dark:bg-zinc-800      dark:text-zinc-300',
};

export function Layout() {
  const [dark, setDark]   = useState(() => {
    try { return localStorage.getItem('vora_dark_mode') === 'true'; } catch { return false; }
  });
  const [open, setOpen]   = useState(false);
  const location          = useLocation();
  const navigate          = useNavigate();
  const user              = currentUser();
  const isStaff           = user && user.role !== 'Guest';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('vora_dark_mode', String(dark)); } catch {}
  }, [dark]);
  useEffect(() => { window.scrollTo(0, 0); setOpen(false); }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <motion.header
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 glass-nav"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3 font-heading tracking-wide">
            <span className="grid h-10 w-10 place-items-center bg-brand-900 text-brand-400 font-semibold shadow-lg shadow-brand-900/20 dark:bg-brand-400 dark:text-brand-900">VA</span>
            <span className="leading-tight">
              <span className="block text-lg font-semibold uppercase tracking-widest">Vora Addis</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Hotel Management</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
                `relative px-3 py-1.5 text-[13px] font-medium tracking-wide rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-600 dark:bg-brand-400/15 dark:text-brand-400 font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-white/5'
                }`
              }>{label}</NavLink>
            ))}
            {/* Dashboard link — only for logged-in staff */}
            {isStaff && (
              <NavLink to="/dashboard" className={({ isActive }) =>
                `relative px-3 py-1.5 text-[13px] font-medium tracking-wide rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-600 dark:bg-brand-400/15 dark:text-brand-400 font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-white/5'
                }`
              }>
                <LayoutDashboard size={13} />
                Dashboard
              </NavLink>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link to="/booking" className="hidden sm:inline-flex h-10 items-center gap-2 rounded-none bg-brand-900 px-5 text-sm font-medium uppercase tracking-widest text-brand-100 shadow-lg transition hover:bg-brand-700 dark:bg-brand-500 dark:text-ink-950 dark:hover:bg-brand-400">
              <CalendarCheck size={16} /> Book
            </Link>

            {/* User badge (when logged in) */}
            {user ? (
              <div className="hidden lg:flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                  <UserCircle size={16} className="text-zinc-500" />
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{user.fullName?.split(' ')[0]}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ROLE_COLOURS[user.role] || ROLE_COLOURS.Guest}`}>
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm transition hover:border-red-300 hover:text-red-600 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-red-700 dark:hover:text-red-400"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link to="/my-bookings" className="inline-flex h-9 items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-700 shadow-sm transition hover:border-brand-500 hover:text-brand-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                  My Bookings
                </Link>
                <Link to="/login" className="inline-flex h-9 items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-700 shadow-sm transition hover:border-brand-500 hover:text-brand-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                  Staff Login
                </Link>
              </div>
            )}

            <button
              aria-label="Toggle dark mode"
              onClick={() => setDark(!dark)}
              className="grid h-10 w-10 place-items-center text-ink-800 hover:text-brand-600 dark:text-ink-100 dark:hover:text-brand-400"
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              aria-label="Open menu"
              onClick={() => setOpen(!open)}
              className="grid h-10 w-10 place-items-center text-ink-800 lg:hidden dark:text-ink-100"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute w-full border-t border-brand-500/10 glass-nav lg:hidden overflow-hidden"
            >
              <nav className="mx-auto flex max-w-7xl flex-col gap-0.5 px-4 py-5 text-sm font-medium">
                {navItems.map(([to, label]) => (
                  <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-2.5 rounded-lg text-[13px] tracking-wide transition-all ${isActive ? 'bg-brand-500/10 text-brand-600 dark:bg-brand-400/10 dark:text-brand-400 font-semibold border-l-2 border-brand-500' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-100 border-l-2 border-transparent'}`
                    }>{label}</NavLink>
                ))}
                {isStaff && (
                  <NavLink to="/dashboard" onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-2.5 rounded-lg text-[13px] tracking-wide transition-all flex items-center gap-2 ${isActive ? 'bg-brand-500/10 text-brand-600 dark:bg-brand-400/10 dark:text-brand-400 font-semibold border-l-2 border-brand-500' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-100 border-l-2 border-transparent'}`
                    }><LayoutDashboard size={13} /> Dashboard</NavLink>
                )}
                {user ? (
                  <button
                    onClick={() => { setOpen(false); handleLogout(); }}
                    className="mt-2 flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <LogOut size={14} /> Logout ({user.fullName?.split(' ')[0]})
                  </button>
                ) : (
                  <>
                    <Link to="/my-bookings" onClick={() => setOpen(false)}
                      className="mt-2 block px-4 py-3 uppercase tracking-widest text-brand-700 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-ink-900">
                      My Bookings
                    </Link>
                    <Link to="/login" onClick={() => setOpen(false)}
                      className="mt-2 block px-4 py-3 uppercase tracking-widest text-brand-700 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-ink-900">
                      Staff Login
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <footer className="mt-auto border-t border-brand-500/20 bg-ink-950 px-4 py-16 text-sm text-zinc-300 dark:bg-[#02050a] dark:border-ink-900">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
          <div>
            <Link to="/" className="flex items-center gap-3 font-heading tracking-wide mb-6">
              <span className="grid h-10 w-10 place-items-center bg-brand-500 text-ink-950 font-semibold">VA</span>
              <span className="leading-tight">
                <span className="block text-lg font-semibold uppercase tracking-widest text-white">Vora Addis</span>
                <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-brand-400">Hotel Management</span>
              </span>
            </Link>
            <p className="text-zinc-400 leading-relaxed max-w-sm">A modern luxury hotel experience offering seamless hospitality, dining, wellness, and nightlife in the heart of Addis Ababa.</p>
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold uppercase tracking-widest text-white mb-6">Contact Us</h3>
            <ul className="space-y-4 text-zinc-400">
              <li className="flex items-center gap-3"><MapPin size={18} className="text-brand-500" /> Bambis, Addis Ababa, Ethiopia</li>
              <li className="flex items-center gap-3"><Phone size={18} className="text-brand-500" /> +251 11 1302923</li>
              <li className="flex items-center gap-3"><Mail size={18} className="text-brand-500" /> reservations@voraaddis.example</li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold uppercase tracking-widest text-white mb-6">Portal Access</h3>
            <p className="text-zinc-400 leading-relaxed mb-4">Access guest bookings or log in to the management dashboard.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/my-bookings" className="inline-block border border-brand-500 px-4 py-2 text-brand-400 transition hover:bg-brand-500 hover:text-ink-950 uppercase tracking-widest text-xs font-semibold">My Bookings</Link>
              {user
                ? <Link to="/dashboard" className="inline-block border border-brand-500 px-4 py-2 text-brand-400 transition hover:bg-brand-500 hover:text-ink-950 uppercase tracking-widest text-xs font-semibold">Staff Dashboard</Link>
                : <Link to="/login"     className="inline-block border border-brand-500 px-4 py-2 text-brand-400 transition hover:bg-brand-500 hover:text-ink-950 uppercase tracking-widest text-xs font-semibold">Staff Login</Link>
              }
            </div>
          </div>
        </div>
        <div className="mx-auto mt-16 max-w-7xl border-t border-zinc-800 pt-8 text-center text-zinc-500">
          <p>&copy; {new Date().getFullYear()} Vora Addis Hotel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
