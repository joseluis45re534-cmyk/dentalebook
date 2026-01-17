import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchParamsSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/products/batch", async (req, res) => {
    try {
      const { ids } = req.body as { ids: number[] };
      
      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: "Invalid request - ids must be an array" });
      }
      
      const products = await storage.getProductsByIds(ids);
      res.json({ products });
    } catch (error) {
      console.error("Error fetching products by IDs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get("/api/products", async (req, res) => {
    try {
      const rawParams = {
        query: req.query.query as string | undefined,
        category: req.query.category as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 12,
        sort: (req.query.sort as string) || "date",
      };
      
      const params = searchParamsSchema.parse(rawParams);
      const result = await storage.getProducts(params);
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(400).json({ error: "Invalid request parameters" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}
