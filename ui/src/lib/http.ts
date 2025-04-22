import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URI,
  timeout: 60 * 1000,
  responseType: "stream",
});
