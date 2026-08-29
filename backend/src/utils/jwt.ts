import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { getJwtSecret } from "../config/env";

const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

export interface JwtPayload {
  id: string;
  employeeCode: string;
  roleId: string;
  impersonatorId?: string;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, getJwtSecret() as Secret, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const generateImpersonationToken = (
  payload: JwtPayload
): string => {
  return jwt.sign(
    payload,
    getJwtSecret() as Secret,
    {
      expiresIn: "1h",
    }
  );
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, getJwtSecret() as Secret) as JwtPayload;
};
