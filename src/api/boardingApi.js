import axiosInstance from './axiosInstance';

export const getAvailableSlots = async (date) => {
  const response = await axiosInstance.get(`/bookings/boarding/available?date=${date}`);
  return response.data;
};

export const lockSlot = async (date, timeSlot) => {
  const response = await axiosInstance.post('/bookings/boarding/lock', { date, timeSlot });
  return response.data;
};

export const confirmBooking = async (bookingId, petId) => {
  const response = await axiosInstance.post('/bookings/boarding/confirm', { bookingId, petId });
  return response.data;
};

export const updateBookingStatus = async (id, status) => {
  const response = await axiosInstance.put(`/bookings/boarding/${id}/status`, { status });
  return response.data;
};

export const getAllBoardingBookings = async () => {
  const response = await axiosInstance.get('/bookings/boarding');
  return response.data;
};
