import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_URL,
});

// Automatically attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("gym_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const loginAdmin   = (data) => API.post("/auth/login", data);
export const verifyLogin2FA = (data) => API.post("/auth/login/verify", data);
export const getMe        = ()     => API.get("/auth/me");
export const changePassword = (data) => API.put("/auth/change-password", data);

// Members
export const getMembers   = (params) => API.get("/members", { params });
export const getMember    = (id)     => API.get(`/members/${id}`);
export const addMember    = (data)   => API.post("/members", data);
export const updateMember = (id, data) => API.put(`/members/${id}`, data);
export const deleteMember = (id)     => API.delete(`/members/${id}`);

// Offers
export const getOffers    = ()         => API.get("/offers");
export const createOffer  = (data)     => API.post("/offers", data);
export const updateOffer  = (id, data) => API.put(`/offers/${id}`, data);
export const deleteOffer  = (id)       => API.delete(`/offers/${id}`);

// Dashboard
export const getDashboardStats   = () => API.get("/dashboard/stats");
export const getMonthlyJoined    = () => API.get("/dashboard/monthly-joined");
export const getMembershipDist   = () => API.get("/dashboard/membership-distribution");
export const getActiveVsExpired  = () => API.get("/dashboard/active-vs-expired");

// Alerts
export const getAlerts      = () => API.get("/alerts");
export const getAlertCount  = () => API.get("/alerts/count");
export const markAlertRead  = (id) => API.post(`/alerts/${id}/read`);
export const markAllRead    = () => API.post("/alerts/read-all");

// Settings
export const getSettings          = () => API.get("/settings");
export const updateSettings       = (data) => API.put("/settings", data);
export const updateNotifications  = (data) => API.put("/settings/notifications", data);
export const getStaff             = () => API.get("/settings/staff");
export const inviteStaff          = (data) => API.post("/settings/staff", data);
export const removeStaff          = (email) => API.delete(`/settings/staff/${email}`);

export default API;
