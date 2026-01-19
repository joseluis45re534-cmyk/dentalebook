import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ShoppingCart, BookOpen, Video, Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { fetchProductsByIds } from "@/lib/products";
import type { Product } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const productIds = items.map(item => item.productId);

  const { data } = useQuery<{ products: Product[] }>({
    queryKey: ["products", "batch", productIds],
    queryFn: async () => {
      if (productIds.length === 0) return { products: [] };
      const products = await fetchProductsByIds(productIds);
      return { products };
    },
    enabled: productIds.length > 0,
  });

  const products = data?.products || [];
  const cartProducts = items
    .map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.productId),
    }))
    .filter((item) => item.product) as { productId: number; quantity: number; product: Product }[];

  const total = getTotal(products);
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    setLocation("/checkout");
  };



  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven't added any products yet. Start browsing our collection!
          </p>
          <Link href="/products" data-testid="link-start-shopping">
            <Button size="lg" className="gap-2">
              <ShoppingBag className="w-5 h-5" />
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <Link href="/products" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors" data-testid="link-continue-shopping">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Continue Shopping
        </Link>

        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartProducts.map(({ product, quantity }) => {
              const isBook = product.category.toLowerCase().includes("book");
              return (
                <Card key={product.id} data-testid={`card-cart-item-${product.id}`}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Link href={`/product/${product.id}`} className="shrink-0">
                        <div className="w-24 h-24 rounded-md overflow-hidden bg-muted">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {isBook ? (
                                <BookOpen className="w-8 h-8 text-muted-foreground" />
                              ) : (
                                <Video className="w-8 h-8 text-muted-foreground" />
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${product.id}`}>
                          <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                            {product.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">{product.category}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                              data-testid={`button-decrease-${product.id}`}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              data-testid={`button-increase-${product.id}`}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-lg">
                              ${(product.currentPrice * quantity).toFixed(2)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removeFromCart(product.id)}
                              data-testid={`button-remove-${product.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <div className="flex justify-end">
              <Button variant="outline" onClick={clearCart} className="text-destructive" data-testid="button-clear-cart">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-green-600">-$0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span data-testid="text-cart-total">${total.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  data-testid="button-checkout"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || items.length === 0}
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Secure checkout powered by Stripe
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
