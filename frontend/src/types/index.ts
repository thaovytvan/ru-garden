export interface Category {
  id: string;
  value: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  images: string[];
  category: Category;
  categoryId: string;
  stock: number;
  careInstructions?: string;
  uses?: string;
  benefits?: string;
  isFeatured: boolean;
  isActive: boolean;
  rating?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: "USER" | "ADMIN";
}

export interface OrderItem {
  id?: string;
  productId: string;
  productName?: string;
  quantity: number;
  price?: number;
}

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  note?: string;
  discountCode?: string;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  transferContent?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    amount: number;
    transferContent: string;
  };
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  productId: string;
  userId: string;
  user: {
    name: string;
  };
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image?: string;
  author: string;
  createdAt: string;
}

  
