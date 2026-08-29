import fs from "fs";
import path from "path";

const backendRoot = path.resolve(__dirname, "../..");

export const uploadsDirectory = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(backendRoot, "uploads");

export const ensureRuntimeDirectories = (): void => {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
};
