// src/api/services.js - All API call functions (v2)

import API from './axiosConfig';

// ── Admin Auth ────────────────────────────────────────
export const loginAdmin = (credentials) => API.post('/auth/login', credentials);

// ── Client Auth ───────────────────────────────────────
export const registerClient  = (data)  => API.post('/client/register', data);
export const loginClient     = (data)  => API.post('/client/login', data);
export const getMyBookings   = ()      => API.get('/client/my-bookings');
export const getClientProfile= ()      => API.get('/client/profile');

// ── Services (public) ─────────────────────────────────
export const fetchServices  = ()      => API.get('/services/');
export const createService  = (data)  => API.post('/services/', data);
export const updateService  = (id, d) => API.put(`/services/${id}`, d);
export const deleteService  = (id)    => API.delete(`/services/${id}`);

// ── Bookings ──────────────────────────────────────────
export const createBooking        = (data)         => API.post('/bookings/', data);
export const fetchBookings        = (params)       => API.get('/bookings/', { params });
export const fetchDashboardStats  = ()             => API.get('/bookings/stats');
export const fetchAllClients      = ()             => API.get('/bookings/clients');
export const updateBookingStatus  = (id, status)   => API.put(`/bookings/${id}/status`, { status });
export const deleteBooking        = (id)           => API.delete(`/bookings/${id}`);
export const fetchAvailableSlots  = (date)         => API.get('/bookings/available-slots', { params: { date } });

// ── Gallery ───────────────────────────────────────────
export const fetchGallery = (category) =>
  API.get('/gallery/', { params: category ? { category } : {} });
export const uploadImage  = (formData) =>
  API.post('/gallery/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteImage  = (id)       => API.delete(`/gallery/${id}`);
