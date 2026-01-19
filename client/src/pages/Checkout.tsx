import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart";
import { Loader2 } from "lucide-react";

// Initialize Stripe outside component to avoid recreation
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return to a completion page or the current page
                return_url: `${window.location.origin}/request`,
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
            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
            {message && <div className="text-destructive text-sm" id="payment-message">{message}</div>}
            <Button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full"
                size="lg"
            >
                <span id="button-text">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        "Pay now"
                    )}
                </span>
            </Button>
        </form>
    );
}

export default function Checkout() {
    const [clientSecret, setClientSecret] = useState("");
    const { items, getTotal } = useCart();
    const { toast } = useToast();
    const [, setLocation] = useLocation();

    useEffect(() => {
        if (items.length === 0) {
            setLocation("/cart");
            return;
        }

        // Create PaymentIntent as soon as the page loads
        fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                items: items.map(i => ({ id: i.productId, quantity: i.quantity }))
            }),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to initialize checkout");
                return res.json();
            })
            .then((data) => setClientSecret(data.clientSecret))
            .catch((error) => {
                toast({
                    title: "Error",
                    description: "Could not initialize checkout. Please try again.",
                    variant: "destructive"
                });
            });
    }, [items, setLocation, toast]);

    const appearance = {
        theme: 'stripe' as const,
        variables: {
            colorPrimary: '#0f172a',
        },
    };
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {clientSecret ? (
                            <Elements options={options} stripe={stripePromise}>
                                <CheckoutForm clientSecret={clientSecret} />
                            </Elements>
                        ) : (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
