import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Video, Award } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 w-fit text-sm font-medium">
              <Award className="w-4 h-4" />
              Premium Dental Education
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Budget-friendly educational material for{" "}
              <span className="text-primary">dental professionals</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Access premium dental courses, ebooks, and training materials at affordable prices. 
              Learn from world-renowned experts and advance your practice.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <Link href="/products" data-testid="link-discover">
                <Button size="lg" className="gap-2">
                  Discover Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/products?category=courses" data-testid="link-browse-courses">
                <Button size="lg" variant="outline" className="gap-2">
                  <Video className="w-4 h-4" />
                  Browse Courses
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-8 mt-4 pt-4 border-t">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-primary">500+</span>
                <span className="text-sm text-muted-foreground">Courses</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-primary">1000+</span>
                <span className="text-sm text-muted-foreground">E-Books</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-primary">50k+</span>
                <span className="text-sm text-muted-foreground">Students</span>
              </div>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl blur-3xl transform rotate-6" />
            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-card rounded-2xl p-6 shadow-lg border">
                  <Video className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Video Courses</h3>
                  <p className="text-sm text-muted-foreground">HD quality dental training videos from experts</p>
                </div>
                <div className="bg-card rounded-2xl p-6 shadow-lg border">
                  <BookOpen className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Digital Books</h3>
                  <p className="text-sm text-muted-foreground">Comprehensive textbooks and journals</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-primary text-primary-foreground rounded-2xl p-6 shadow-lg">
                  <Award className="w-10 h-10 mb-4" />
                  <h3 className="font-semibold mb-2">Expert Content</h3>
                  <p className="text-sm opacity-90">Learn from world-renowned practitioners</p>
                </div>
                <div className="bg-card rounded-2xl p-6 shadow-lg border">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                      50%
                    </div>
                    <span className="font-medium">Off Select Items</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Huge savings on premium content</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
