import apiClient from "./client";

export const getComplaints = (params = {}) =>
  apiClient.get("/api/complaints", {
    params,
  });

export const getComplaint = (id) =>
  apiClient.get(`/api/complaints/${id}`);

export const getCategories = () =>
  apiClient.get("/api/categories");

export const updateComplaintStatus = (id, payload) =>
  apiClient.patch(`/api/complaints/${id}/status`, payload);

export const assignComplaint = (id, payload) =>
  apiClient.patch(`/api/admin/complaints/${id}/assign`, payload);