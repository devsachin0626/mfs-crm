import api from "./api";

export const getLeadById = async (
  id: string
) => {
  const response = await api.get(
    `/leads/${id}`
  );

  return response.data;
};