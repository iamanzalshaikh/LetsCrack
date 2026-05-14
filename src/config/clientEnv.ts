const API_URL = import.meta.env.VITE_API_URL as string | undefined;

if (!API_URL) {
  throw new Error("Missing VITE_API_URL. Set it in your frontend .env file.");
}

export const CLIENT_ENV = {
  API_URL,
} as const;

