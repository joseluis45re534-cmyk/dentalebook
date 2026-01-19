import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart";
import { Loader2 } from "lucide-react";

// Initialize Stripe outside component to avoid recreation
const stripePromise = loadStripe("pk_test_51SpzmQR6degPKw4yK2mh7aE7e21ESLtR0BzoZjjrcK5k9UVy9uWdDuOTkJEWBU0oAmkiz2XXbuGJV7BuT5Gdkcas00MUjxn30E");

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        if (!email || !name) {
            setMessage("Please fill in all fields.");
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/request`,
                payment_method_data: {
                    billing_details: {
                        name: name,
                        email: email,
                    }
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
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
            {message && <div className="text-destructive text-sm" id="payment-message">{message}</div>}
            <Button
                disabled={isLoading || !stripe || !elements || !email || !name}
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
                            <div className="min-h-[400px]">
                                <Elements options={options} stripe={stripePromise}>
                                    <CheckoutForm clientSecret={clientSecret} />
                                </Elements>
                            </div>
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
