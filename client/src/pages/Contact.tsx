import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Contact Us</CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none space-y-8">
                    <p className="text-lg">
                        We are here to help! Whether you have a question about your order, need technical assistance,
                        or have a suggestion for a new book, please don't hesitate to reach out.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                                <Mail className="h-5 w-5" /> Email Support
                            </h3>
                            <p>
                                The best way to reach us is via email. We typically respond within 24 hours.
                                <br />
                                <a href="mailto:support@dentaledu.pro" className="text-primary font-bold hover:underline">
                                    support@dentaledu.pro
                                </a>
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                                <MapPin className="h-5 w-5" /> Mailing Address
                            </h3>
                            <p>
                                DentalEdu Pro
                                <br />
                                The Loft, 2 Newlands Pl
                                <br />
                                Penrith CA11 9DR, UK
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <Phone className="h-5 w-5" /> Phone
                        </h3>
                        <p>
                            +1 (555) 123-4567 (Mon-Fri, 9am - 5pm EST)
                        </p>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
