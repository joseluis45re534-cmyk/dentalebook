import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none space-y-4">
                    <p className="text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>

                    <h3>1. Acceptance of Terms</h3>
                    <p>
                        By accessing and using the DentalEdu Pro website and purchasing our products, you agree to be bound by these Terms of Service.
                        If you do not agree, please do not use our services.
                    </p>

                    <h3>2. Digital Products & Licensing</h3>
                    <p>
                        All products sold on this site are digital goods (e-books, courses, PDFs).
                        Upon purchase, you are granted a non-exclusive, non-transferable license to access and use the content for
                        personal or professional educational purposes. You may NOT redistribute, resell, or share the files publicly.
                    </p>

                    <h3>3. Payments</h3>
                    <p>
                        All prices are listed in USD. Payments are processed securely via Stripe.
                        By proceeding with a transaction, you confirm that you are the authorized holder of the payment method used.
                    </p>

                    <h3>4. Refund Policy</h3>
                    <p>
                        As stated in our Refund Policy, all sales of digital products are generally final.
                        Please review the Refund Policy page for exceptions regarding defective files.
                    </p>

                    <h3>5. Intellectual Property</h3>
                    <p>
                        All content on this website, including text, graphics, logos, and digital products, is the property of
                        DentalEdu Pro or its content suppliers and is protected by copyright laws.
                    </p>

                    <h3>6. Disclaimer</h3>
                    <p>
                        Our educational materials are for informational purposes only. They do not constitute medical advice.
                        Practitioners must use their own professional judgment when treating patients.
                    </p>

                    <h3>7. Governing Law</h3>
                    <p>
                        These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which DentalEdu Pro operates.
                    </p>

                    <h3>8. Contact</h3>
                    <p>
                        For any questions regarding these terms, please contact us at <a href="mailto:support@dentaledu.pro" className="text-primary hover:underline">support@dentaledu.pro</a>.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
