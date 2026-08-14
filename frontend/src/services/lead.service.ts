import api from "./api";

export const getLeads = async (
  page = 1,
  limit = 10,
  search = ""
) => {
  const response = await api.get("/leads", {
    params: {
      page,
      limit,
      search,
    },
  });

  return response.data;
};