import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { MessageSquarePlus, Send, Book, GraduationCap, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useCart } from "@/lib/cart";

const requestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  bookTitle: z.string().min(3, "Book/Course title must be at least 3 characters"),
  author: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type RequestForm = z.infer<typeof requestSchema>;

export default function Request() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const location = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const paymentIntentId = params.get("payment_intent");
  const [orderStatus, setOrderStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const { clearCart } = useCart();

  // Handle Order Confirmation Flow
  useEffect(() => {
    if (paymentIntentId) {
      setOrderStatus('loading');

      fetch('/api/orders/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId })
      })
        .then(async (res) => {
          const data = await res.json();
          if (data.success || data.message === 'Order already confirmed') {
            setOrderStatus('success');
            clearCart();
          } else {
            console.error(data.error);
            setOrderStatus('error');
          }
        })
        .catch((err) => {
          console.error('Order confirmation failed', err);
          setOrderStatus('error');
        });
    }
  }, [paymentIntentId, clearCart]);

  const form = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      name: "",
      email: "",
      bookTitle: "",
      author: "",
      additionalInfo: "",
    },
  });

  const onSubmit = (data: RequestForm) => {
    console.log("Request submitted:", data);
    setIsSubmitted(true);
    toast({
      title: "Request Submitted!",
      description: "We've received your request and will get back to you soon.",
    });
  };

  // RENDER: Order Confirmation States
  if (paymentIntentId) {
    if (orderStatus === 'loading') {
      return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center py-12">
            <CardContent className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <h2 className="text-xl font-semibold">Verifying Order...</h2>
              <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (orderStatus === 'success') {
      return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
              <p className="text-muted-foreground mb-6">
                Your order has been confirmed successfully. We have sent a confirmation email to your inbox.
              </p>
              <Button onClick={() => window.location.href = '/'} variant="default">
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (orderStatus === 'error') {
      return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
              <p className="text-muted-foreground mb-6">
                We couldn't verify your order automatically. If you have been charged, please contact support.
              </p>
              <Button onClick={() => window.location.href = '/'} variant="outline">
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // RENDER: Default Request Form (Existing page content)
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
              <MessageSquarePlus className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-6">
              We've received your request and will do our best to find it for you.
              We'll email you when it's available.
            </p>
            <Button onClick={() => setIsSubmitted(false)} variant="outline" data-testid="button-submit-another">
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
              <MessageSquarePlus className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Request a Book or Course</h1>
            <p className="text-muted-foreground">
              Can't find what you're looking for? Let us know and we'll do our best to get it for you!
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5" />
                Request Form
              </CardTitle>
              <CardDescription>
                Fill in the details below and we'll try to source the material for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} data-testid="input-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bookTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Book/Course Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter the title of the book or course" {...field} data-testid="input-title" />
                        </FormControl>
                        <FormDescription>
                          Please be as specific as possible
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author/Instructor (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter the author or instructor name" {...field} data-testid="input-author" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Information (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any other details that might help us find the right material (edition, year, publisher, etc.)"
                            className="min-h-[100px]"
                            {...field}
                            data-testid="input-additional-info"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" size="lg" className="w-full" data-testid="button-submit-request">
                    <Send className="w-4 h-4 mr-2" />
                    Submit Request
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Book className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Books & Journals</h3>
                  <p className="text-sm text-muted-foreground">
                    Request any dental textbook, journal, or reference material
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Courses & Webinars</h3>
                  <p className="text-sm text-muted-foreground">
                    Request video courses from specific instructors or topics
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

}
