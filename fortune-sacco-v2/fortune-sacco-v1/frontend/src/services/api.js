import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Attach JWT to every request ───────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("fs_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Handle 401 globally — redirect to login ───────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("fs_token");
      localStorage.removeItem("fs_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Typed service helpers ─────────────────────────────────────────────────────
export const authAPI = {
  login:          (data)  => api.post("/auth/login", data),
  logout:         ()      => api.post("/auth/logout"),
  me:             ()      => api.get("/auth/me"),
  changePassword: (data)  => api.patch("/auth/change-password", data),
  refresh:        (token) => api.post("/auth/refresh", { refreshToken: token }),
};

export const dashboardAPI = {
  kpis:           ()      => api.get("/dashboard/kpis"),
  branchChart:    ()      => api.get("/dashboard/branch-chart"),
  recentActivity: ()      => api.get("/dashboard/recent-activity"),
};

export const policiesAPI = {
  getAll:   (params) => api.get("/policies", { params }),
  getById:  (id)     => api.get(`/policies/${id}`),
  getStats: ()       => api.get("/policies/stats"),
  expiring: (days)   => api.get("/policies/expiring", { params: { days } }),
  create:   (data)   => api.post("/policies", data),
  renew:    (id)     => api.patch(`/policies/${id}/renew`),
  update:   (id, d)  => api.patch(`/policies/${id}`, d),
};

export const claimsAPI = {
  getAll:   (params) => api.get("/claims", { params }),
  getById:  (id)     => api.get(`/claims/${id}`),
  getStats: ()       => api.get("/claims/stats"),
  submit:   (data)   => api.post("/claims", data),
  review:   (id, d)  => api.post(`/claims/${id}/review`, d),
};

export const premiumsAPI = {
  getAll:      (params) => api.get("/premiums", { params }),
  getStats:    ()       => api.get("/premiums/stats"),
  pay:         (id, d)  => api.post(`/premiums/${id}/pay`, d),
  autoDeduct:  ()       => api.post("/premiums/auto-deduct"),
};

export const membersAPI = {
  getAll:  (params) => api.get("/members", { params }),
  enroll:  (data)   => api.post("/members", data),
};

export const hospitalsAPI = {
  getAll:  (params) => api.get("/hospitals", { params }),
  getById: (id)     => api.get(`/hospitals/${id}`),
  add:     (data)   => api.post("/hospitals", data),
  toggle:  (id)     => api.patch(`/hospitals/${id}/toggle`),
};

export const branchesAPI = {
  getAll:  ()   => api.get("/branches"),
  getById: (id) => api.get(`/branches/${id}`),
};

export const auditAPI = {
  getAll: (params) => api.get("/audit", { params }),
};

export const notificationsAPI = {
  getAll:      ()   => api.get("/notifications"),
  markRead:    (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: ()   => api.patch("/notifications/read-all"),
};

export const usersAPI = {
  getAll:  ()   => api.get("/users"),
  create:  (d)  => api.post("/users", d),
  toggle:  (id) => api.patch(`/users/${id}/toggle`),
  unlock:  (id) => api.patch(`/users/${id}/unlock`),
};
