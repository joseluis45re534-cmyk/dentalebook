import { Link } from "wouter";
import { GraduationCap, Shield, Zap, HeadphonesIcon, Mail, CreditCard } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2" data-testid="link-footer-logo">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-primary-foreground">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-bold text-xl">DentalEdu Pro</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Budget-friendly educational material for dental students and practitioners.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-muted-foreground text-sm hover:text-foreground transition-colors" data-testid="link-footer-home">
                Home
              </Link>
              <Link href="/products?category=courses" className="text-muted-foreground text-sm hover:text-foreground transition-colors" data-testid="link-footer-courses">
                Courses
              </Link>
              <Link href="/products?category=books" className="text-muted-foreground text-sm hover:text-foreground transition-colors" data-testid="link-footer-books">
                Books
              </Link>
              <Link href="/request" className="text-muted-foreground text-sm hover:text-foreground transition-colors" data-testid="link-footer-request">
                Request a Book
              </Link>
              <Link href="/refunds" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                Refund & Returns
              </Link>
              <Link href="/shipping" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                Shipping & Delivery
              </Link>
              <Link href="/privacy-policy" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/about" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                Contact Us
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Support</h4>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Mail className="w-4 h-4" />
              <span>support@dentaledu.pro</span>
            </div>
            <p className="text-muted-foreground text-xs mt-2">
              The Loft, 2 Newlands Pl, Penrith CA11 9DR, UK
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">We Accept</h4>
            <div className="flex items-center gap-2">
              <CreditCard className="w-8 h-8 text-muted-foreground" />
              <span className="text-muted-foreground text-sm">All major cards</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8 border-t border-b mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-medium text-sm">Secured Payment</h5>
              <p className="text-muted-foreground text-xs">Payments are secure and encrypted</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-medium text-sm">Instant Delivery</h5>
              <p className="text-muted-foreground text-xs">Receive materials immediately</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
              <HeadphonesIcon className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-medium text-sm">24/7 Support</h5>
              <p className="text-muted-foreground text-xs">Support available via email</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground text-sm">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            DentalEdu Pro &copy; {new Date().getFullYear()}. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4">
            <img
              src="/assets/payment-methods.png"
              alt="Accepted Payment Methods"
              className="h-10 w-auto object-contain opacity-80"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
