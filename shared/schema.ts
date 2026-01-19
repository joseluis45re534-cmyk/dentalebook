import { z } from "zod";

export interface Product {
  id: number;
  title: string;
  description: string;
  price: string;
  currentPrice: number;
  originalPrice: number | null;
  isOnSale: boolean;
  url: string;
  imageFile: string | null;
  imageUrl: string | null;
  category: string;
}

export const searchParamsSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

export interface PaginatedResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

// Add strict insert schema if needed by server/routes or storage
export const insertProductSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.string(),
  currentPrice: z.number(),
  originalPrice: z.number().nullable().optional(),
  isOnSale: z.boolean().default(false),
  url: z.string(),
  imageFile: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  category: z.string(),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
