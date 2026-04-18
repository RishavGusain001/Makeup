// src/pages/Booking.jsx - Booking form with client auto-fill

import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { fetchServices, createBooking, fetchAvailableSlots } from '../api/services';

const ALL_SLOTS = ['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];

function formatTime(t) {
  const [h] = t.split(':');
  const hr   = parseInt(h);
  const ampm = hr >= 12 ? 'PM' : 'AM';
  const disp = hr > 12 ? hr - 12 : hr;
  return `${disp}:00 ${ampm}`;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function Booking() {
  const location = useLocation();

  // Auto-fill from logged-in client
  const clientRaw = localStorage.getItem('clientUser');
  const client    = clientRaw ? JSON.parse(clientRaw) : null;

  const [services, setServices]     = useState([]);
  const [bookedTimes, setBooked]    = useState([]);
  const [success, setSuccess]       = useState('');
  const [error, setError]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]         = useState({});

  const [form, setForm] = useState({
    name:         client?.name  || '',
    phone:        client?.phone || '',
    address:      '',
    service_id:   location.state?.serviceId || '',
    booking_date: '',
    booking_time: '',
    notes:        '',
  });

  useEffect(() => { fetchServices().then(r => setServices(r.data.services)).catch(()=>{}); }, []);

  useEffect(() => {
    if (form.booking_date) {
      fetchAvailableSlots(form.booking_date)
        .then(r => setBooked(r.data.booked_times.map(t => t.slice(0,5))))
        .catch(()=> setBooked([]));
    }
  }, [form.booking_date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                    e.name         = 'Name is required';
    if (!/^[6-9]\d{9}$/.test(form.phone))    e.phone        = 'Enter a valid 10-digit mobile number';
    if (!form.service_id)                     e.service_id   = 'Please select a service';
    if (!form.booking_date)                   e.booking_date = 'Please select a date';
    if (!form.booking_time)                   e.booking_time = 'Please select a time slot';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true); setError('');
    try {
      await createBooking({
        ...form,
        booking_time: form.booking_time + ':00',
        client_id: client?.id || null,
      });
      setSuccess('🎉 Booking confirmed! We will contact you shortly.');
      setForm(p => ({ ...p, service_id:'', booking_date:'', booking_time:'', notes:'' }));
      setBooked([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally { setSubmitting(false); }
  };

  const inputCls = (field) =>
    `w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${errors[field] ? 'border-red-400 bg-red-50' : 'border-rose-200'}`;

  return (
    <div className="pt-24 pb-20 min-h-screen bg-rose-50">
      <div className="max-w-3xl mx-auto px-6">

        <div className="text-center mb-10 animate-fadeInUp">
          <p className="text-rose-500 text-sm tracking-[0.3em] uppercase font-semibold mb-3">Let's Get Started</p>
          <h1 className="font-display text-5xl text-rose-900 mb-4">Book an Appointment</h1>
          <p className="text-gray-500">Fill in your details — we'll confirm within 24 hours.</p>
        </div>

        {/* Login nudge for guests */}
        {!client && (
          <div className="bg-rose-100 border border-rose-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1 text-sm text-rose-800">
              <strong>Have an account?</strong> Login to auto-fill your details and track your bookings.
            </div>
            <Link to="/login" state={{ from: '/booking' }}
              className="px-4 py-1.5 bg-rose-700 text-white rounded-full text-xs font-semibold hover:bg-rose-800 transition-colors whitespace-nowrap">
              Login
            </Link>
          </div>
        )}

        {/* Logged-in client banner */}
        {client && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div className="text-sm text-green-800">
              Booking as <strong>{client.name}</strong> — your details are pre-filled.
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl p-6 mb-8 text-center animate-fadeInUp">
            <p className="text-3xl mb-2">💄</p>
            <p className="font-bold text-lg mb-1">Booking Received!</p>
            <p className="text-sm">{success}</p>
            {client && (
              <Link to="/my-bookings" className="inline-block mt-3 text-sm text-green-700 underline">
                View in My Bookings →
              </Link>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 mb-6 text-center text-sm">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-rose-100 p-8 space-y-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                placeholder="e.g. Anjali Mehta" className={inputCls('name')} />
              {errors.name && <p className="text-red-500 text-xs mt-1">⚠ {errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number *</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                placeholder="10-digit mobile" maxLength={10} className={inputCls('phone')} />
              {errors.phone && <p className="text-red-500 text-xs mt-1">⚠ {errors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address (optional)</label>
            <textarea name="address" value={form.address} onChange={handleChange}
              placeholder="Your address for home visit, or venue location"
              rows={2} className="w-full px-4 py-3 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Service *</label>
            <select name="service_id" value={form.service_id} onChange={handleChange} className={inputCls('service_id')}>
              <option value="">-- Choose a service --</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} — ₹{Number(s.price).toLocaleString()}</option>
              ))}
            </select>
            {errors.service_id && <p className="text-red-500 text-xs mt-1">⚠ {errors.service_id}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preferred Date *</label>
            <input type="date" name="booking_date" value={form.booking_date} onChange={handleChange}
              min={todayStr()} className={inputCls('booking_date')} />
            {errors.booking_date && <p className="text-red-500 text-xs mt-1">⚠ {errors.booking_date}</p>}
          </div>

          {form.booking_date && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Time Slot *</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {ALL_SLOTS.map(slot => {
                  const isBooked   = bookedTimes.includes(slot);
                  const isSelected = form.booking_time === slot;
                  return (
                    <button type="button" key={slot} disabled={isBooked}
                      onClick={() => { setForm(p => ({...p, booking_time: slot})); setErrors(p => ({...p, booking_time:''})); }}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                        isBooked   ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through' :
                        isSelected ? 'bg-rose-600 text-white shadow-md' :
                                     'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}>
                      {formatTime(slot)}
                      {isBooked && <div className="text-[9px]">Booked</div>}
                    </button>
                  );
                })}
              </div>
              {errors.booking_time && <p className="text-red-500 text-xs mt-1">⚠ {errors.booking_time}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Special Requests (optional)</label>
            <textarea name="notes" value={form.notes} onChange={handleChange}
              placeholder="Reference looks, outfit color, any special notes..."
              rows={3} className="w-full px-4 py-3 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold text-lg hover:bg-rose-700 transition-colors disabled:opacity-60 shadow-lg">
            {submitting ? '⏳ Submitting...' : '💄 Confirm Booking'}
          </button>

          <p className="text-center text-xs text-gray-400">
            24-hour notice required for rescheduling or cancellation.
          </p>
        </form>

      </div>
    </div>
  );
}
