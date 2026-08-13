import api from "./api";

export interface LoginPayload {
  employeeCode: string;
  password: string;
}

export interface AuthEmployee {
  id: string;
  employeeCode: string;
  name: string;
  mobile?: string;
  email?: string;
  role: string;
  branch: string;
  profileImage?: string | null;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  employee: AuthEmployee;
}

export const login = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", payload);

  return response.data;
};