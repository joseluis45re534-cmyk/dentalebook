import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";

export function RequestBanner() {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <MessageSquarePlus className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Can't find your favorite book or course?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Request it and we'll do our best to get it for you!
          </p>
          <Link href="/request" data-testid="link-request-banner">
            <Button size="lg" variant="secondary" className="gap-2">
              <MessageSquarePlus className="w-5 h-5" />
              Request Your Book
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
