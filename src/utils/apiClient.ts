import axios from "axios";

export const apiClient = axios.create({
  // Same-origin request; cookies JWT akan ikut terkirim otomatis.
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

