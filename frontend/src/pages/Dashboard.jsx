import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line
} from 'recharts';
import {
  BedDouble, CalendarDays, Users, WalletCards, TrendingUp, Dumbbell,
  Martini, Soup, CreditCard, LogOut, Search, CheckCircle, XCircle,
  Clock, Building2, ShieldCheck, Calculator, UserCog, RefreshCw,
  ArrowRightCircle, ChevronRight, Loader2, Mail
} from 'lucide-react';
import { api, currentUser, logout } from '../services/api.js';

// ── Shared helpers ────────────────────────────────────────────────────────────
const STATUS_PILL = {
  Confirmed:  'bg-blue-100   text-blue-700  dark:bg-blue-950/60  dark:text-blue-300',
  Pending:    'bg-amber-100  text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  CheckedIn:  'bg-green-100  text-green-700 dark:bg-green-950/60 dark:text-green-300',
  CheckedOut: 'bg-zinc-100   text-zinc-600  dark:bg-zinc-800     dark:text-zinc-400',
  Cancelled:  'bg-red-100    text-red-700   dark:bg-red-950/60   dark:text-red-300',
  Completed:  'bg-green-100  text-green-700 dark:bg-green-950/60 dark:text-green-300',
  Refunded:   'bg-purple-100 text-purple-700',
};

function StatusPill({ status }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_PILL[status] || 'bg-zinc-100 text-zinc-600'}`}>
      {status}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, sub, colour = 'brand' }) {
  const colours = {
    brand:  'bg-brand-50   text-brand-700  dark:bg-brand-950/40 dark:text-brand-300',
    green:  'bg-green-50   text-green-700  dark:bg-green-950/40 dark:text-green-300',
    blue:   'bg-blue-50    text-blue-700   dark:bg-blue-950/40  dark:text-blue-300',
    amber:  'bg-amber-50   text-amber-700  dark:bg-amber-950/40 dark:text-amber-300',
    red:    'bg-red-50     text-red-700    dark:bg-red-950/40   dark:text-red-300',
  };
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
        <span className={`grid h-10 w-10 place-items-center rounded-lg ${colours[colour] || colours.brand}`}>
          <Icon size={19} />
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold dark:text-white">{value ?? '—'}</p>
      {sub && <p className="mt-1 text-xs text-zinc-400">{sub}</p>}
    </div>
  );
}

function SectionCard({ title, children, action }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <h2 className="font-semibold dark:text-white">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ReservationTable({ rows, onCheckin, onCheckout }) {
  if (!rows?.length) return <p className="py-6 text-center text-sm text-zinc-400">No reservations found.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-100 dark:border-zinc-800 text-left text-xs uppercase tracking-wider text-zinc-400">
            <th className="pb-2 pr-4">Guest</th>
            <th className="pb-2 pr-4">Room</th>
            <th className="pb-2 pr-4">Check-in</th>
            <th className="pb-2 pr-4">Check-out</th>
            <th className="pb-2 pr-4">Total</th>
            <th className="pb-2 pr-4">Status</th>
            {(onCheckin || onCheckout) && <th className="pb-2">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
              <td className="py-2.5 pr-4 font-medium dark:text-white">{r.customer_name || '—'}</td>
              <td className="py-2.5 pr-4 text-zinc-500">{r.room_number} <span className="text-xs text-zinc-400">({r.room_type})</span></td>
              <td className="py-2.5 pr-4 text-zinc-500">{r.check_in_date}</td>
              <td className="py-2.5 pr-4 text-zinc-500">{r.check_out_date}</td>
              <td className="py-2.5 pr-4 font-semibold text-brand-700 dark:text-brand-300">${Number(r.total_cost).toFixed(0)}</td>
              <td className="py-2.5 pr-4"><StatusPill status={r.status} /></td>
              {onCheckin && r.status === 'Confirmed' && (
                <td className="py-2.5">
                  <button onClick={() => onCheckin(r)} className="inline-flex items-center gap-1 rounded-md bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-500 transition">
                    <CheckCircle size={12} /> Check In
                  </button>
                </td>
              )}
              {onCheckout && r.status === 'CheckedIn' && r.check_in_id && (
                <td className="py-2.5">
                  <button onClick={() => onCheckout(r)} className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-500 transition">
                    <ArrowRightCircle size={12} /> Check Out
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Role-specific sidebar nav configs ─────────────────────────────────────────
const NAV = {
  Administrator: [
    { id: 'overview',    label: 'Overview',       icon: TrendingUp },
    { id: 'reservations',label: 'Reservations',   icon: CalendarDays },
    { id: 'rooms',       label: 'Rooms',          icon: BedDouble },
    { id: 'customers',   label: 'Customers',      icon: Users },
    { id: 'payments',    label: 'Payments',       icon: WalletCards },
    { id: 'staff',       label: 'Staff',          icon: UserCog },
    { id: 'restaurant',  label: 'Restaurant',     icon: Soup },
    { id: 'gym',         label: 'Gym',            icon: Dumbbell },
    { id: 'nightclub',   label: 'Night Club',     icon: Martini },
    { id: 'meetings',    label: 'Meeting Rooms',  icon: CreditCard },
  ],
  Manager: [
    { id: 'overview',    label: 'Overview',       icon: TrendingUp },
    { id: 'reservations',label: 'Reservations',   icon: CalendarDays },
    { id: 'rooms',       label: 'Rooms',          icon: BedDouble },
    { id: 'customers',   label: 'Customers',      icon: Users },
    { id: 'staff',       label: 'Staff',          icon: UserCog },
    { id: 'restaurant',  label: 'Restaurant',     icon: Soup },
    { id: 'gym',         label: 'Gym',            icon: Dumbbell },
    { id: 'nightclub',   label: 'Night Club',     icon: Martini },
    { id: 'meetings',    label: 'Meeting Rooms',  icon: CreditCard },
  ],
  Receptionist: [
    { id: 'today',       label: "Today's Activity", icon: Clock },
    { id: 'reservations',label: 'All Reservations', icon: CalendarDays },
    { id: 'rooms',       label: 'Room Status',      icon: BedDouble },
  ],
  Accountant: [
    { id: 'finance',     label: 'Financial Overview', icon: Calculator },
    { id: 'payments',    label: 'Payments',           icon: WalletCards },
    { id: 'reservations',label: 'Reservations',       icon: CalendarDays },
  ],
};

const ROLE_META = {
  Administrator: { colour: 'bg-red-600',    icon: ShieldCheck,  label: 'Administrator' },
  Manager:       { colour: 'bg-violet-600', icon: Building2,    label: 'Manager' },
  Receptionist:  { colour: 'bg-blue-600',   icon: Users,        label: 'Receptionist' },
  Accountant:    { colour: 'bg-green-600',  icon: Calculator,   label: 'Accountant' },
};

// ── Main Dashboard component ──────────────────────────────────────────────────
export function Dashboard() {
  const user     = currentUser();
  const navigate = useNavigate();
  const role     = user?.role;
  const nav      = NAV[role] || NAV.Receptionist;
  const [activeTab, setActiveTab] = useState(nav[0]?.id);
  const [metrics,   setMetrics]   = useState(null);
  const [loading,   setLoading]   = useState(true);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const r = await api.get('/reports/dashboard');
      setMetrics(r.data);
    } catch { setMetrics(null); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  function handleLogout() { logout(); navigate('/login'); }

  const meta = ROLE_META[role] || ROLE_META.Receptionist;
  const MetaIcon = meta.icon;

  return (
    <div className="flex min-h-[calc(100vh-72px)]">

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {/* User info */}
        <div className={`${meta.colour} px-5 py-5`}>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white">
              <MetaIcon size={20} />
            </span>
            <div>
              <p className="font-semibold text-white text-sm">{user?.fullName}</p>
              <p className="text-xs text-white/70">{meta.label}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          {nav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-brand-50 text-brand-700 border-r-2 border-brand-700 dark:bg-zinc-800 dark:text-brand-400 dark:border-brand-400'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-zinc-100 p-4 dark:border-zinc-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-700 dark:text-brand-400">
              {nav.find(n => n.id === activeTab)?.label}
            </p>
            <h1 className="mt-0.5 text-2xl font-bold dark:text-white">Vora Addis HMS</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchMetrics} title="Refresh" className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 text-zinc-500 hover:text-brand-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-brand-400 transition">
              <RefreshCw size={15} />
            </button>
            {/* Mobile: tab selector */}
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="lg:hidden rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {nav.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-24 text-brand-700 dark:text-brand-400">
              <Loader2 className="animate-spin" size={40} />
            </div>
          )}
          {!loading && (
            <>
              {/* Admin + Manager: Overview */}
              {(role === 'Administrator' || role === 'Manager') && activeTab === 'overview' && (
                <AdminOverview metrics={metrics} role={role} />
              )}
              {/* Receptionist: Today's Activity */}
              {role === 'Receptionist' && activeTab === 'today' && (
                <ReceptionistToday />
              )}
              {/* Accountant: Financial Overview */}
              {role === 'Accountant' && activeTab === 'finance' && (
                <AccountantFinance metrics={metrics} />
              )}
              {/* Shared: Reservations */}
              {activeTab === 'reservations' && (
                <ReservationsPanel role={role} />
              )}
              {/* Shared: Rooms */}
              {activeTab === 'rooms' && (
                <RoomsPanel metrics={metrics} />
              )}
              {/* Shared: Payments */}
              {activeTab === 'payments' && (
                <PaymentsPanel />
              )}
              {/* Admin+Manager: Customers */}
              {activeTab === 'customers' && (
                <SimpleListPanel title="Customers" endpoint="/customers" columns={['full_name','email','phone','nationality','created_at']} labels={['Name','Email','Phone','Nationality','Joined']} />
              )}
              {/* Admin+Manager: Staff */}
              {activeTab === 'staff' && (
                <SimpleListPanel title="Staff" endpoint="/staff" columns={['full_name','department','job_title','salary','performance_score']} labels={['Name','Department','Job Title','Salary','Score']} />
              )}
              {/* Restaurant */}
              {activeTab === 'restaurant' && (
                <SimpleListPanel title="Restaurant Orders" endpoint="/restaurant-orders" columns={['table_number','status','total','created_at']} labels={['Table','Status','Total','Created']} />
              )}
              {/* Gym */}
              {activeTab === 'gym' && (
                <SimpleListPanel title="Gym Members" endpoint="/gym-members" columns={['membership_plan_id','starts_on','ends_on','payment_status']} labels={['Plan','Starts','Ends','Payment']} />
              )}
              {/* Night Club */}
              {activeTab === 'nightclub' && (
                <SimpleListPanel title="Night Club Events" endpoint="/night-club-events" columns={['title','starts_at','ends_at','status']} labels={['Event','Starts','Ends','Status']} />
              )}
              {/* Meeting Rooms */}
              {activeTab === 'meetings' && (
                <SimpleListPanel title="Meeting Bookings" endpoint="/meeting-bookings" columns={['starts_at','ends_at','attendees_count','status','total_cost']} labels={['Starts','Ends','Attendees','Status','Cost']} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Admin / Manager Overview ──────────────────────────────────────────────────
function AdminOverview({ metrics, role }) {
  const chartData = metrics?.moduleRevenue?.length
    ? metrics.moduleRevenue.map(r => ({ name: r.module, revenue: Number(r.revenue) }))
    : [{ name: 'Rooms', revenue: 0 }];
  const trend = metrics?.bookingTrend || [];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Occupancy Rate"  value={`${metrics?.occupancyRate ?? 0}%`}  icon={BedDouble}   colour="brand" />
        <StatCard label="Today's Revenue" value={`$${(metrics?.dailyRevenue ?? 0).toLocaleString()}`}   icon={TrendingUp}  colour="green" />
        <StatCard label="Monthly Revenue" value={`$${(metrics?.monthlyRevenue ?? 0).toLocaleString()}`} icon={WalletCards} colour="blue"  />
        <StatCard label="Total Customers" value={metrics?.customerStats?.total_customers ?? 0}           icon={Users}       colour="amber" />
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Revenue by Department">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: 'rgba(157,107,54,.08)' }} formatter={(v) => [`$${v}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#9d6b36" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard title="Booking Trend (14 days)">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} tickFormatter={d => d?.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={(v) => [v, 'Bookings']} />
                <Line type="monotone" dataKey="bookings" stroke="#9d6b36" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Room status + Today activity */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Available',   metrics?.roomStatus?.Available   ?? 0, 'green'],
          ['Occupied',    metrics?.roomStatus?.Occupied    ?? 0, 'red'],
          ['Cleaning',    metrics?.roomStatus?.Cleaning    ?? 0, 'amber'],
          ['Maintenance', metrics?.roomStatus?.Maintenance ?? 0, 'brand'],
        ].map(([label, value, colour]) => (
          <StatCard key={label} label={`${label} Rooms`} value={value} icon={BedDouble} colour={colour} />
        ))}
      </div>

      {/* Today's activity summary */}
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Arrivals Today"   value={metrics?.todayActivity?.arrivals_today ?? 0}   icon={CheckCircle} colour="green" />
        <StatCard label="Departures Today" value={metrics?.todayActivity?.departures_today ?? 0} icon={ArrowRightCircle} colour="amber" />
        <StatCard label="Upcoming"         value={metrics?.todayActivity?.upcoming ?? 0}          icon={Clock}       colour="blue"  />
      </div>

      {role === 'Administrator' && (
        <SectionCard title="Quick Actions — System Management" action={<span className="text-xs text-zinc-400">Admin only</span>}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Manage Users',   '/api/users',   ShieldCheck],
              ['Manage Roles',   '/api/roles',   UserCog],
              ['Audit Logs',     '#',            RefreshCw],
            ].map(([label, , Icon]) => (
              <div key={label} className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-brand-50 text-brand-700 dark:bg-zinc-800 dark:text-brand-400"><Icon size={17} /></span>
                  <span className="text-sm font-medium dark:text-white">{label}</span>
                </div>
                <ChevronRight size={16} className="text-zinc-400" />
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// ── Receptionist Today's Activity ─────────────────────────────────────────────
function ReceptionistToday() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg,     setMsg]     = useState('');

  const fetch = useCallback(async () => {
    try { setLoading(true); const r = await api.get('/hotel/reservations/today'); setData(r.data); }
    catch { setData(null); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  async function doCheckin(reservation) {
    try {
      await api.post(`/hotel/check-in/${reservation.id}`, {});
      setMsg(`✅ ${reservation.customer_name} checked in to Room ${reservation.room_number}`);
      fetch();
    } catch (e) { setMsg(`❌ ${e.response?.data?.message || 'Check-in failed'}`); }
  }
  async function doCheckout(reservation) {
    try {
      await api.post(`/hotel/check-out/${reservation.check_in_id}`, {});
      setMsg(`✅ ${reservation.customer_name} checked out from Room ${reservation.room_number}`);
      fetch();
    } catch (e) { setMsg(`❌ ${e.response?.data?.message || 'Check-out failed'}`); }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-700" size={36} /></div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Arrivals Today"   value={data?.arrivals?.length   ?? 0} icon={CheckCircle}      colour="green" />
        <StatCard label="Departures Today" value={data?.departures?.length ?? 0} icon={ArrowRightCircle} colour="amber" />
        <StatCard label="Today's Date"     value={new Date().toLocaleDateString('en-GB')} icon={CalendarDays} colour="blue" />
      </div>

      {msg && (
        <div className={`rounded-lg p-4 text-sm font-medium ${msg.startsWith('✅') ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'}`}>
          {msg}
        </div>
      )}

      <SectionCard title={`Today's Arrivals (${data?.arrivals?.length ?? 0})`} action={<button onClick={fetch} className="text-xs text-zinc-400 hover:text-brand-700 flex items-center gap-1"><RefreshCw size={12} /> Refresh</button>}>
        <ReservationTable rows={data?.arrivals} onCheckin={doCheckin} />
      </SectionCard>

      <SectionCard title={`Today's Departures (${data?.departures?.length ?? 0})`}>
        <ReservationTable rows={data?.departures} onCheckout={doCheckout} />
      </SectionCard>
    </div>
  );
}

// ── Accountant Financial Overview ─────────────────────────────────────────────
function AccountantFinance({ metrics }) {
  const chartData = metrics?.moduleRevenue?.length
    ? metrics.moduleRevenue.map(r => ({ name: r.module, revenue: Number(r.revenue) }))
    : [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's Revenue"   value={`$${(metrics?.dailyRevenue   ?? 0).toLocaleString()}`} icon={TrendingUp}  colour="green" />
        <StatCard label="Monthly Revenue"   value={`$${(metrics?.monthlyRevenue ?? 0).toLocaleString()}`} icon={WalletCards}  colour="blue"  />
        <StatCard label="Pending Revenue"   value={`$${(metrics?.pendingRevenue ?? 0).toLocaleString()}`} icon={Clock}       colour="amber" />
        <StatCard label="New Customers/30d" value={metrics?.customerStats?.new_customers ?? 0}            icon={Users}       colour="brand" />
      </div>
      <SectionCard title="Revenue by Department">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`$${v}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#9d6b36" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Reservations Panel (shared) ───────────────────────────────────────────────
function ReservationsPanel({ role }) {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    api.get('/reservations', { params: { limit: 100 } })
      .then(r => {
        // Join with customer names via the CRUD endpoint (basic list)
        setRows(r.data.data || []);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  // For reservations, we need the room+customer details. The CRUD endpoint
  // returns raw columns. We enrich client-side from what we have.
  const filtered = search
    ? rows.filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()))
    : rows;

  return (
    <SectionCard title="Reservations" action={
      <div className="flex items-center gap-2">
        <Search size={14} className="text-zinc-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search…"
          className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        />
      </div>
    }>
      {loading
        ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-700" size={28} /></div>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-left text-xs uppercase tracking-wider text-zinc-400">
                  {['Room ID','Check-in','Check-out','Cost','Payment','Status'].map(h => (
                    <th key={h} className="pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                {filtered.slice(0, 50).map(r => (
                  <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-2.5 pr-4 font-mono text-xs text-zinc-500">{r.room_id?.slice(0,8)}…</td>
                    <td className="py-2.5 pr-4 text-zinc-600 dark:text-zinc-300">{r.check_in_date}</td>
                    <td className="py-2.5 pr-4 text-zinc-600 dark:text-zinc-300">{r.check_out_date}</td>
                    <td className="py-2.5 pr-4 font-semibold text-brand-700 dark:text-brand-300">${Number(r.total_cost).toFixed(0)}</td>
                    <td className="py-2.5 pr-4"><StatusPill status={r.payment_status} /></td>
                    <td className="py-2.5 pr-4"><StatusPill status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="py-6 text-center text-sm text-zinc-400">No reservations found.</p>}
          </div>
        )
      }
    </SectionCard>
  );
}

// ── Rooms Panel ───────────────────────────────────────────────────────────────
function RoomsPanel({ metrics }) {
  const [rooms, setRooms]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/hotel/public/rooms').then(r => setRooms(r.data.data || [])).catch(() => setRooms([])).finally(() => setLoading(false));
  }, []);

  const STATUS_COLOUR = {
    Available:   'bg-green-100  text-green-700  dark:bg-green-950/60  dark:text-green-300',
    Occupied:    'bg-red-100    text-red-700    dark:bg-red-950/60    dark:text-red-300',
    Cleaning:    'bg-amber-100  text-amber-700  dark:bg-amber-950/60  dark:text-amber-300',
    Maintenance: 'bg-zinc-100   text-zinc-600   dark:bg-zinc-800      dark:text-zinc-400',
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        {['Available','Occupied','Cleaning','Maintenance'].map(s => (
          <StatCard key={s} label={`${s} Rooms`} value={metrics?.roomStatus?.[s] ?? 0} icon={BedDouble}
            colour={s === 'Available' ? 'green' : s === 'Occupied' ? 'red' : s === 'Cleaning' ? 'amber' : 'brand'} />
        ))}
      </div>
      <SectionCard title="All Rooms">
        {loading
          ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-700" size={28} /></div>
          : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rooms.map(room => (
                <div key={room.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold dark:text-white">Room {room.room_number}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOUR[room.status] || ''}`}>{room.status}</span>
                  </div>
                  <p className="text-xs text-zinc-500">{room.type || room.room_type} — Floor {room.floor ?? '?'}</p>
                  <p className="mt-1 text-sm font-semibold text-brand-700 dark:text-brand-300">${Number(room.base_price).toFixed(0)}/night</p>
                </div>
              ))}
            </div>
          )
        }
      </SectionCard>
    </div>
  );
}

// ── Payments Panel ────────────────────────────────────────────────────────────
function PaymentsPanel() {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments', { params: { limit: 50 } })
      .then(r => setRows(r.data.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SectionCard title="Recent Payments">
      {loading
        ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-700" size={28} /></div>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-left text-xs uppercase tracking-wider text-zinc-400">
                  {['Module','Method','Amount','Reference','Status','Date'].map(h => (
                    <th key={h} className="pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                {rows.map(p => (
                  <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="py-2.5 pr-4 font-medium dark:text-white">{p.module}</td>
                    <td className="py-2.5 pr-4 text-zinc-500">{p.method}</td>
                    <td className="py-2.5 pr-4 font-semibold text-green-700 dark:text-green-400">${Number(p.amount).toFixed(2)}</td>
                    <td className="py-2.5 pr-4 text-zinc-500 font-mono text-xs">{p.reference || '—'}</td>
                    <td className="py-2.5 pr-4"><StatusPill status={p.status} /></td>
                    <td className="py-2.5 pr-4 text-zinc-500 text-xs">{p.paid_at?.slice(0,10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && <p className="py-6 text-center text-sm text-zinc-400">No payments recorded yet.</p>}
          </div>
        )
      }
    </SectionCard>
  );
}

// ── Generic list panel ────────────────────────────────────────────────────────
function SimpleListPanel({ title, endpoint, columns, labels }) {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(endpoint, { params: { limit: 50 } })
      .then(r => setRows(r.data.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [endpoint]);

  return (
    <SectionCard title={title}>
      {loading
        ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-700" size={28} /></div>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-left text-xs uppercase tracking-wider text-zinc-400">
                  {labels.map(h => <th key={h} className="pb-2 pr-4">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                {rows.map((row, i) => (
                  <tr key={row.id || i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    {columns.map(col => (
                      <td key={col} className="py-2.5 pr-4 dark:text-zinc-300">
                        {typeof row[col] === 'number'
                          ? col.includes('salary') || col.includes('cost') || col.includes('rate') || col.includes('price')
                            ? `$${Number(row[col]).toFixed(2)}`
                            : row[col]
                          : row[col]?.toString()?.slice(0, 40) || '—'
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && <p className="py-6 text-center text-sm text-zinc-400">No records found.</p>}
          </div>
        )
      }
    </SectionCard>
  );
}
