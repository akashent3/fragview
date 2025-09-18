export type Market = "IN" | "US" | "EU";
export type Currency = "INR" | "USD" | "EUR";

export type Brand = {
  slug: string;
  name: string;
  founded?: number;
  country?: string;
};

export type Perfume = {
  slug: string;
  name: string;
  brand: Brand;
  year?: number;
  notes?: string[];
  accords?: string[];
  rating?: number; // 0-5
  votes?: number;
  summary?: string; // AI-generated
  similarTop10?: Array<Pick<Perfume, "slug" | "name"> & { brandName: string; rating?: number }>; 
  prices?: BestPricesBySize;
  capturedAt?: string; // ISO when price seen
};

export type Offer = {
  retailer: string;
  url: string;
  price: number;
  currency: Currency;
  sizeMl: number;
  lastSeen: string; // ISO
};

export type BestPricesBySize = Record<string, { // key: "50", "100", etc
  best: Offer;
  others: Offer[];
}>;

export type Review = {
  id: string;
  user: { id: string; name: string; username: string; credibilityScore: number; };
  text: string;
  stars: number;
  longevity?: number; // 1-5
  sillage?: number;   // 1-5
  createdAt: string;  // ISO
};

export type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  verified: boolean;
  credibilityScore: number;
  avatarUrl?: string;
};