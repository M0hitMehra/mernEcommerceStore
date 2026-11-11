import axios from "axios";

export const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

export function getErrorMessage(error, fallback = "Something went wrong") {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

// Auth & User APIs
export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  logout: () => api.get("/auth/logout"),
  me: () => api.get("/auth/me"),
  forgetPassword: (email) => api.post("/auth/forgetpassword", { email }),
  resetPassword: (token, password) =>
    api.put(`/auth/resetpassword/${token}`, { password }),
  updateProfile: (payload) => api.put("/auth/updateprofile", payload),
  getAdminOverview: () => api.get("/auth/productsandusers"),
};

// Category APIs
export const categoryApi = {
  getAll: () => api.get("/category/categories"),
  getSingle: (slug) => api.get(`/category/single-category/${slug}`),
  create: (name) => api.post("/category/create-category", { name }),
  update: (id, name) => api.put(`/category/update-category/${id}`, { name }),
  remove: (id) => api.delete(`/category/delete-category/${id}`),
};

// Product, Order & Braintree Payment APIs
export const productApi = {
  /**
   * Backend Apifeatures.search() unconditionally invokes queryStr.keyword.trim(),
   * so `keyword` must always be present (defaults to empty string "").
   */
  list: ({ keyword = "", page = 1, category = "", minPrice = "", maxPrice = "" } = {}) => {
    const params = new URLSearchParams();
    params.set("keyword", keyword ?? "");
    params.set("page", String(page || 1));
    if (category) params.set("category", category);
    if (minPrice !== "" && minPrice !== null && minPrice !== undefined) {
      params.set("price[gte]", String(minPrice));
    }
    if (maxPrice !== "" && maxPrice !== null && maxPrice !== undefined) {
      params.set("price[lte]", String(maxPrice));
    }
    return api.get(`/product/get-product?${params.toString()}`);
  },
  getSingle: (slug) => api.get(`/product/get-product/${slug}`),
  getRelated: (categoryId, productId) =>
    api.get(`/product/related-product/${categoryId}/${productId}`),
  create: (formData) =>
    api.post("/product/create-product", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, formData) =>
    api.put(`/product/update-product/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  remove: (id) => api.delete(`/product/delete-product/${id}`),
  getBraintreeToken: () => api.get("/product/braintree/token"),
  submitBraintreePayment: (cart, nonce) =>
    api.post("/product/braintree/payment", { cart, nonce }),
  getOrders: () => api.get("/product/orders"),
  changeOrderStatus: (orderId, status) =>
    api.post(`/product/orders/changestatus/${orderId}`, { status }),
};
