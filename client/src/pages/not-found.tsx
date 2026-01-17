import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-8xl font-bold text-primary/20 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track!
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/" data-testid="link-404-home">
            <Button className="gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
          <Link href="/products" data-testid="link-404-products">
            <Button variant="outline" className="gap-2">
              <Search className="w-4 h-4" />
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
