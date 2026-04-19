// src/pages/Services.jsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchServices } from '../api/services';

const serviceIcons = ['💍', '🎉', '💄', '🌸', '📸', '🪷'];

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices()
      .then(res => setServices(res.data.services))
      .catch(() => setError('Could not load services. Please try again later.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-rose-50">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-16 animate-fadeInUp">
          <p className="text-rose-500 text-sm tracking-[0.3em] uppercase font-semibold mb-3">What I Offer</p>
          <h1 className="font-display text-5xl text-rose-900 mb-4">My Services</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            From intimate natural looks to grand bridal transformations — every service is delivered with passion and precision.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center mb-8">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="w-12 h-12 bg-rose-100 rounded-full mb-4" />
                <div className="h-4 bg-rose-100 rounded mb-2" />
                <div className="h-3 bg-rose-50 rounded mb-1 w-3/4" />
                <div className="h-3 bg-rose-50 rounded mb-4 w-1/2" />
                <div className="h-8 bg-rose-100 rounded-full w-24" />
              </div>
            ))}
          </div>
        )}

        {/* Services grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-rose-100 group"
              >
                {/* Icon */}
                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:bg-rose-100 transition-colors">
                  {serviceIcons[i % serviceIcons.length]}
                </div>

                {/* Content */}
                <h3 className="font-display text-xl text-rose-900 mb-2">{service.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{service.description}</p>

                {/* Duration badge */}
                {service.duration && (
                  <div className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 text-xs px-3 py-1 rounded-full mb-4">
                    ⏱ {service.duration}
                  </div>
                )}

                {/* Price + CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-rose-50">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Starting at</p>
                    <p className="text-2xl font-bold text-rose-700">₹{Number(service.price).toLocaleString()}</p>
                  </div>
                  <Link
                    to="/booking"
                    state={{ serviceId: service.id }}
                    className="px-5 py-2 bg-rose-600 text-white rounded-full text-sm font-semibold hover:bg-rose-700 transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Note */}
        <div className="mt-14 bg-white rounded-2xl p-6 border border-rose-100 text-center">
          <p className="text-gray-600 text-sm">
            💬 Need a custom package or have questions? <a href="https://wa.me/910000000000" className="text-rose-600 font-semibold hover:underline">WhatsApp me</a> anytime!
          </p>
        </div>

      </div>
    </div>
  );
}
