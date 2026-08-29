const isProduction = process.env.NODE_ENV === "production";

const requiredInProduction = ["DATABASE_URL", "JWT_SECRET", "CORS_ORIGINS"] as const;

export const validateEnvironment = (): void => {
  const missing = requiredInProduction.filter((name) => !process.env[name]?.trim());

  if (isProduction && missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(", ")}`
    );
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (isProduction && jwtSecret && jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters in production");
  }
};

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (secret) {
    return secret;
  }

  if (isProduction) {
    throw new Error("JWT_SECRET is required in production");
  }

  return "development-only-secret-do-not-use-in-production";
};

export const allowedCorsOrigins = (): string[] =>
  (process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

export const requestBodyLimit = process.env.REQUEST_BODY_LIMIT || "15mb";
