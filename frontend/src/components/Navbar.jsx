// src/components/Navbar.jsx

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const navLinks = [
  { path:'/',          label:'Home'      },
  { path:'/services',  label:'Services'  },
  { path:'/gallery',   label:'Portfolio' },
  { path:'/booking',   label:'Book Now'  },
  { path:'/contact',   label:'Contact'   },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [dropOpen, setDropOpen]   = useState(false);
  const { pathname } = useLocation();
  const navigate     = useNavigate();

  const clientRaw  = localStorage.getItem('clientUser');
  const client     = clientRaw ? JSON.parse(clientRaw) : null;

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientUser');
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-rose-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">💄</span>
          <div>
            <p className="font-display text-lg leading-tight text-rose-800 font-bold">Sonakshi Negi</p>
            <p className="text-xs text-rose-400 tracking-widest uppercase">Makeup Artist</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map(({ path, label }) => (
            <li key={path}>
              {label === 'Book Now' ? (
                <Link to={path}
                  className="ml-2 px-5 py-2 bg-rose-600 text-white rounded-full text-sm font-semibold hover:bg-rose-700 transition-colors">
                  Book Now
                </Link>
              ) : (
                <Link to={path}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    pathname === path ? 'bg-rose-50 text-rose-700' : 'text-gray-600 hover:text-rose-700 hover:bg-rose-50'
                  }`}>
                  {label}
                </Link>
              )}
            </li>
          ))}

          {/* Client auth area */}
          <li className="ml-1">
            {client ? (
              <div className="relative">
                <button onClick={() => setDropOpen(d => !d)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 transition-colors">
                  <div className="w-6 h-6 bg-rose-200 rounded-full flex items-center justify-center text-rose-800 font-bold text-xs">
                    {client.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-rose-800 font-medium max-w-[80px] truncate">{client.name.split(' ')[0]}</span>
                  <span className="text-rose-400 text-xs">▾</span>
                </button>
                {dropOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-rose-100 py-2 min-w-[180px] z-50">
                    <Link to="/my-bookings" onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-700 transition-colors">
                      📋 My Bookings
                    </Link>
                    <hr className="border-rose-50 my-1" />
                    <button onClick={() => { handleLogout(); setDropOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login"
                className="ml-1 px-4 py-2 border border-rose-300 text-rose-700 rounded-full text-sm font-semibold hover:bg-rose-50 transition-colors">
                Login
              </Link>
            )}
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(m => !m)}>
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-rose-100 px-4 pb-4">
          {navLinks.map(({ path, label }) => (
            <Link key={path} to={path} onClick={() => setMenuOpen(false)}
              className={`block py-2 px-3 my-1 rounded-lg text-sm font-medium transition-colors ${
                pathname === path ? 'bg-rose-50 text-rose-700' : 'text-gray-600 hover:text-rose-700 hover:bg-rose-50'
              }`}>
              {label}
            </Link>
          ))}
          <hr className="border-rose-50 my-2" />
          {client ? (
            <>
              <Link to="/my-bookings" onClick={() => setMenuOpen(false)}
                className="block py-2 px-3 my-1 rounded-lg text-sm font-medium text-gray-600 hover:bg-rose-50">
                📋 My Bookings ({client.name.split(' ')[0]})
              </Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="block w-full text-left py-2 px-3 my-1 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
                🚪 Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}
              className="block py-2 px-3 my-1 rounded-lg text-sm font-semibold text-rose-700 bg-rose-50">
              🔐 Login / Register
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
