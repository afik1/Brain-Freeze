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
  /** Units left in stock. 0 for unavailable flavors. Resets on server restart. */
  stockRemaining: number;
  isFeatured: boolean;
}

export type SizeId = "small" | "regular" | "large";

export interface Size {
  id: SizeId;
  name: string;
  /** Added to the flavor price (can be negative). */
  priceModifier: number;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
  allergens: string[];
  isVegan: boolean;
  isAvailable: boolean;
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
  /** Optional. Defaults to "regular". */
  sizeId?: string;
  /** Optional. Defaults to no toppings. */
  toppingIds?: string[];
}

export interface OrderRequest {
  items: OrderItem[];
}

export interface OrderResponseItem {
  flavorId: string;
  name: string;
  quantity: number;
  size: Size;
  toppings: Pick<Topping, "id" | "name" | "price">[];
  /** Flavor price before size and toppings. */
  basePrice: number;
  /** basePrice + size modifier + toppings, per unit. */
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
