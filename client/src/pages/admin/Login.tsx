import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Store the mock token
                localStorage.setItem("admin_token", data.token);
                toast({
                    title: "Login Successful",
                    description: "Welcome back, Admin.",
                });
                setLocation("/admin/dashboard");
            } else {
                toast({
                    variant: "destructive",
                    title: "Access Denied",
                    description: `${data.error || "Invalid password"} ${data.details || ""} (Found: ${data.env_keys_found || "None"})`,
                });
            }
        } catch (error) {
            // Graceful fallback for local dev without Functions running
            if (password === "admin123") {
                localStorage.setItem("admin_token", "mock-admin-token");
                toast({
                    title: "Dev Mode Login",
                    description: "Logged in via client-side fallback (Functions not running?).",
                });
                setLocation("/admin/dashboard");
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not connect to login server.",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
            <Card className="w-full max-w-md mx-4">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <Lock className="w-6 h-6" />
                        Admin Access
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Enter Admin Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Verifying..." : "Login"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
