// src/pages/Register.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerClient } from '../api/services';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name:'', email:'', phone:'', password:'', confirmPassword:'' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                          e.name    = 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!/^[6-9]\d{9}$/.test(form.phone))          e.phone   = 'Enter a valid 10-digit Indian mobile number';
    if (form.password.length < 6)                   e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword)     e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await registerClient({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      localStorage.setItem('clientToken', res.data.token);
      localStorage.setItem('clientUser', JSON.stringify(res.data.client));
      navigate('/my-bookings');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ name, label, type='text', placeholder, children }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <input
        type={type} name={name} value={form[name]} onChange={handleChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition
          ${errors[name] ? 'border-red-400 bg-red-50' : 'border-rose-200'}`}
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">⚠ {errors[name]}</p>}
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white flex items-center justify-center px-4 py-12 pt-24">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Top banner */}
          <div className="bg-gradient-to-r from-rose-600 to-pink-500 px-8 py-7 text-white text-center">
            <div className="text-4xl mb-2">💄</div>
            <h1 className="font-display text-2xl font-bold">Create Account</h1>
            <p className="text-rose-100 text-sm mt-1">Join to book appointments easily</p>
          </div>

          <div className="p-8">
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-center mb-5 flex items-center gap-2 justify-center">
                ⚠ {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field name="name"  label="Full Name *"  placeholder="e.g. Anjali Mehta" />
              <Field name="email" label="Email Address *" type="email" placeholder="you@example.com" />
              <Field name="phone" label="Mobile Number *" placeholder="10-digit number" />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password" value={form.password} onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 pr-12 transition
                      ${errors.password ? 'border-red-400 bg-red-50' : 'border-rose-200'}`}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">⚠ {errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password *</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                  placeholder="Repeat password"
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition
                    ${errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-rose-200'}`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">⚠ {errors.confirmPassword}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-rose-600 text-white rounded-xl font-bold text-base hover:bg-rose-700 transition-all shadow-md hover:shadow-lg disabled:opacity-60 mt-2">
                {loading ? '⏳ Creating account...' : '✨ Create My Account'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-rose-600 font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>

        {/* Guest booking note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Don't want to register?{' '}
          <Link to="/booking" className="text-rose-500 hover:underline">Book as a guest</Link>
        </p>
      </div>
    </div>
  );
}
