import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function About() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary text-primary-foreground">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        About DentalEdu Pro
                    </CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none space-y-4">
                    <p className="text-lg lead">
                        Welcome to <strong>DentalEdu Pro</strong>, your premier destination for accessible, high-quality digital dental education materials.
                    </p>

                    <h3>Our Mission</h3>
                    <p>
                        We believe that knowledge should be accessible to everyone. Dental education materials, including textbooks and specialist guides,
                        can often be prohibitively expensive. Our mission is to bridge that gap by providing affordable, instant-access digital resources
                        to dental students, practitioners, and enthusiasts worldwide.
                    </p>

                    <h3>What We Offer</h3>
                    <p>
                        We curate a specialized collection of digital e-books, clinical guides, and course notes covering topics from
                        General Dentistry and Orthodontics to Implantology and Oral Surgery.
                    </p>

                    <h3>Why Choose Us?</h3>
                    <ul>
                        <li><strong>Instant Access:</strong> No shipping times. Download and start learning immediately.</li>
                        <li><strong>Affordability:</strong> Competitive pricing to help students and professionals save.</li>
                        <li><strong>Quality:</strong> High-resolution PDF formats compatible with all your devices.</li>
                    </ul>

                    <p>
                        Thank you for choosing DentalEdu Pro as your learning partner.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
