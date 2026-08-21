import api from "./api";

export const getLeadSources = async () => {
  const response = await api.get(
    "/lead-sources",
    {
      params: {
        page: 1,
        limit: 100,
        isActive: true,
      },
    }
  );

  return response.data;
};