// src/pages/Home.jsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchServices } from '../api/services';

const testimonials = [
  { name: 'Anjali Mehta',  text: 'Absolutely stunning bridal look! I felt like a queen on my wedding day. Priya is magical!', stars: 5 },
  { name: 'Riya Kapoor',   text: 'Got my party makeup done and received so many compliments. Very professional and punctual.', stars: 5 },
  { name: 'Sneha Verma',   text: 'The best makeup artist in Delhi! Natural finish, long-lasting, and so hygienic. Highly recommend!', stars: 5 },
];

function StarRating({ count }) {
  return <div className="text-yellow-400 text-sm">{'★'.repeat(count)}</div>;
}

export default function Home() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchServices()
      .then(res => setServices(res.data.services.slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <div className="pt-16">

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100" />
        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-rose-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center animate-fadeInUp">
          <p className="text-rose-500 text-sm tracking-[0.3em] uppercase font-semibold mb-4">
            ✦ Professional Makeup Artist ✦
          </p>
          <h1 className="font-display text-5xl md:text-7xl text-rose-900 leading-tight mb-6">
            Look Beautiful,<br />
            <span className="italic text-rose-600">Feel Confident</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Specializing in bridal, party, and editorial makeup in Delhi NCR. 
            Your dream look is just one booking away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/booking"
              className="px-8 py-4 bg-rose-600 text-white rounded-full font-semibold text-lg shadow-lg hover:bg-rose-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Book Now 💄
            </Link>
            <Link
              to="/services"
              className="px-8 py-4 bg-white text-rose-700 border-2 border-rose-200 rounded-full font-semibold text-lg hover:border-rose-400 hover:bg-rose-50 transition-all duration-300"
            >
              View Services
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
            {[
              { num: '500+', label: 'Happy Brides' },
              { num: '5★',   label: 'Rating' },
              { num: '8+',   label: 'Years Exp.' },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-3xl text-rose-700 font-bold">{num}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-rose-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── WHY CHOOSE ME ─────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl text-rose-900 mb-3">Why Choose Me?</h2>
            <p className="text-gray-500">Crafting beauty experiences that last a lifetime</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '✨', title: 'Premium Products',      desc: 'Only MAC, Huda Beauty, and other internationally certified brands used for your skin.' },
              { icon: '🎨', title: 'Custom Looks',          desc: 'Every client is unique. I create bespoke looks tailored to your face, outfit, and occasion.' },
              { icon: '⏰', title: 'Always On Time',        desc: 'Punctuality is our promise. Your special day runs on schedule, no stress guaranteed.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-rose-50 rounded-2xl p-8 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-display text-xl text-rose-800 mb-3">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED SERVICES ─────────────────────────── */}
      {services.length > 0 && (
        <section className="py-20 bg-rose-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="font-display text-4xl text-rose-900 mb-3">Popular Services</h2>
              <p className="text-gray-500">Professional makeup for every occasion</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-3">💄</div>
                  <h3 className="font-display text-xl text-rose-800 mb-2">{service.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-rose-600 font-bold text-xl">₹{Number(service.price).toLocaleString()}</span>
                    <Link to="/booking" className="text-sm px-4 py-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors">
                      Book
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/services" className="inline-block px-8 py-3 border-2 border-rose-400 text-rose-700 rounded-full font-semibold hover:bg-rose-600 hover:text-white transition-all">
                View All Services
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ─────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl text-rose-900 mb-3">Client Love</h2>
            <p className="text-gray-500">What my beautiful clients say</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, text, stars }) => (
              <div key={name} className="bg-rose-50 rounded-2xl p-6 border border-rose-100">
                <StarRating count={stars} />
                <p className="text-gray-600 text-sm mt-3 mb-4 leading-relaxed italic">"{text}"</p>
                <p className="font-semibold text-rose-800 text-sm">— {name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-rose-700 to-rose-500 text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display text-4xl mb-4">Ready for Your Dream Look?</h2>
          <p className="text-rose-100 text-lg mb-8">
            Book your appointment today and let's create something beautiful together.
          </p>
          <Link
            to="/booking"
            className="inline-block px-10 py-4 bg-white text-rose-700 font-bold rounded-full text-lg hover:bg-rose-50 transition-colors shadow-lg"
          >
            Book Your Appointment 💄
          </Link>
        </div>
      </section>

    </div>
  );
}
