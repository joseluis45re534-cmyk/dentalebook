import { Link } from "wouter";
import { ShoppingCart, Check, BookOpen, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";
import { useCart } from "@/lib/cart";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart) {
      addToCart(product.id);
    }
  };

  const isBook = product.category.toLowerCase().includes("book");
  const isCourse = product.category.toLowerCase().includes("course");

  return (
    <Link href={`/product/${product.id}`} data-testid={`card-product-${product.id}`}>
      <Card className="group h-full overflow-hidden hover-elevate active-elevate-2 transition-all duration-200 cursor-pointer">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              {isBook ? (
                <BookOpen className="w-16 h-16 text-primary/40" />
              ) : (
                <Video className="w-16 h-16 text-primary/40" />
              )}
            </div>
          )}
          {product.isOnSale && (
            <Badge 
              className="absolute top-3 left-3 bg-green-500 text-white border-0 no-default-hover-elevate no-default-active-elevate"
              data-testid={`badge-sale-${product.id}`}
            >
              Sale!
            </Badge>
          )}
        </div>
        <CardContent className="p-4 flex flex-col gap-3">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
            {product.title}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {product.isOnSale && product.originalPrice && (
              <span className="text-muted-foreground text-sm line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="font-bold text-lg text-primary">
              ${product.currentPrice.toFixed(2)}
            </span>
          </div>
          <Button
            size="sm"
            onClick={handleAddToCart}
            variant={inCart ? "secondary" : "default"}
            className="w-full mt-auto"
            data-testid={`button-add-to-cart-${product.id}`}
          >
            {inCart ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                In Cart
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
