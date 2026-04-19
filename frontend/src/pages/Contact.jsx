// src/pages/Contact.jsx

export default function Contact() {
  const contacts = [
    {
      icon: '📞',
      label: 'Call / WhatsApp',
      value: '+91 00000 00000',
      href: 'tel:+910000000000',
      bg: 'bg-green-50',
      border: 'border-green-200',
      textColor: 'text-green-700',
    },
    {
      icon: '💬',
      label: 'WhatsApp Chat',
      value: 'Message on WhatsApp',
      href: 'https://wa.me/910000000000?text=Hi%20Priya%2C%20I%20want%20to%20book%20a%20makeup%20appointment!',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      textColor: 'text-emerald-700',
    },
    {
      icon: '📸',
      label: 'Instagram',
      value: '@sonakshimakeupartist',
      href: 'https://instagram.com/sonakshimakeupartist',
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      textColor: 'text-pink-700',
    },
    {
      icon: '✉️',
      label: 'Email',
      value: 'Sonakshi_negi4048',
      href: 'mailto:Sonakshi_negi4048@gmail.com',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      textColor: 'text-rose-700',
    },
  ];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-rose-50">
      <div className="max-w-4xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14 animate-fadeInUp">
          <p className="text-rose-500 text-sm tracking-[0.3em] uppercase font-semibold mb-3">Get In Touch</p>
          <h1 className="font-display text-5xl text-rose-900 mb-4">Contact Me</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Have questions? Want to discuss your dream look? Reach out anytime — I love hearing from you!
          </p>
        </div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          {contacts.map(({ icon, label, value, href, bg, border, textColor }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className={`${bg} border ${border} rounded-2xl p-6 flex items-center gap-4 hover:shadow-md transition-all hover:-translate-y-0.5 group`}
            >
              <div className="text-4xl">{icon}</div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold">{label}</p>
                <p className={`${textColor} font-bold text-lg group-hover:underline`}>{value}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Working Hours */}
        <div className="bg-white rounded-2xl border border-rose-100 p-8 mb-8">
          <h2 className="font-display text-2xl text-rose-900 mb-6 text-center">Working Hours</h2>
          <div className="space-y-3">
            {[
              { day: 'Monday – Friday', time: '9:00 AM – 8:00 PM' },
              { day: 'Saturday',        time: '8:00 AM – 9:00 PM' },
              { day: 'Sunday',          time: '10:00 AM – 6:00 PM' },
              { day: 'Bridal Bookings', time: 'Available all 7 days (advance booking required)' },
            ].map(({ day, time }) => (
              <div key={day} className="flex justify-between items-center py-2 border-b border-rose-50 last:border-0">
                <span className="text-gray-700 font-medium text-sm">{day}</span>
                <span className="text-rose-600 text-sm font-semibold">{time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl border border-rose-100 p-8 text-center">
          <div className="text-4xl mb-3">📍</div>
          <h2 className="font-display text-xl text-rose-900 mb-2">Location</h2>
          <p className="text-gray-600 text-sm">
            Based in <strong>Dehradun</strong>, serving Uttarakhand including Chamba, Pauri, and near Dehradun.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Home visits available within 30 km radius (travel charges may apply).
          </p>
        </div>

      </div>
    </div>
  );
}
