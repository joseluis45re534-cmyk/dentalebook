import { useQuery } from "@tanstack/react-query";
import { Hero } from "@/components/Hero";
import { CategorySection } from "@/components/CategorySection";
import { RequestBanner } from "@/components/RequestBanner";
import { fetchProducts } from "@/lib/products";

export default function Home() {
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["products", "courses"],
    queryFn: () => fetchProducts({ category: "courses", limit: 8 })
  });

  const { data: booksData, isLoading: booksLoading } = useQuery({
    queryKey: ["products", "books"],
    queryFn: () => fetchProducts({ category: "books", limit: 8 })
  });

  return (
    <div className="min-h-screen">
      <Hero />

      <CategorySection
        title="Latest Courses"
        products={coursesData?.products || []}
        viewAllHref="/products?category=courses"
        isLoading={coursesLoading}
      />

      <CategorySection
        title="Latest Books"
        products={booksData?.products || []}
        viewAllHref="/products?category=books"
        isLoading={booksLoading}
      />

      <RequestBanner />
    </div>
  );
}
