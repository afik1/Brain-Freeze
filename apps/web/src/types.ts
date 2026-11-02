// Frontend TypeScript types mirroring the API response shapes.
// Keep in sync with apps/api/src/types.ts

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

export interface HealthResponse {
  status: string;
  timestamp: string;
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
