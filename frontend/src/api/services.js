// src/api/services.js - All API call functions

import API from './axiosConfig';

// ── Auth ──────────────────────────────────────────────
export const loginAdmin = (credentials) => API.post('/auth/login', credentials);

// ── Services ──────────────────────────────────────────
export const fetchServices = () => API.get('/services/');
export const createService = (data) => API.post('/services/', data);
export const updateService = (id, data) => API.put(`/services/${id}`, data);
export const deleteService = (id) => API.delete(`/services/${id}`);

// ── Bookings ──────────────────────────────────────────
export const createBooking = (data) => API.post('/bookings/', data);
export const fetchBookings = (status) =>
  API.get('/bookings/', { params: status ? { status } : {} });
export const updateBookingStatus = (id, status) =>
  API.put(`/bookings/${id}/status`, { status });
export const deleteBooking = (id) => API.delete(`/bookings/${id}`);
export const fetchAvailableSlots = (date) =>
  API.get('/bookings/available-slots', { params: { date } });

// ── Gallery ───────────────────────────────────────────
export const fetchGallery = (category) =>
  API.get('/gallery/', { params: category ? { category } : {} });

export const uploadImage = (formData) =>
  API.post('/gallery/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteImage = (id) => API.delete(`/gallery/${id}`);
