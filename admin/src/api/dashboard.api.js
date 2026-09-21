import apiClient from "./client";

export const getDashboard = () =>
  apiClient.get("/api/admin/summary");
