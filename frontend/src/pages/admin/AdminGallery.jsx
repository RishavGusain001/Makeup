// src/pages/admin/AdminGallery.jsx

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchGallery, uploadImage, deleteImage } from '../../api/services';

const CATEGORIES = ['bridal', 'party', 'editorial', 'natural', 'other'];

export default function AdminGallery() {
  const [images, setImages]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg]           = useState('');
  const [form, setForm]         = useState({ category: 'bridal', caption: '' });
  const fileRef = useRef();

  const load = () => {
    setLoading(true);
    fetchGallery().then(r => setImages(r.data.images)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { setMsg('Please select an image file.'); return; }

    const data = new FormData();
    data.append('image', file);
    data.append('category', form.category);
    data.append('caption', form.caption);

    setUploading(true); setMsg('');
    try {
      await uploadImage(data);
      setMsg('✅ Image uploaded successfully!');
      setForm({ category: 'bridal', caption: '' });
      if (fileRef.current) fileRef.current.value = '';
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Upload failed.');
    } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image permanently?')) return;
    try { await deleteImage(id); load(); }
    catch { alert('Could not delete image.'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-rose-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xl">💄</span>
          <span className="font-display text-lg">Admin — Gallery</span>
        </div>
        <div className="flex gap-4">
          <Link to="/admin/dashboard" className="text-rose-200 hover:text-white text-sm">Bookings</Link>
          <Link to="/admin/services"  className="text-rose-200 hover:text-white text-sm">Services</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-display text-3xl text-rose-900 mb-8">Manage Gallery</h1>

        {/* Upload form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="font-semibold text-lg text-gray-800 mb-4">📤 Upload New Image</h2>
          {msg && (
            <div className={`text-sm px-4 py-2 rounded-xl mb-4 ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {msg}
            </div>
          )}
          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-3">
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Image File *</label>
              <input
                type="file" ref={fileRef} accept="image/*"
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-rose-50 file:text-rose-700 file:font-semibold hover:file:bg-rose-100 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Caption (optional)</label>
              <input
                type="text" value={form.caption}
                onChange={e => setForm(p => ({ ...p, caption: e.target.value }))}
                placeholder="e.g. Bridal look for Anjali"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div>
              <button
                type="submit" disabled={uploading}
                className="w-full py-2.5 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors disabled:opacity-60"
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
          </form>
        </div>

        {/* Images grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-3">🖼</p>
            <p>No images yet. Upload your first photo above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map(img => (
              <div key={img.id} className="relative group rounded-2xl overflow-hidden bg-gray-100 aspect-square">
                <img
                  src={`http://localhost:5000${img.image_url}`}
                  alt={img.caption || 'Gallery'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <span className="bg-white/90 text-rose-700 text-xs font-semibold px-3 py-1 rounded-full capitalize">
                    {img.category}
                  </span>
                  {img.caption && (
                    <span className="text-white text-xs text-center px-2">{img.caption}</span>
                  )}
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-4 py-1.5 rounded-full font-semibold transition-colors"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
