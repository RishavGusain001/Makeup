// src/pages/admin/AdminServices.jsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchServices, createService, updateService, deleteService } from '../../api/services';

const EMPTY_FORM = { name: '', price: '', description: '', duration: '' };

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [editId, setEditId]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');

  const load = () => {
    setLoading(true);
    fetchServices().then(r => setServices(r.data.services)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { setMsg('Name and price are required.'); return; }
    setSaving(true); setMsg('');
    try {
      if (editId) {
        await updateService(editId, form);
        setMsg('✅ Service updated!');
      } else {
        await createService(form);
        setMsg('✅ Service created!');
      }
      setForm(EMPTY_FORM); setEditId(null); load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error saving service.');
    } finally { setSaving(false); }
  };

  const handleEdit = (s) => {
    setEditId(s.id);
    setForm({ name: s.name, price: s.price, description: s.description || '', duration: s.duration || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try { await deleteService(id); load(); }
    catch { alert('Could not delete service.'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-rose-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xl">💄</span>
          <span className="font-display text-lg">Admin — Services</span>
        </div>
        <div className="flex gap-4">
          <Link to="/admin/dashboard" className="text-rose-200 hover:text-white text-sm">Bookings</Link>
          <Link to="/admin/gallery"   className="text-rose-200 hover:text-white text-sm">Gallery</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="font-display text-3xl text-rose-900 mb-8">Manage Services</h1>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="font-semibold text-lg text-gray-800 mb-4">
            {editId ? '✏️ Edit Service' : '➕ Add New Service'}
          </h2>
          {msg && (
            <div className={`text-sm px-4 py-2 rounded-xl mb-4 ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {msg}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Service Name *</label>
              <input
                type="text" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Bridal Makeup"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Price (₹) *</label>
              <input
                type="number" value={form.price}
                onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                placeholder="e.g. 5000"
                min="0"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Duration</label>
              <input
                type="text" value={form.duration}
                onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                placeholder="e.g. 2-3 hours"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Description</label>
              <input
                type="text" value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Short description"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit" disabled={saving}
                className="px-6 py-2.5 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : editId ? 'Update Service' : 'Add Service'}
              </button>
              {editId && (
                <button type="button" onClick={() => { setEditId(null); setForm(EMPTY_FORM); setMsg(''); }}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Services list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading...</div>
          ) : services.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No services yet. Add one above!</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-rose-50 text-rose-900 text-xs uppercase tracking-wider">
                <tr>
                  {['Service', 'Price', 'Duration', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {services.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">{s.name}</div>
                      <div className="text-gray-400 text-xs line-clamp-1">{s.description}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-rose-700">₹{Number(s.price).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600">{s.duration || '—'}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => handleEdit(s)}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold hover:bg-yellow-200 transition-colors">
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDelete(s.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold hover:bg-red-200 transition-colors">
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
