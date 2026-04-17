// src/pages/Gallery.jsx

import { useEffect, useState } from 'react';
import { fetchGallery } from '../api/services';

const CATEGORIES = ['all', 'bridal', 'party', 'editorial', 'natural', 'other'];

// Placeholder cards shown when no images are uploaded yet
const placeholders = [
  { id: 'p1', category: 'bridal',    emoji: '👰', label: 'Bridal Look',    color: 'from-rose-100 to-pink-100' },
  { id: 'p2', category: 'party',     emoji: '🎉', label: 'Party Glam',     color: 'from-purple-100 to-pink-100' },
  { id: 'p3', category: 'editorial', emoji: '📸', label: 'Editorial',      color: 'from-orange-100 to-rose-100' },
  { id: 'p4', category: 'natural',   emoji: '🌸', label: 'Natural Beauty', color: 'from-green-100 to-rose-100' },
  { id: 'p5', category: 'bridal',    emoji: '💍', label: 'Engagement',     color: 'from-yellow-100 to-rose-100' },
  { id: 'p6', category: 'party',     emoji: '✨', label: 'Festive Look',   color: 'from-rose-100 to-red-100' },
];

export default function Gallery() {
  const [images, setImages]         = useState([]);
  const [activeCategory, setActive] = useState('all');
  const [loading, setLoading]       = useState(true);
  const [lightbox, setLightbox]     = useState(null);

  useEffect(() => {
    const cat = activeCategory === 'all' ? null : activeCategory;
    setLoading(true);
    fetchGallery(cat)
      .then(res => setImages(res.data.images))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const displayed = images.length > 0 ? images : placeholders.filter(
    p => activeCategory === 'all' || p.category === activeCategory
  );

  return (
    <div className="pt-24 pb-20 min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12 animate-fadeInUp">
          <p className="text-rose-500 text-sm tracking-[0.3em] uppercase font-semibold mb-3">My Work</p>
          <h1 className="font-display text-5xl text-rose-900 mb-4">Portfolio</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Every face tells a story. Browse my work across different occasions and styles.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-all ${
                activeCategory === cat
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              {cat === 'all' ? '✦ All' : cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-rose-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {displayed.map((item, idx) => (
              <div
                key={item.id}
                className="break-inside-avoid rounded-2xl overflow-hidden cursor-pointer group relative"
                onClick={() => item.image_url && setLightbox(item)}
              >
                {item.image_url ? (
                  <img
                    src={`http://localhost:5000${item.image_url}`}
                    alt={item.caption || 'Gallery'}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  // Placeholder card
                  <div className={`bg-gradient-to-br ${item.color} aspect-square flex flex-col items-center justify-center`}>
                    <span className="text-5xl mb-2">{item.emoji}</span>
                    <p className="text-rose-700 font-medium text-sm">{item.label}</p>
                    <p className="text-rose-400 text-xs mt-1">Sample Work</p>
                  </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-rose-900/0 group-hover:bg-rose-900/30 transition-all duration-300 flex items-end p-3">
                  {item.caption && (
                    <p className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.caption}
                    </p>
                  )}
                </div>
                {/* Category badge */}
                <div className="absolute top-2 right-2">
                  <span className="bg-white/80 backdrop-blur-sm text-rose-700 text-xs px-2 py-0.5 rounded-full capitalize">
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {displayed.length === 0 && !loading && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📷</p>
            <p>No images in this category yet. Check back soon!</p>
          </div>
        )}

        {/* Lightbox */}
        {lightbox && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <div className="relative max-w-3xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
              <img
                src={`http://localhost:5000${lightbox.image_url}`}
                alt={lightbox.caption}
                className="rounded-xl max-h-[85vh] object-contain"
              />
              {lightbox.caption && (
                <p className="text-white text-center mt-3 text-sm">{lightbox.caption}</p>
              )}
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-2 right-2 bg-white/20 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/40"
              >
                ✕
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
