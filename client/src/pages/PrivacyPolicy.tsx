import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none space-y-4">
                    <p className="text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>

                    <p>
                        DentalEdu Pro ("we," "our," or "us") respects your privacy and is committed to protecting your personal data.
                        This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website
                        and purchase our digital products.
                    </p>

                    <h3>1. Information We Collect</h3>
                    <p>We may collect the following types of information:</p>
                    <ul>
                        <li><strong>Personal Information:</strong> Name, email address, and payment information (processed securely by Stripe) when you make a purchase.</li>
                        <li><strong>Usage Data:</strong> Information about how you interact with our website (e.g., pages visited, time spent) using cookies and analytics tools.</li>
                    </ul>

                    <h3>2. How We Use Your Information</h3>
                    <p>We use your data to:</p>
                    <ul>
                        <li>Process and deliver your digital orders instantly.</li>
                        <li>Send order confirmations and download links.</li>
                        <li>Provide customer support.</li>
                        <li>Improve our website and product offerings.</li>
                    </ul>

                    <h3>3. Data Security</h3>
                    <p>
                        We implement industry-standard security measures to protect your data. Payment transactions are encrypted
                        and processed by our third-party payment processor, Stripe. We do NOT store your full credit card details on our servers.
                    </p>

                    <h3>4. Sharing of Information</h3>
                    <p>
                        We do not sell or rent your personal information to third parties. We may share data with trusted service providers
                        (like Stripe for payments or Cloudflare for hosting) solely to operate our business and provide services to you.
                    </p>

                    <h3>5. Your Rights</h3>
                    <p>
                        Depending on your location, you may have the right to access, correct, or delete your personal data.
                        To exercise these rights, please contact us at <a href="mailto:support@dentaledu.pro" className="text-primary hover:underline">support@dentaledu.pro</a>.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
