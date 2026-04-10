import axiosInstance from './axiosInstance';

export const getPets = async () => {
  const response = await axiosInstance.get('/pets');
  return response.data;
};

export const addPet = async (petData) => {
  const response = await axiosInstance.post('/pets', petData);
  return response.data;
};

export const deletePet = async (id) => {
  const response = await axiosInstance.delete(`/pets/${id}`);
  return response.data;
};

export const updatePet = async (id, petData) => {
  const response = await axiosInstance.put(`/pets/${id}`, petData);
  return response.data;
};
