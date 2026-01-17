import { z } from "zod";

export const productSchema = z.object({
  id: z.number(),
  title: z.string(),
  price: z.string(),
  currentPrice: z.number(),
  originalPrice: z.number().nullable(),
  isOnSale: z.boolean(),
  description: z.string(),
  url: z.string(),
  imageFile: z.string().nullable(),
  imageUrl: z.string().nullable(),
  category: z.string(),
});

export type Product = z.infer<typeof productSchema>;

export const cartItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1),
});

export type CartItem = z.infer<typeof cartItemSchema>;

export const searchParamsSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(12),
  sort: z.enum(["date", "price-asc", "price-desc", "title"]).default("date"),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

export const paginatedResponseSchema = z.object({
  products: z.array(productSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
  hasMore: z.boolean(),
});

export type PaginatedResponse = z.infer<typeof paginatedResponseSchema>;

// User schema kept for potential future auth
import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
