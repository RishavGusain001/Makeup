// src/pages/admin/AdminDashboard.jsx - Full Featured Admin Dashboard v2

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  fetchBookings, fetchDashboardStats, updateBookingStatus,
  deleteBooking, fetchAllClients
} from '../../api/services';

// ─── Constants ──────────────────────────────────────────────
const STATUS_CFG = {
  pending:   { label:'Pending',   cls:'bg-yellow-100 text-yellow-800 border-yellow-200', dot:'bg-yellow-400' },
  accepted:  { label:'Accepted',  cls:'bg-green-100  text-green-800  border-green-200',  dot:'bg-green-400'  },
  rejected:  { label:'Rejected',  cls:'bg-red-100    text-red-800    border-red-200',    dot:'bg-red-400'    },
  completed: { label:'Completed', cls:'bg-blue-100   text-blue-800   border-blue-200',   dot:'bg-blue-400'   },
};

// ─── Mini Bar Chart ──────────────────────────────────────────
function MiniBar({ data }) {
  if (!data?.length) return <p className="text-gray-400 text-sm text-center py-4">No data yet</p>;
  const max = Math.max(...data.map(d => d.cnt), 1);
  return (
    <div className="flex items-end gap-1.5 h-24 mt-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-rose-200 rounded-t-sm transition-all duration-500"
            style={{ height: `${(d.cnt / max) * 100}%`, minHeight: '4px' }} />
          <span className="text-[10px] text-gray-400 truncate w-full text-center">
            {d.month?.slice(5)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Booking Detail Modal ────────────────────────────────────
function BookingModal({ booking: b, onClose, onStatus, onDelete, actionLoading }) {
  if (!b) return null;
  const st = STATUS_CFG[b.status] || STATUS_CFG.pending;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}>

        <div className="bg-gradient-to-r from-rose-700 to-rose-500 text-white px-6 py-5 rounded-t-3xl flex items-start justify-between">
          <div>
            <p className="text-rose-200 text-xs uppercase tracking-widest">Booking #{b.id}</p>
            <h2 className="font-display text-xl mt-0.5">{b.name}</h2>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold mt-2 inline-block border ${st.cls}`}>
              {st.label}
            </span>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl leading-none mt-1">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Client details */}
          <div className="bg-rose-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-3">Client Details</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Phone</p>
                <a href={`tel:${b.phone}`} className="font-semibold text-rose-700 hover:underline">{b.phone}</a>
              </div>
              {b.client_email && (
                <div>
                  <p className="text-gray-400 text-xs">Email</p>
                  <p className="font-semibold text-gray-700 truncate">{b.client_email}</p>
                </div>
              )}
            </div>
            <div className="mt-3">
              <p className="text-gray-400 text-xs">Full Address</p>
              <p className="text-gray-800 text-sm leading-relaxed mt-0.5">
                {b.address || <span className="italic text-gray-400">Not provided</span>}
              </p>
            </div>
          </div>

          {/* Appointment details */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Appointment</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-gray-400 text-xs">Service</p><p className="font-semibold">{b.service_name}</p></div>
              <div><p className="text-gray-400 text-xs">Price</p><p className="font-bold text-rose-700">₹{Number(b.service_price).toLocaleString()}</p></div>
              <div><p className="text-gray-400 text-xs">Date</p><p className="font-semibold">{b.booking_date}</p></div>
              <div><p className="text-gray-400 text-xs">Time</p><p className="font-semibold">{b.booking_time?.slice(0,5)}</p></div>
            </div>
            {b.notes && (
              <div className="mt-3">
                <p className="text-gray-400 text-xs">Special Requests</p>
                <p className="text-gray-700 text-sm mt-0.5 italic">"{b.notes}"</p>
              </div>
            )}
          </div>

          {/* WhatsApp */}
          <a href={`https://wa.me/91${b.phone}?text=Hi%20${encodeURIComponent(b.name)}%2C%20your%20appointment%20on%20${b.booking_date}%20at%20${b.booking_time?.slice(0,5)}%20has%20been%20${b.status === 'accepted' ? 'confirmed' : 'updated'}.`}
            target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors">
            💬 Message on WhatsApp
          </a>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-wrap gap-2">
          {b.status === 'pending' && (
            <>
              <button onClick={() => onStatus(b.id,'accepted')} disabled={actionLoading === b.id+'accepted'}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
                ✓ Accept
              </button>
              <button onClick={() => onStatus(b.id,'rejected')} disabled={actionLoading === b.id+'rejected'}
                className="flex-1 py-2.5 bg-red-100 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-200 transition-colors disabled:opacity-50">
                ✕ Reject
              </button>
            </>
          )}
          {b.status === 'accepted' && (
            <button onClick={() => onStatus(b.id,'completed')} disabled={actionLoading === b.id+'completed'}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
              ✓ Mark Completed
            </button>
          )}
          <button onClick={() => onDelete(b.id)}
            className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Today's Schedule ────────────────────────────────────────
function TodaySchedule({ bookings }) {
  if (!bookings?.length) return (
    <div className="text-center py-8 text-gray-400 text-sm">No appointments today 🎉</div>
  );
  return (
    <div className="space-y-2">
      {bookings.map(b => {
        const st = STATUS_CFG[b.status] || STATUS_CFG.pending;
        return (
          <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-rose-50 transition-colors">
            <div className={`w-2 h-2 rounded-full ${st.dot} shrink-0`} />
            <div className="min-w-[45px] text-sm font-bold text-gray-600">{b.booking_time?.slice(0,5)}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">{b.name}</p>
              <p className="text-xs text-gray-400 truncate">{b.service_name}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${st.cls} shrink-0`}>{st.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Clients Tab ──────────────────────────────────────────────
function ClientsTab() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    fetchAllClients().then(r => setClients(r.data.clients)).finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
        </div>
        <span className="text-sm text-gray-400">{clients.length} registered</span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading clients...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">👥</p>
          <p>{search ? 'No clients match your search.' : 'No registered clients yet.'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-rose-50 text-rose-900 text-xs uppercase tracking-wider">
              <tr>
                {['#','Name','Email','Phone','Bookings','Joined'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{c.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-rose-100 rounded-full flex items-center justify-center text-rose-700 font-bold text-xs shrink-0">
                        {c.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                  <td className="px-4 py-3">
                    <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-xs font-bold">
                      {c.total_bookings}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{c.created_at?.slice(0,10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminUser = localStorage.getItem('adminUser');

  const [activeTab, setActiveTab]  = useState('bookings');
  const [bookings, setBookings]    = useState([]);
  const [stats, setStats]          = useState(null);
  const [filter, setFilter]        = useState('all');
  const [search, setSearch]        = useState('');
  const [dateFilter, setDate]      = useState('');
  const [loading, setLoading]      = useState(true);
  const [statsLoading, setStatsL]  = useState(true);
  const [actionLoading, setActing] = useState(null);
  const [selected, setSelected]    = useState(null);

  const loadStats = useCallback(() => {
    setStatsL(true);
    fetchDashboardStats().then(r => setStats(r.data)).finally(() => setStatsL(false));
  }, []);

  const loadBookings = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filter !== 'all') params.status = filter;
    if (dateFilter)        params.date   = dateFilter;
    if (search.trim())     params.search = search.trim();
    fetchBookings(params)
      .then(r => setBookings(r.data.bookings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter, dateFilter, search]);

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { if (activeTab === 'bookings') loadBookings(); }, [activeTab, filter, dateFilter]);

  const handleSearch = (e) => { e.preventDefault(); loadBookings(); };

  const handleStatus = async (id, status) => {
    setActing(id + status);
    try {
      await updateBookingStatus(id, status);
      setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
      loadBookings(); loadStats();
    } catch { alert('Failed to update.'); }
    finally { setActing(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking permanently?')) return;
    try { await deleteBooking(id); setSelected(null); loadBookings(); loadStats(); }
    catch { alert('Failed to delete.'); }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const exportCSV = () => {
    const headers = ['ID','Name','Phone','Address','Service','Price','Date','Time','Status','Email','Created'];
    const rows = bookings.map(b => [
      b.id, b.name, b.phone, `"${b.address||''}"`, b.service_name,
      b.service_price, b.booking_date, b.booking_time?.slice(0,5),
      b.status, b.client_email||'', b.created_at?.slice(0,10)
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `bookings_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const statCards = [
    { label:'Total Bookings',  value: stats?.total_bookings || 0,                   icon:'📋', color:'bg-white',       sub:'All time' },
    { label:'Pending',         value: stats?.by_status?.pending  || 0,              icon:'⏳', color:'bg-yellow-50',   sub:'Awaiting action' },
    { label:"Today's Appts",   value: stats?.today_count || 0,                      icon:'📅', color:'bg-rose-50',     sub:`${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short'})}` },
    { label:'Clients',         value: stats?.total_clients || 0,                    icon:'👥', color:'bg-purple-50',   sub:'Registered users' },
    { label:'Revenue',         value:`₹${(stats?.revenue||0).toLocaleString()}`,    icon:'💰', color:'bg-green-50',    sub:'Completed bookings' },
    { label:'Completed',       value: stats?.by_status?.completed || 0,             icon:'🎉', color:'bg-blue-50',     sub:'Done & dusted' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Navbar ─────────────────────────────────── */}
      <nav className="bg-rose-900 text-white px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-xl">💄</span>
          <div>
            <p className="font-display text-base leading-tight">Admin Panel</p>
            <p className="text-rose-300 text-xs">Priya Sharma Makeup Studio</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/admin/services" className="hidden md:block text-rose-200 hover:text-white text-sm transition-colors">Services</Link>
          <Link to="/admin/gallery"  className="hidden md:block text-rose-200 hover:text-white text-sm transition-colors">Gallery</Link>
          <Link to="/" target="_blank" className="hidden md:block text-rose-200 hover:text-white text-sm transition-colors">View Site ↗</Link>
          <div className="flex items-center gap-1.5 bg-rose-800 px-3 py-1.5 rounded-full">
            <div className="w-5 h-5 bg-rose-200 rounded-full flex items-center justify-center text-rose-800 text-xs font-bold">
              {adminUser?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm hidden sm:block">{adminUser}</span>
          </div>
          <button onClick={logout} className="bg-rose-700 hover:bg-rose-600 px-3 py-1.5 rounded-full text-sm transition-colors">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* ── Stat Cards ──────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {statCards.map(({ label, value, icon, color, sub }) => (
            <div key={label} className={`${color} rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="text-xl mb-1">{icon}</div>
              <div className="text-2xl font-bold text-gray-800 leading-tight">{statsLoading ? '…' : value}</div>
              <div className="text-xs font-semibold text-gray-600 mt-0.5">{label}</div>
              <div className="text-xs text-gray-400">{sub}</div>
            </div>
          ))}
        </div>

        {/* ── Two-column layout ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

          {/* Monthly chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="font-semibold text-gray-700 text-sm mb-1">Bookings (Last 6 Months)</p>
            <p className="text-gray-400 text-xs mb-2">Monthly trend</p>
            <MiniBar data={stats?.monthly} />
          </div>

          {/* Top services */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="font-semibold text-gray-700 text-sm mb-3">Top Services</p>
            {statsLoading ? (
              <div className="space-y-2">{[...Array(4)].map((_,i) => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse"/>)}</div>
            ) : (
              <div className="space-y-2">
                {(stats?.top_services || []).map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-4">{i+1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-gray-700 font-medium truncate">{s.name}</span>
                        <span className="text-rose-600 font-bold ml-2">{s.bookings_count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-400 rounded-full"
                          style={{ width: `${(s.bookings_count / (stats.top_services[0]?.bookings_count||1)) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
                {!stats?.top_services?.length && <p className="text-gray-400 text-sm text-center py-2">No data yet</p>}
              </div>
            )}
          </div>

          {/* Today's schedule */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-700 text-sm">Today's Schedule</p>
                <p className="text-gray-400 text-xs">
                  {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}
                </p>
              </div>
              <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {stats?.today_count || 0} appts
              </span>
            </div>
            <TodaySchedule bookings={stats?.today_bookings} />
          </div>
        </div>

        {/* ── Main Tabs ───────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Tab bar */}
          <div className="border-b border-gray-100 px-4 flex gap-1 pt-3 overflow-x-auto">
            {[
              { key:'bookings', label:'📋 Bookings' },
              { key:'clients',  label:'👥 Clients'  },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg whitespace-nowrap transition-colors ${
                  activeTab === key
                    ? 'bg-rose-50 text-rose-700 border-b-2 border-rose-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <div className="p-4 md:p-5">

            {/* ── BOOKINGS TAB ──────────────────── */}
            {activeTab === 'bookings' && (
              <>
                {/* Filters row */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {/* Status filters */}
                  <div className="flex flex-wrap gap-1.5">
                    {['all','pending','accepted','rejected','completed'].map(f => (
                      <button key={f} onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                          filter === f ? 'bg-rose-700 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-rose-50'
                        }`}>
                        {f === 'all' ? 'All' : f}
                      </button>
                    ))}
                  </div>

                  {/* Date filter */}
                  <input type="date" value={dateFilter} onChange={e => setDate(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-300" />

                  {dateFilter && (
                    <button onClick={() => setDate('')} className="text-xs text-gray-400 hover:text-gray-600">✕ Clear date</button>
                  )}

                  {/* Search */}
                  <form onSubmit={handleSearch} className="flex gap-1.5 ml-auto">
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search name / phone..."
                      className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-300 w-44" />
                    <button type="submit"
                      className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold hover:bg-rose-200 transition-colors">
                      Search
                    </button>
                    {search && (
                      <button type="button" onClick={() => { setSearch(''); loadBookings(); }}
                        className="text-xs text-gray-400 hover:text-gray-600">✕</button>
                    )}
                  </form>

                  {/* Export */}
                  <button onClick={exportCSV}
                    className="px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-xs font-semibold hover:bg-green-100 transition-colors border border-green-200">
                    ⬇ Export CSV
                  </button>
                </div>

                <p className="text-xs text-gray-400 mb-3">
                  {bookings.length} booking{bookings.length !== 1 ? 's' : ''} found · 💡 Click a row to view full details
                </p>

                {/* Table */}
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_,i) => (
                      <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <p className="text-4xl mb-3">📋</p>
                    <p>No bookings match your filter.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead className="bg-rose-50 text-rose-900 text-xs uppercase tracking-wider">
                        <tr>
                          {['#','Client','Phone','Address','Service','Date & Time','Status','Actions'].map(h => (
                            <th key={h} className="px-3 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {bookings.map(b => {
                          const st = STATUS_CFG[b.status] || STATUS_CFG.pending;
                          return (
                            <tr key={b.id} onClick={() => setSelected(b)}
                              className="hover:bg-rose-50 transition-colors cursor-pointer group">
                              <td className="px-3 py-3 text-gray-400 font-mono text-xs">#{b.id}</td>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 bg-rose-100 rounded-full flex items-center justify-center text-rose-700 font-bold text-xs shrink-0">
                                    {b.name?.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-800 text-sm whitespace-nowrap">{b.name}</p>
                                    {b.client_email && <p className="text-gray-400 text-xs truncate max-w-[100px]">{b.client_email}</p>}
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-gray-600 text-xs whitespace-nowrap">{b.phone}</td>
                              <td className="px-3 py-3 max-w-[150px]">
                                {b.address ? (
                                  <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{b.address}</p>
                                ) : (
                                  <span className="text-gray-300 text-xs italic">—</span>
                                )}
                              </td>
                              <td className="px-3 py-3">
                                <p className="text-gray-800 text-xs font-medium whitespace-nowrap">{b.service_name}</p>
                                <p className="text-rose-600 text-xs font-bold">₹{Number(b.service_price).toLocaleString()}</p>
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap">
                                <p className="text-gray-700 text-xs font-semibold">{b.booking_date}</p>
                                <p className="text-gray-400 text-xs">{b.booking_time?.slice(0,5)}</p>
                              </td>
                              <td className="px-3 py-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${st.cls}`}>
                                  {st.label}
                                </span>
                              </td>
                              <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                                <div className="flex gap-1 flex-wrap">
                                  {b.status === 'pending' && (
                                    <>
                                      <button onClick={() => handleStatus(b.id,'accepted')}
                                        disabled={actionLoading === b.id+'accepted'}
                                        className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 disabled:opacity-50 transition-colors">
                                        ✓
                                      </button>
                                      <button onClick={() => handleStatus(b.id,'rejected')}
                                        disabled={actionLoading === b.id+'rejected'}
                                        className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 disabled:opacity-50 transition-colors">
                                        ✕
                                      </button>
                                    </>
                                  )}
                                  {b.status === 'accepted' && (
                                    <button onClick={() => handleStatus(b.id,'completed')}
                                      disabled={actionLoading === b.id+'completed'}
                                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 disabled:opacity-50 whitespace-nowrap transition-colors">
                                      Done
                                    </button>
                                  )}
                                  <button onClick={() => handleDelete(b.id)}
                                    className="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs hover:bg-gray-200 transition-colors">
                                    🗑
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* ── CLIENTS TAB ───────────────────── */}
            {activeTab === 'clients' && <ClientsTab />}

          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <BookingModal
        booking={selected}
        onClose={() => setSelected(null)}
        onStatus={handleStatus}
        onDelete={handleDelete}
        actionLoading={actionLoading}
      />
    </div>
  );
}
