import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function normalizeBasePath(input?: string): string {
  const raw = String(input ?? "").trim();
  if (!raw) return "/";
  const start = raw.startsWith("/") ? raw : `/${raw}`;
  return start.endsWith("/") ? start : `${start}/`;
}

// https://vite.dev/config/
export default defineConfig({
  base: normalizeBasePath(process.env.VITE_BASE_PATH),
  plugins: [react()],
});
