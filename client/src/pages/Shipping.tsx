import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

export default function Shipping() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold flex items-center gap-3">
                        <Zap className="h-8 w-8 text-primary" />
                        Shipping & Delivery Policy
                    </CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none space-y-4">
                    <p className="lead text-lg text-muted-foreground">
                        All products on DentalEdu Pro are 100% digital. We offer <strong>Instant Delivery</strong> for all purchases.
                    </p>

                    <h3>Instant Digital Delivery</h3>
                    <p>
                        Immediately after your payment is successfully processed, you will receive an automatic email containing your download links. You can also access your downloads directly from your account dashboard or the "Thank You" page upon completing the checkout.
                    </p>

                    <h3>No Physical Shipping</h3>
                    <p>
                        Since we sell exclusively digital educational materials (e-books, courses, PDFs), <strong>no physical product will be shipped</strong> to your address. You do not need to wait for courier delivery.
                    </p>

                    <h3>What if I don't receive the email?</h3>
                    <p>
                        In rare cases, the email might end up in your Spam or Junk folder. Please check there first.
                        If you still cannot find your download link, please contact us at <a href="mailto:support@dentaledu.pro" className="text-primary hover:underline">support@dentaledu.pro</a> with your order details, and we will resend the link manually.
                    </p>

                    <h3>24/7 Access</h3>
                    <p>
                        Once purchased, your files are available for download 24/7 from anywhere in the world.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
