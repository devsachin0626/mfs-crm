export interface LoginRequest {
  employeeCode: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  employee?: {
    id: string;
    employeeCode: string;
    name: string;
    email: string | null;
    mobile: string;
    role: string;
    branch: string;
  };
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}