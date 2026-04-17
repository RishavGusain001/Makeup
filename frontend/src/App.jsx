// src/App.jsx - Main App with React Router

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import Navbar         from './components/Navbar';
import Footer         from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home           from './pages/Home';
import Services       from './pages/Services';
import Gallery        from './pages/Gallery';
import Booking        from './pages/Booking';
import Contact        from './pages/Contact';

import AdminLogin     from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminServices  from './pages/admin/AdminServices';
import AdminGallery   from './pages/admin/AdminGallery';

// Layout wrapper — hides Navbar/Footer on admin pages
function Layout({ children }) {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Navbar />}
      <main>{children}</main>
      {!isAdmin && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/"         element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/gallery"  element={<Gallery />} />
          <Route path="/booking"  element={<Booking />} />
          <Route path="/contact"  element={<Contact />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/services" element={
            <ProtectedRoute><AdminServices /></ProtectedRoute>
          } />
          <Route path="/admin/gallery" element={
            <ProtectedRoute><AdminGallery /></ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center text-center">
              <div>
                <p className="text-6xl mb-4">💄</p>
                <h1 className="font-display text-4xl text-rose-900 mb-2">Page Not Found</h1>
                <a href="/" className="text-rose-600 hover:underline">Go back home</a>
              </div>
            </div>
          } />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
