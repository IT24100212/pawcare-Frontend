import axiosInstance from './axiosInstance';

export const getMyBookings = async () => {
  const response = await axiosInstance.get('/bookings/my-bookings');
  return response.data;
};
