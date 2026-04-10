import axiosInstance from './axiosInstance';

export const placeOrder = async (orderData) => {
  const response = await axiosInstance.post('/orders', orderData);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await axiosInstance.get('/orders');
  return response.data;
};

export const getAllOrders = async () => {
  const response = await axiosInstance.get('/orders/all');
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await axiosInstance.put(`/orders/${id}/status`, { status });
  return response.data;
};

export const cancelOrder = async (id) => {
  const response = await axiosInstance.delete(`/orders/${id}`);
  return response.data;
};
