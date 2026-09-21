import apiClient from "./client";

export const loginRequest = (payload) =>
  apiClient.post("/api/auth/login", payload);

export const getMeRequest = () =>
  apiClient.get("/api/auth/me");
