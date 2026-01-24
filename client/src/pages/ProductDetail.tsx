import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShoppingCart, Check, ArrowLeft, BookOpen, Video, Clock, FileText, Download, Shield, Zap, HeadphonesIcon } from "lucide-react";
import { useCart } from "@/lib/cart";
import type { Product } from "@shared/schema";
import { fetchProductById, fetchSuggestedProducts } from "@/lib/products";
import { ProductGrid } from "@/components/ProductGrid";
import { Helmet } from "react-helmet";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  // ... rest of imports

  const [, setLocation] = useLocation();
  const { addToCart, isInCart } = useCart();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(parseInt(id, 10)),
    enabled: !!id
  });

  const { data: suggestedProducts, isLoading: isSuggestedLoading } = useQuery({
    queryKey: ["suggested", id],
    queryFn: () => fetchSuggestedProducts(parseInt(id, 10)),
    enabled: !!id
  });

  const inCart = product ? isInCart(product.id) : false;

  const handleAddToCart = () => {
    if (product && !inCart) {
      addToCart(product.id);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      if (!inCart) {
        addToCart(product.id);
      }
      setLocation("/checkout");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-6 w-32 mb-8" />
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Link href="/products">
          <Button data-testid="button-back-to-products">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  const isBook = product.category.toLowerCase().includes("book");
  const isCourse = product.category.toLowerCase().includes("course");

  const parseDescription = (desc: string) => {
    const sections: { title: string; content: string }[] = [];
    const lines = desc.split('\n').filter(l => l.trim());

    let currentSection = { title: "Description", content: "" };

    for (const line of lines) {
      if (line.match(/^(Course Description|Topics Covered|Key Learning Areas|Course Details|Frequently Asked Questions)/i)) {
        if (currentSection.content.trim()) {
          sections.push({ ...currentSection });
        }
        currentSection = { title: line.trim(), content: "" };
      } else if (!line.includes("How can I access") && !line.includes("What payment methods")) {
        currentSection.content += line + "\n";
      }
    }

    if (currentSection.content.trim()) {
      sections.push(currentSection);
    }

    return sections.length > 0 ? sections : [{ title: "Description", content: desc }];
  };

  const descSections = parseDescription(product.description);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">

        {product && (
          <Helmet>
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": product.title,
                "operatingSystem": "Any",
                "applicationCategory": "EducationalApplication",
                "offers": {
                  "@type": "Offer",
                  "price": product.currentPrice.toFixed(2),
                  "priceCurrency": "USD",
                  "availability": "https://schema.org/InStock"
                },
                "description": product.description.replace(/<[^>]+>/g, '').substring(0, 160)
              })}
            </script>
          </Helmet>
        )}

        <Link href="/products" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors" data-testid="link-back">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="relative">
            <div className="sticky top-24">
              <Card className="overflow-hidden">
                <div className="aspect-square relative bg-muted">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      {isBook ? (
                        <BookOpen className="w-32 h-32 text-primary/40" />
                      ) : (
                        <Video className="w-32 h-32 text-primary/40" />
                      )}
                    </div>
                  )}
                  {product.isOnSale && (
                    <Badge className="absolute top-4 left-4 bg-green-500 text-white border-0 text-sm px-3 py-1 no-default-hover-elevate no-default-active-elevate">
                      Sale!
                    </Badge>
                  )}
                </div>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">
                {product.category}
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold mb-4" data-testid="text-product-title">
                {product.title}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                {product.isOnSale && product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-3xl font-bold text-primary" data-testid="text-product-price">
                  ${product.currentPrice.toFixed(2)}
                </span>
                {product.isOnSale && product.originalPrice && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    Save ${(product.originalPrice - product.currentPrice).toFixed(2)}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                onClick={handleBuyNow}
                className="w-full text-lg bg-green-600 hover:bg-green-700 text-white animate-pulse-subtle"
                data-testid="button-buy-now"
              >
                <Zap className="w-5 h-5 mr-2 fill-current" />
                Buy Now
              </Button>

              <Button
                size="lg"
                onClick={handleAddToCart}
                variant={inCart ? "secondary" : "outline"}
                className="w-full text-lg"
                data-testid="button-add-to-cart"
              >
                {inCart ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>

            {inCart && (
              <Link href="/cart" data-testid="link-view-cart">
                <Button variant="outline" className="w-full">
                  View Cart
                </Button>
              </Link>
            )}

            <div className="grid grid-cols-3 gap-4 py-6 border-y">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Download className="w-5 h-5" />
                </div>
                <span className="text-xs text-muted-foreground">Instant Download</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-xs text-muted-foreground">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <HeadphonesIcon className="w-5 h-5" />
                </div>
                <span className="text-xs text-muted-foreground">24/7 Support</span>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                {descSections.slice(0, 1).map((section, i) => (
                  <div key={i}>
                    <h3 className="font-semibold mb-3">{section.title}</h3>
                    <p className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed">
                      {section.content.slice(0, 500)}
                      {section.content.length > 500 && "..."}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {descSections.length > 1 && (
          <Card className="mb-12">
            <CardContent className="p-6">
              <Accordion type="multiple" className="w-full">
                {descSections.slice(1).map((section, i) => (
                  <AccordionItem key={i} value={`section-${i}`}>
                    <AccordionTrigger className="text-left font-semibold">
                      {section.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed">
                        {section.content}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Frequently Asked Questions</h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="access">
                <AccordionTrigger>How can I access the content after purchase?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Immediately after checkout, we email you a secure link to all materials. If you don't see the message, please check your spam or junk folder. You can also access your downloads from your account dashboard.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="payment">
                <AccordionTrigger>What payment methods are accepted?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We accept a variety of payment methods, including credit cards, debit cards, and PayPal, to make your purchase convenient and secure.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="duration">
                <AccordionTrigger>How long do I have access to the material?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Upon purchasing, you will enjoy unlimited access to the material. You can watch and revisit the content whenever you wish, allowing for a thorough learning experience.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="mobile">
                <AccordionTrigger>Is the content accessible on mobile devices?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, our content is designed to be accessible on both desktop and mobile devices. You can easily access the materials using a web browser on your smartphone or tablet.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="download">
                <AccordionTrigger>Can I download the materials for offline access?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Absolutely! You will have the option to download all materials, including videos and supplementary resources. This allows you to access the content offline whenever and wherever it suits you best.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </CardContent>
    </Card>

        {/* Suggested Products Section */ }
  <div className="mt-16 border-t pt-12">
    <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
    <ProductGrid products={suggestedProducts || []} isLoading={isSuggestedLoading} />
  </div>
      </div >
    </div >
  );
}
