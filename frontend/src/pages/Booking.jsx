// src/pages/Booking.jsx

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchServices, createBooking, fetchAvailableSlots } from '../api/services';

// Available time slots (10 AM to 7 PM, every hour)
const ALL_SLOTS = [
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

function formatTime(t) {
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  const ampm = hr >= 12 ? 'PM' : 'AM';
  const display = hr > 12 ? hr - 12 : hr;
  return `${display}:${m} ${ampm}`;
}

// Get today's date in YYYY-MM-DD for min date constraint
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function Booking() {
  const location   = useLocation();
  const [services, setServices]     = useState([]);
  const [bookedTimes, setBooked]    = useState([]);
  const [success, setSuccess]       = useState('');
  const [error, setError]           = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name:         '',
    phone:        '',
    address:      '',
    service_id:   location.state?.serviceId || '',
    booking_date: '',
    booking_time: '',
    notes:        '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchServices()
      .then(res => setServices(res.data.services))
      .catch(() => {});
  }, []);

  // When date changes, fetch already-booked slots
  useEffect(() => {
    if (form.booking_date) {
      fetchAvailableSlots(form.booking_date)
        .then(res => setBooked(res.data.booked_times.map(t => t.slice(0, 5))))
        .catch(() => setBooked([]));
    }
  }, [form.booking_date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())          errs.name         = 'Name is required';
    if (!/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit Indian mobile number';
    if (!form.service_id)           errs.service_id   = 'Please select a service';
    if (!form.booking_date)         errs.booking_date = 'Please select a date';
    if (!form.booking_time)         errs.booking_time = 'Please select a time slot';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setError('');
    try {
      await createBooking({
        ...form,
        booking_time: form.booking_time + ':00'
      });
      setSuccess('🎉 Booking confirmed! We will contact you shortly to confirm your appointment.');
      setForm({ name: '', phone: '', address: '', service_id: '', booking_date: '', booking_time: '', notes: '' });
      setBooked([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-rose-50">
      <div className="max-w-3xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12 animate-fadeInUp">
          <p className="text-rose-500 text-sm tracking-[0.3em] uppercase font-semibold mb-3">Let's Get Started</p>
          <h1 className="font-display text-5xl text-rose-900 mb-4">Book an Appointment</h1>
          <p className="text-gray-500">Fill in your details below and I'll confirm your slot within 24 hours.</p>
        </div>

        {/* Success message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl p-6 mb-8 text-center animate-fadeInUp">
            <p className="text-3xl mb-2">💄</p>
            <p className="font-semibold text-lg mb-1">Booking Received!</p>
            <p className="text-sm">{success}</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 mb-6 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-rose-100 p-8 space-y-6">

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Anjali Mehta"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${errors.name ? 'border-red-400' : 'border-rose-200'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              maxLength={10}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${errors.phone ? 'border-red-400' : 'border-rose-200'}`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address (optional)</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Your full address for home visits"
              rows={2}
              className="w-full px-4 py-3 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none transition"
            />
          </div>

          {/* Service */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Service *</label>
            <select
              name="service_id"
              value={form.service_id}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${errors.service_id ? 'border-red-400' : 'border-rose-200'}`}
            >
              <option value="">-- Choose a service --</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} — ₹{Number(s.price).toLocaleString()}
                </option>
              ))}
            </select>
            {errors.service_id && <p className="text-red-500 text-xs mt-1">{errors.service_id}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preferred Date *</label>
            <input
              type="date"
              name="booking_date"
              value={form.booking_date}
              onChange={handleChange}
              min={todayStr()}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${errors.booking_date ? 'border-red-400' : 'border-rose-200'}`}
            />
            {errors.booking_date && <p className="text-red-500 text-xs mt-1">{errors.booking_date}</p>}
          </div>

          {/* Time Slots */}
          {form.booking_date && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Time Slot *</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {ALL_SLOTS.map(slot => {
                  const isBooked   = bookedTimes.includes(slot);
                  const isSelected = form.booking_time === slot;
                  return (
                    <button
                      type="button"
                      key={slot}
                      disabled={isBooked}
                      onClick={() => { setForm(p => ({ ...p, booking_time: slot })); setErrors(p => ({ ...p, booking_time: '' })); }}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                        isBooked
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      {formatTime(slot)}
                      {isBooked && <div className="text-gray-300 text-[10px]">Booked</div>}
                    </button>
                  );
                })}
              </div>
              {errors.booking_time && <p className="text-red-500 text-xs mt-1">{errors.booking_time}</p>}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Special Requests (optional)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Any special requests, outfit color, reference photos link, etc."
              rows={3}
              className="w-full px-4 py-3 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold text-lg hover:bg-rose-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
          >
            {submitting ? 'Submitting...' : '💄 Confirm Booking'}
          </button>

          <p className="text-center text-xs text-gray-400">
            By booking, you agree to our cancellation policy. 24-hour notice required for rescheduling.
          </p>
        </form>

      </div>
    </div>
  );
}
