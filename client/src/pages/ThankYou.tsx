
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { useCart } from "@/lib/cart";

export default function ThankYou() {
    const search = useSearch();
    const params = new URLSearchParams(search);
    const paymentIntentId = params.get("payment_intent");
    const [orderStatus, setOrderStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
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
                        setErrorMessage(data.error || 'Unknown error occurred');
                        setOrderStatus('error');
                    }
                })
                .catch((err) => {
                    console.error('Order confirmation failed', err);
                    setErrorMessage(err.message || 'Network error');
                    setOrderStatus('error');
                });
        } else {
            // Redirect to home if no payment intent
            window.location.href = '/';
        }
    }, [paymentIntentId, clearCart]);

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
                            We couldn't verify your order automatically. <br />
                            <span className="text-xs text-red-500 bg-red-50 p-2 rounded mt-2 inline-block font-mono">
                                Error: {errorMessage}
                            </span>
                        </p>
                        <p className="text-sm text-muted-foreground mb-6">
                            If you have been charged, please contact support with the error above.
                        </p>
                        <Button onClick={() => window.location.href = '/'} variant="outline">
                            Return to Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return null;
}
