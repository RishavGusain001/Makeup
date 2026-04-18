// src/pages/ClientLogin.jsx

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginClient } from '../api/services';

export default function ClientLogin() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from || '/my-bookings';

  const [form, setForm]       = useState({ email:'', password:'' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please enter your email and password.'); return; }
    setLoading(true); setError('');
    try {
      const res = await loginClient(form);
      localStorage.setItem('clientToken', res.data.token);
      localStorage.setItem('clientUser', JSON.stringify(res.data.client));
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white flex items-center justify-center px-4 pt-24 pb-12">
      <div className="w-full max-w-md">

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Top banner */}
          <div className="bg-gradient-to-r from-rose-600 to-pink-500 px-8 py-7 text-white text-center">
            <div className="text-4xl mb-2">💄</div>
            <h1 className="font-display text-2xl font-bold">Welcome Back</h1>
            <p className="text-rose-100 text-sm mt-1">Sign in to manage your bookings</p>
          </div>

          <div className="p-8">
            {location.state?.message && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-sm text-center mb-5">
                {location.state.message}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-center mb-5">
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email" value={form.email}
                  onChange={e => { setForm(p => ({...p, email: e.target.value})); setError(''); }}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={e => { setForm(p => ({...p, password: e.target.value})); setError(''); }}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 pr-12"
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-rose-600 text-white rounded-xl font-bold text-base hover:bg-rose-700 transition-all shadow-md disabled:opacity-60 mt-2">
                {loading ? '⏳ Signing in...' : '🔐 Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-rose-600 font-semibold hover:underline">Create one free</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          <Link to="/booking" className="text-rose-500 hover:underline">Continue as guest without login</Link>
        </p>
      </div>
    </div>
  );
}
