import { BestPricesBySize, Brand, Currency, Market, Offer, Perfume, Review, User } from "./types";

let currentUser: User | null = null; // simple in-memory for mock

export const api = {
  // Auth (mock)
  getCurrentUser: async (): Promise<User | null> => currentUser,
  signInWithCredentials: async (email: string, password: string) => {
    currentUser = {
      id: "u_1",
      name: email.split("@")[0] ?? "User",
      email,
      username: email.split("@")[0] ?? "user",
      verified: true,
      credibilityScore: 62,
    };
    return currentUser;
  },
  signUpWithCredentials: async (name: string, email: string, password: string) => {
    currentUser = {
      id: "u_" + Math.random().toString(36).slice(2, 8),
      name,
      email,
      username: name.toLowerCase().replace(/\s+/g, "_"),
      verified: true,
      credibilityScore: 10,
    };
    return currentUser;
  },
  signInWithOAuth: async (provider: "google" | "apple") => {
    currentUser = {
      id: "u_oauth",
      name: provider === "google" ? "Google User" : "Apple User",
      email: provider + "@example.com",
      username: provider + "_user",
      verified: true,
      credibilityScore: 45,
    };
    return currentUser;
  },
  signOut: async () => { currentUser = null; },

  // Markets
  listMarkets: async () => (["IN", "US", "EU"] as Market[]),

  // Perfume details (mock)
  getPerfumeBySlug: async (slug: string): Promise<Perfume> => {
    const brand: Brand = { slug: "acme", name: "ACME Parfums", founded: 1999, country: "FR" };
    const prices: BestPricesBySize = {
      "50": {
        best: { retailer: "Nykaa", url: "#", price: 4999, currency: "INR", sizeMl: 50, lastSeen: new Date().toISOString() },
        others: [
          { retailer: "Sephora IN", url: "#", price: 5199, currency: "INR", sizeMl: 50, lastSeen: new Date().toISOString() },
        ],
      },
      "100": {
        best: { retailer: "Amazon IN", url: "#", price: 7999, currency: "INR", sizeMl: 100, lastSeen: new Date().toISOString() },
        others: [
          { retailer: "Myntra", url: "#", price: 8299, currency: "INR", sizeMl: 100, lastSeen: new Date().toISOString() },
        ],
      },
    };

    return {
      slug,
      name: "Citrus Oud",
      brand,
      year: 2022,
      notes: ["bergamot", "lemon", "oud", "cedar"],
      accords: ["citrus", "woody", "resinous"],
      rating: 4.2,
      votes: 412,
      summary: "A bright citrus opening that settles into a smooth, resinous oud and cedar base.",
      prices,
      capturedAt: new Date().toISOString(),
      similarTop10: Array.from({ length: 10 }, (_, i) => ({ slug: `similar-${i+1}`, name: `Similar ${i+1}`, brandName: "ACME", rating: 3.8 + (i % 3) * 0.1 })),
    };
  },

  // Search
  searchPerfumes: async (q: string, opts?: { similarTo?: string; market?: Market }) => {
    return {
      total: 25,
      items: Array.from({ length: 12 }, (_, i) => ({
        slug: `perf-${i+1}`,
        name: `${q ? q + " " : ""}Result ${i+1}`,
        brandName: "ACME",
        rating: 3.7,
      })),
    };
  },

  // Reviews
  listReviews: async (slug: string): Promise<Review[]> => {
    return [
      {
        id: "r1",
        user: { id: "u1", name: "Ava", username: "ava", credibilityScore: 74 },
        text: "Lovely citrus that never turns sour; oud is smooth.",
        stars: 4,
        longevity: 4,
        sillage: 3,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
  },
  createReview: async (slug: string, payload: { text: string; stars: number; longevity?: number; sillage?: number }) => {
    return { ok: true };
  },

  // Alerts
  listAlerts: async () => [
    { id: "a1", slug: "citrus-oud", sizeMl: 100, threshold: 7500, active: true },
  ],
  upsertAlert: async (slug: string, sizeMl: number, threshold: number) => ({ ok: true }),

  // Smells-like voting
  voteSmellsLike: async (slugA: string, slugB: string, isSimilar: boolean) => ({ ok: true }),
};