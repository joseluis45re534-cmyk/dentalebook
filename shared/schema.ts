
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

export interface SearchParams {
  query?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}
