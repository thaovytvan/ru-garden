import {
  BlogPost,
  Category,
  Order,
  PaginatedResponse,
  Product,
  Review,
  User
} from "@/types";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("rugarden_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// --- Category APIs ---
export const getCategories = async (): Promise<{ data: Category[] }> => {
  const { data } = await api.get("/categories");
  return data;
};

// --- Product APIs ---
export const getProducts = async (params?: {
  category?: string;
  search?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}): Promise<PaginatedResponse<Product>> => {
  const { data } = await api.get("/products", { params });
  return data;
};

export const getProductBySlug = async (slug: string): Promise<Product> => {
  const { data } = await api.get(`/products/${slug}`);
  return data;
};

// --- Order APIs ---
export const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
  const { data } = await api.post("/orders", orderData);
  return data;
};

export const getMyOrders = async (): Promise<{ data: Order[] }> => {
  const { data } = await api.get("/orders/me");
  return data;
};

export const validateDiscount = async (code: string, amount: number): Promise<{ 
  valid: boolean; 
  reduction: number; 
  code: string; 
  type: string; 
  value: number; 
}> => {
  const { data } = await api.post("/discounts/validate", { code, amount });
  return data;
};

export const getAvailableDiscounts = async (): Promise<{ data: any[] }> => {
  const { data } = await api.get("/discounts/available");
  return data;
};

// --- User Auth APIs ---
export const loginUser = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const { data } = await api.post("/users/login", { email, password });
  return data;
};

export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<{ user: User; token: string }> => {
  const { data } = await api.post("/users/register", userData);
  return data;
};

export const getProfile = async (): Promise<User> => {
  const { data } = await api.get("/users/me");
  return data;
};

export const updateProfile = async (profileData: Partial<User>): Promise<User> => {
  const { data } = await api.put("/users/me", profileData);
  return data;
};

export const updatePassword = async (passwords: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> => {
  const { data } = await api.put("/users/me/password", passwords);
  return data;
};

// --- Review APIs ---
export const getReviewsByProduct = async (productId: string): Promise<{ data: Review[] }> => {
  const { data } = await api.get(`/reviews/product/${productId}`);
  return data;
};

export const createReview = async (reviewData: {
  rating: number;
  comment: string;
  productId: string;
  userId: string;
}): Promise<{ data: Review }> => {
  const { data } = await api.post("/reviews", reviewData);
  return data;
};

// --- Blog APIs ---
export const getBlogs = async (): Promise<{ data: BlogPost[] }> => {
  const { data } = await api.get("/blogs");
  return data;
};

export const getBlogBySlug = async (slug: string): Promise<{ data: BlogPost }> => {
  const { data } = await api.get(`/blogs/${slug}`);
  return data;
};

export default api;
