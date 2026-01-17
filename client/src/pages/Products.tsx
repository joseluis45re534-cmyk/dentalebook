import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ProductGrid } from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import type { PaginatedResponse } from "@shared/schema";

export default function Products() {
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  
  const urlParams = new URLSearchParams(searchString);
  const initialQuery = urlParams.get("query") || "";
  const initialCategory = urlParams.get("category") || "";
  const initialSort = urlParams.get("sort") || "date";
  const initialPage = parseInt(urlParams.get("page") || "1", 10);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("query", searchQuery);
    if (category) params.set("category", category);
    if (sort && sort !== "date") params.set("sort", sort);
    if (page > 1) params.set("page", page.toString());
    params.set("limit", "12");
    return params.toString();
  };

  const queryParams = {
    query: searchQuery,
    category,
    sort,
    page,
    limit: 12,
  };

  const { data, isLoading } = useQuery<PaginatedResponse>({
    queryKey: ["/api/products", queryParams],
  });

  useEffect(() => {
    const newUrl = `/products${buildQueryString() ? `?${buildQueryString()}` : ""}`;
    setLocation(newUrl, { replace: true });
  }, [searchQuery, category, sort, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategory("");
    setSort("date");
    setPage(1);
  };

  const hasFilters = searchQuery || category || sort !== "date";

  const getPageTitle = () => {
    if (category === "courses") return "Dental Courses";
    if (category === "books") return "Dental Books & Journals";
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    return "All Products";
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{getPageTitle()}</h1>
          <p className="text-muted-foreground">
            {data?.total ? `${data.total} products found` : "Browse our collection"}
          </p>
        </div>

        <div className="bg-card rounded-lg border p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-10"
                data-testid="input-products-search"
              />
            </form>

            <div className="flex gap-2">
              <Select value={category} onValueChange={(v) => { setCategory(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="w-[150px]" data-testid="select-category">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="courses">Courses</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
                <SelectTrigger className="w-[150px]" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Newest First</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="title">Title: A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasFilters && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                </Badge>
              )}
              {category && (
                <Badge variant="secondary" className="gap-1">
                  Category: {category}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setCategory("")} />
                </Badge>
              )}
              {sort !== "date" && (
                <Badge variant="secondary" className="gap-1">
                  Sort: {sort}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSort("date")} />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                Clear all
              </Button>
            </div>
          )}
        </div>

        <ProductGrid 
          products={data?.products || []} 
          isLoading={isLoading}
          emptyMessage="No products match your criteria"
        />

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              data-testid="button-prev-page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                let pageNum: number;
                if (data.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= data.totalPages - 2) {
                  pageNum = data.totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="icon"
                    onClick={() => setPage(pageNum)}
                    data-testid={`button-page-${pageNum}`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              data-testid="button-next-page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
