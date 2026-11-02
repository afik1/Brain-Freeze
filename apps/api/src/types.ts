// Shared TypeScript types for the Brain Freeze API

export interface Flavor {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category: "classic" | "fruit" | "special";
  allergens: string[];
  isVegan: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
}

export interface StoreInfo {
  name: string;
  description: string;
  address: string;
  openingHours: string;
  messageFromOwner: string;
}

export interface OrderItem {
  flavorId: string;
  quantity: number;
}

export interface OrderRequest {
  items: OrderItem[];
}

export interface OrderResponseItem {
  flavorId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderResponse {
  orderId: string;
  status: "confirmed";
  total: number;
  items: OrderResponseItem[];
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
