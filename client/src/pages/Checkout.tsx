import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Elements, PaymentElement, useStripe, useElements, ExpressCheckoutElement } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProductsByIds } from "@/lib/products";
import type { Product } from "@shared/schema";

// Initialize Stripe
const stripePromise = loadStripe("pk_live_51SmUsuH1B3BkzHT6ftQdhl1KdHz4HDBhdQBwWYiL6p1hWgS94h6eKDjDfpNnp0QwdBB8miSmD5i8RzUAxg5udf2N00atehEkFw");

function PaymentForm({ clientSecret, email, name }: { clientSecret: string; email: string; name: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const onExpressConfirm = async (event: any) => {
        if (!stripe || !elements) return;

        setIsLoading(true);
        const { error } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: {
                return_url: `${window.location.origin}/thank-you`,
                payment_method_data: {
                    billing_details: { name, email }
                },
                receipt_email: email,
            },
        });

        if (error) {
            setMessage(error.message || "An unexpected error occurred.");
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/thank-you`,
                payment_method_data: {
                    billing_details: { name, email }
                },
                receipt_email: email,
            },
        });

        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message || "An unexpected error occurred.");
        } else {
            setMessage("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-6">
                <ExpressCheckoutElement onConfirm={onExpressConfirm} />
            </div>

            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or pay with card
                    </span>
                </div>
            </div>

            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
            {message && <div className="text-destructive text-sm">{message}</div>}
            <Button disabled={isLoading || !stripe || !elements} className="w-full" size="lg">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                    </>
                ) : "Pay now"}
            </Button>
            
            <div className="flex justify-center mt-4">
                <img 
                    src="/assets/trust-badge.png" 
                    alt="Guaranteed Safe Checkout" 
                    className="h-12 object-contain"
                />
            </div>
        </form>
    );
}

export default function Checkout() {
    const [step, setStep] = useState<1 | 2>(1);
    const [clientSecret, setClientSecret] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [isInitializing, setIsInitializing] = useState(false);

    const { items, getTotal } = useCart();
    const { toast } = useToast();
    const [, setLocation] = useLocation();

    // Fetch products
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

    useEffect(() => {
        if (items.length === 0) setLocation("/cart");
    }, [items, setLocation]);

    const handleContinueToPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email) {
            toast({ title: "Error", description: "Please fill in all details.", variant: "destructive" });
            return;
        }

        setIsInitializing(true);

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: items.map(i => ({ id: i.productId, quantity: i.quantity })),
                    customerName: name,
                    customerEmail: email
                }),
            });

            if (!res.ok) throw new Error("Failed to initialize checkout");
            const data = await res.json();
            setClientSecret(data.clientSecret);
            setStep(2); // Move to payment step
        } catch (error) {
            toast({
                title: "Error",
                description: "Could not initialize payment. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsInitializing(false);
        }
    };

    const appearance = { theme: 'stripe' as const, variables: { colorPrimary: '#0f172a' } };

    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Order Summary */}
                    <div className="space-y-6 order-2 lg:order-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {cartProducts.map(({ product, quantity }) => (
                                    <div key={product.id} className="flex gap-4 text-sm">
                                        <div className="w-16 h-16 rounded overflow-hidden bg-muted shrink-0">
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">📦</div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium line-clamp-2">{product.title}</p>
                                            <p className="text-muted-foreground">Qty: {quantity}</p>
                                        </div>
                                        <div className="font-medium">${(product.currentPrice * quantity).toFixed(2)}</div>
                                    </div>
                                ))}
                                <div className="pt-4 border-t space-y-2">
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                        <span>Total</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Step 1 or Step 2 Form */}
                    <div className="order-1 lg:order-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>{step === 1 ? "Contact Information" : "Payment"}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {step === 1 ? (
                                    <form onSubmit={handleContinueToPayment} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                        </div>
                                        <Button disabled={isInitializing} className="w-full" size="lg">
                                            {isInitializing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Initializing...
                                                </>
                                            ) : "Continue to Payment"}
                                        </Button>
                                    </form>
                                ) : (
                                    clientSecret && (
                                        <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                                            <PaymentForm clientSecret={clientSecret} email={email} name={name} />
                                        </Elements>
                                    )
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
