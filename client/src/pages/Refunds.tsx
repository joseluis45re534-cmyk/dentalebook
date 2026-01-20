import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Refunds() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Refund & Returns Policy</CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none space-y-4">
                    <p>
                        At DentalEdu Pro, we take pride in the quality of our digital educational resources.
                        Please carefully review our Refund & Returns Policy before making a purchase.
                    </p>

                    <h3>Digital Products</h3>
                    <p>
                        Due to the nature of digital products (instant download), <strong>all sales are final and non-refundable</strong> once the download link has been sent or the file has been accessed.
                    </p>
                    <p>
                        We cannot accept returns on digital items such as e-books, courses, and downloadable software, as there is no way to "return" the file once it has been delivered.
                    </p>

                    <h3>Exceptions</h3>
                    <p>
                        We may consider a refund request under the following exceptional circumstances:
                    </p>
                    <ul>
                        <li><strong>Major Defect:</strong> If the file is corrupt or materially different from the description, and our support team is unable to fix the issue within 48 hours.</li>
                        <li><strong>Double Purchase:</strong> If you accidentally purchased the same product twice.</li>
                    </ul>

                    <h3>How to Request Help</h3>
                    <p>
                        If you experience any issues with your download or file, please contact our support team immediately at <a href="mailto:support@dentaledu.pro" className="text-primary hover:underline">support@dentaledu.pro</a>. We are committed to ensuring you receive the working product you paid for.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
