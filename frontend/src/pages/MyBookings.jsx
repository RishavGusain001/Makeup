// src/pages/MyBookings.jsx - Client's own bookings

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyBookings } from '../api/services';

const STATUS = {
  pending:   { label: 'Pending',   cls: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  accepted:  { label: 'Confirmed', cls: 'bg-green-100 text-green-800',   icon: '✅' },
  rejected:  { label: 'Cancelled', cls: 'bg-red-100 text-red-800',       icon: '❌' },
  completed: { label: 'Completed', cls: 'bg-blue-100 text-blue-800',     icon: '🎉' },
};

export default function MyBookings() {
  const navigate  = useNavigate();
  const clientRaw = localStorage.getItem('clientUser');
  const client    = clientRaw ? JSON.parse(clientRaw) : null;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!client) { navigate('/login', { state: { message: 'Please login to view your bookings.' } }); return; }
    getMyBookings()
      .then(r => setBookings(r.data.bookings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientUser');
    navigate('/login');
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-rose-50">
      <div className="max-w-4xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-rose-500 text-xs tracking-widest uppercase font-semibold">Your Dashboard</p>
            <h1 className="font-display text-4xl text-rose-900">My Bookings</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/booking"
              className="px-5 py-2 bg-rose-600 text-white rounded-full text-sm font-semibold hover:bg-rose-700 transition-colors">
              + New Booking
            </Link>
            <button onClick={logout}
              className="px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-full text-sm font-semibold hover:bg-rose-50 transition-colors">
              Logout
            </button>
          </div>
        </div>

        {/* Profile card */}
        {client && (
          <div className="bg-white rounded-2xl border border-rose-100 p-5 mb-8 flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center text-2xl font-bold text-rose-600 shrink-0">
              {client.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-800 text-lg">{client.name}</p>
              <p className="text-gray-500 text-sm">{client.email}</p>
              <p className="text-gray-500 text-sm">{client.phone}</p>
            </div>
            <div className="ml-auto text-right hidden sm:block">
              <p className="text-2xl font-bold text-rose-700">{bookings.length}</p>
              <p className="text-xs text-gray-400">Total Bookings</p>
            </div>
          </div>
        )}

        {/* Stats pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {Object.entries(STATUS).map(([key, { label, cls, icon }]) => (
            <div key={key} className="bg-white rounded-xl p-3 border border-gray-100 text-center shadow-sm">
              <p className="text-xl">{icon}</p>
              <p className="font-bold text-gray-800 text-lg">{bookings.filter(b => b.status === key).length}</p>
              <p className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cls} mt-1 inline-block`}>{label}</p>
            </div>
          ))}
        </div>

        {/* Bookings list */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_,i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse border border-gray-100">
                <div className="h-4 bg-rose-50 rounded w-1/3 mb-2" />
                <div className="h-3 bg-rose-50 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-rose-100 p-16 text-center">
            <p className="text-5xl mb-4">💄</p>
            <p className="text-gray-500 text-lg mb-4">You haven't made any bookings yet.</p>
            <Link to="/booking"
              className="inline-block px-8 py-3 bg-rose-600 text-white rounded-full font-semibold hover:bg-rose-700 transition-colors">
              Book Your First Appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => {
              const st = STATUS[b.status] || STATUS.pending;
              return (
                <div key={b.id} className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-gray-800">{b.service_name}</h3>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${st.cls}`}>
                          {st.icon} {st.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                        <div>
                          <p className="text-gray-400 text-xs">Date</p>
                          <p className="font-semibold text-sm text-gray-700">{b.booking_date}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Time</p>
                          <p className="font-semibold text-sm text-gray-700">{b.booking_time?.slice(0,5)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Price</p>
                          <p className="font-semibold text-sm text-rose-700">₹{Number(b.service_price).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Booking ID</p>
                          <p className="font-semibold text-sm text-gray-500">#{b.id}</p>
                        </div>
                      </div>
                      {b.notes && (
                        <p className="mt-2 text-xs text-gray-400 italic">"{b.notes}"</p>
                      )}
                    </div>
                  </div>

                  {/* Status-based message */}
                  {b.status === 'accepted' && (
                    <div className="mt-3 bg-green-50 rounded-xl px-4 py-2 text-green-700 text-sm flex items-center gap-2">
                      ✅ Your appointment is confirmed! We look forward to seeing you.
                    </div>
                  )}
                  {b.status === 'pending' && (
                    <div className="mt-3 bg-yellow-50 rounded-xl px-4 py-2 text-yellow-700 text-sm flex items-center gap-2">
                      ⏳ Awaiting confirmation — we'll reach out to you soon.
                    </div>
                  )}
                  {b.status === 'rejected' && (
                    <div className="mt-3 bg-red-50 rounded-xl px-4 py-2 text-red-700 text-sm flex items-center gap-2">
                      ❌ This booking was cancelled. <Link to="/booking" className="font-semibold underline ml-1">Book again</Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
