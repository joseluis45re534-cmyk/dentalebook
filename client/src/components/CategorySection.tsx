import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "./ProductGrid";
import { ArrowRight } from "lucide-react";
import type { Product } from "@shared/schema";

interface CategorySectionProps {
  title: string;
  products: Product[];
  viewAllHref: string;
  isLoading?: boolean;
}

export function CategorySection({ title, products, viewAllHref, isLoading }: CategorySectionProps) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          <Link href={viewAllHref} data-testid={`link-view-all-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            <Button variant="outline" className="gap-2">
              View More
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <ProductGrid products={products} isLoading={isLoading} />
      </div>
    </section>
  );
}
