// src/pages/admin/AdminDashboard.jsx

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchBookings, updateBookingStatus, deleteBooking } from '../../api/services';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-800' },
  accepted:  { label: 'Accepted',  color: 'bg-green-100  text-green-800'  },
  rejected:  { label: 'Rejected',  color: 'bg-red-100    text-red-800'    },
  completed: { label: 'Completed', color: 'bg-blue-100   text-blue-800'   },
};

// ── Booking Detail Modal ───────────────────────────────
function BookingModal({ booking: b, onClose, onStatus, onDelete, actionLoading }) {
  if (!b) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-rose-700 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl">Booking #{b.id}</h2>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold mt-1 inline-block ${STATUS_CONFIG[b.status]?.color}`}>
              {STATUS_CONFIG[b.status]?.label}
            </span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">✕</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">

          {/* Client info */}
          <div className="bg-rose-50 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">Client Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Full Name</p>
                <p className="font-semibold text-gray-800">{b.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Phone</p>
                <a href={`tel:${b.phone}`} className="font-semibold text-rose-700 hover:underline">{b.phone}</a>
              </div>
            </div>
            {/* Full address — always fully visible */}
            <div>
              <p className="text-gray-400 text-xs">Address</p>
              <p className="font-medium text-gray-800 leading-relaxed mt-0.5">
                {b.address || <span className="text-gray-400 italic">Not provided</span>}
              </p>
            </div>
          </div>

          {/* Appointment info */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Appointment Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Service</p>
                <p className="font-semibold text-gray-800">{b.service_name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Price</p>
                <p className="font-semibold text-rose-700">₹{Number(b.service_price).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Date</p>
                <p className="font-semibold text-gray-800">{b.booking_date}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Time</p>
                <p className="font-semibold text-gray-800">{b.booking_time?.slice(0, 5)}</p>
              </div>
            </div>
            {b.notes && (
              <div>
                <p className="text-gray-400 text-xs">Special Requests</p>
                <p className="text-gray-700 text-sm mt-0.5 leading-relaxed">{b.notes}</p>
              </div>
            )}
          </div>

          {/* WhatsApp quick link */}
          <a
            href={`https://wa.me/91${b.phone}?text=Hi%20${encodeURIComponent(b.name)}%2C%20your%20makeup%20appointment%20on%20${b.booking_date}%20at%20${b.booking_time?.slice(0,5)}%20has%20been%20confirmed!`}
            target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors"
          >
            💬 Message on WhatsApp
          </a>
        </div>

        {/* Action buttons */}
        <div className="px-6 pb-6 flex flex-wrap gap-2">
          {b.status === 'pending' && (
            <>
              <button
                onClick={() => onStatus(b.id, 'accepted')}
                disabled={actionLoading === b.id + 'accepted'}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                ✓ Accept Booking
              </button>
              <button
                onClick={() => onStatus(b.id, 'rejected')}
                disabled={actionLoading === b.id + 'rejected'}
                className="flex-1 py-2.5 bg-red-100 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                ✕ Reject
              </button>
            </>
          )}
          {b.status === 'accepted' && (
            <button
              onClick={() => onStatus(b.id, 'completed')}
              disabled={actionLoading === b.id + 'completed'}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              ✓ Mark as Completed
            </button>
          )}
          <button
            onClick={() => onDelete(b.id)}
            className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings]    = useState([]);
  const [filter, setFilter]        = useState('all');
  const [loading, setLoading]      = useState(true);
  const [actionLoading, setActing] = useState(null);
  const [selected, setSelected]    = useState(null); // booking shown in modal
  const adminUser = localStorage.getItem('adminUser');

  const load = () => {
    setLoading(true);
    fetchBookings(filter === 'all' ? null : filter)
      .then(res => setBookings(res.data.bookings))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleStatus = async (id, status) => {
    setActing(id + status);
    try {
      await updateBookingStatus(id, status);
      // refresh modal booking object too
      setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
      load();
    } catch { alert('Failed to update status.'); }
    finally { setActing(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking permanently?')) return;
    try {
      await deleteBooking(id);
      setSelected(null);
      load();
    } catch { alert('Failed to delete booking.'); }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const counts = {
    all:       bookings.length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    accepted:  bookings.filter(b => b.status === 'accepted').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Admin Navbar */}
      <nav className="bg-rose-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xl">💄</span>
          <span className="font-display text-lg">Admin Panel</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/admin/services" className="text-rose-200 hover:text-white text-sm transition-colors">Services</Link>
          <Link to="/admin/gallery"  className="text-rose-200 hover:text-white text-sm transition-colors">Gallery</Link>
          <span className="text-rose-300 text-sm">👤 {adminUser}</span>
          <button onClick={logout} className="bg-rose-700 hover:bg-rose-600 px-4 py-1.5 rounded-full text-sm transition-colors">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings', count: counts.all,       icon: '📋', color: 'bg-white' },
            { label: 'Pending',        count: counts.pending,   icon: '⏳', color: 'bg-yellow-50' },
            { label: 'Accepted',       count: counts.accepted,  icon: '✅', color: 'bg-green-50' },
            { label: 'Completed',      count: counts.completed, icon: '🎉', color: 'bg-blue-50' },
          ].map(({ label, count, icon, color }) => (
            <div key={label} className={`${color} rounded-2xl p-5 border border-gray-100 shadow-sm`}>
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-3xl font-bold text-gray-800">{count}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'pending', 'accepted', 'rejected', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all ${
                filter === f ? 'bg-rose-700 text-white' : 'bg-white text-gray-600 hover:bg-rose-50'
              }`}
            >
              {f === 'all' ? 'All Bookings' : f}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 mb-3">💡 Click any row to view full details including complete address.</p>

        {/* Bookings table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p>No bookings found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-rose-50 text-rose-900 text-xs uppercase tracking-wider">
                  <tr>
                    {['#', 'Client', 'Phone', 'Address', 'Service', 'Date', 'Time', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => setSelected(b)}
                      className="hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-gray-400 font-mono">#{b.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800">{b.name}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{b.phone}</td>

                      {/* Address cell — shows up to 2 lines, full text in modal */}
                      <td className="px-4 py-3 max-w-[180px]">
                        {b.address ? (
                          <div className="group relative">
                            <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">{b.address}</p>
                            {b.address.length > 60 && (
                              <span className="text-rose-500 text-xs font-medium">👁 Click to see full</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs italic">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-gray-800 whitespace-nowrap">{b.service_name}</div>
                        <div className="text-rose-600 text-xs">₹{Number(b.service_price).toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{b.booking_date}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{b.booking_time?.slice(0,5)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_CONFIG[b.status]?.color}`}>
                          {STATUS_CONFIG[b.status]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-wrap gap-1">
                          {b.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatus(b.id, 'accepted')}
                                disabled={actionLoading === b.id + 'accepted'}
                                className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold hover:bg-green-200 transition-colors disabled:opacity-50"
                              >
                                ✓ Accept
                              </button>
                              <button
                                onClick={() => handleStatus(b.id, 'rejected')}
                                disabled={actionLoading === b.id + 'rejected'}
                                className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold hover:bg-red-200 transition-colors disabled:opacity-50"
                              >
                                ✕ Reject
                              </button>
                            </>
                          )}
                          {b.status === 'accepted' && (
                            <button
                              onClick={() => handleStatus(b.id, 'completed')}
                              disabled={actionLoading === b.id + 'completed'}
                              className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-200 transition-colors disabled:opacity-50"
                            >
                              ✓ Complete
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold hover:bg-gray-200 transition-colors"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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