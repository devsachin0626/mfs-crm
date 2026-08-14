import api from "./api";

export const createFollowUp = async (
  data: {
    leadId: string;
    employeeId: string;
    followUpDate: string;
    remarks: string;
  }
) => {
  const response = await api.post(
    "/follow-ups",
    data
  );

  return response.data;
};