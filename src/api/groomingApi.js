import axiosInstance from './axiosInstance';

export const getAvailableSlots = async (date) => {
  const response = await axiosInstance.get(`/bookings/grooming/available?date=${date}`);
  return response.data;
};

export const lockSlot = async (date, timeSlot) => {
  const response = await axiosInstance.post('/bookings/grooming/lock', { date, timeSlot });
  return response.data;
};

export const confirmBooking = async (bookingId, petId) => {
  const response = await axiosInstance.post('/bookings/grooming/confirm', { bookingId, petId });
  return response.data;
};

export const updateBookingStatus = async (id, status) => {
  const response = await axiosInstance.put(`/bookings/grooming/${id}/status`, { status });
  return response.data;
};

export const getAllGroomingBookings = async () => {
  const response = await axiosInstance.get('/bookings/grooming');
  return response.data;
};
