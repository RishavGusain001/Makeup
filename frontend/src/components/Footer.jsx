// src/components/Footer.jsx

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-rose-900 text-rose-100 py-10 mt-20">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Brand */}
        <div>
          <h3 className="font-display text-xl text-white mb-2">💄 Priya Sharma</h3>
          <p className="text-sm text-rose-300 leading-relaxed">
            Professional makeup artist based in Delhi NCR. Bridal, party &amp; editorial looks.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="font-semibold text-white mb-3 uppercase text-xs tracking-wider">Quick Links</h4>
          <ul className="space-y-1 text-sm text-rose-300">
            {['/', '/services', '/gallery', '/booking', '/contact'].map((path, i) => {
              const labels = ['Home', 'Services', 'Portfolio', 'Book Now', 'Contact'];
              return (
                <li key={path}>
                  <Link to={path} className="hover:text-white transition-colors">
                    {labels[i]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-white mb-3 uppercase text-xs tracking-wider">Contact</h4>
          <ul className="space-y-2 text-sm text-rose-300">
            <li>📞 +91 98765 43210</li>
            <li>
              <a href="https://wa.me/919876543210" className="hover:text-white transition-colors">
                💬 WhatsApp
              </a>
            </li>
            <li>
              <a href="https://instagram.com" className="hover:text-white transition-colors">
                📸 @priya.makeupartist
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center text-rose-400 text-xs mt-8">
        © {new Date().getFullYear()} Priya Sharma Makeup Artist. All rights reserved.
      </div>
    </footer>
  );
}
