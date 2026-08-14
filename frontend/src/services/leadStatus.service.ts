import api from "./api";

export const getLeadStatuses = async () => {
  const response = await api.get(
    "/lead-statuses"
  );

  return response.data;
};

export const changeLeadStatus = async (
  leadId: string,
  data: {
    statusId: string;
    remarks: string;
  }
) => {
  const response = await api.patch(
    `/leads/${leadId}/status`,
    data
  );

  return response.data;
};