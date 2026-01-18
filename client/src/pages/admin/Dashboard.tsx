import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

export default function AdminDashboard() {
    const [, setLocation] = useLocation();

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        if (!token) {
            setLocation("/admin/login");
        }
    }, [setLocation]);

    return (
        <div className="min-h-screen bg-muted/30 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <Button variant="outline" onClick={() => {
                        localStorage.removeItem("admin_token");
                        setLocation("/admin/login");
                    }}>
                        Logout
                    </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link href="/admin/products">
                        <div className="bg-card p-6 rounded-lg shadow-sm border hover:border-primary cursor-pointer transition-colors">
                            <h2 className="font-semibold text-xl mb-2">Products</h2>
                            <p className="text-muted-foreground">Manage books and courses</p>
                        </div>
                    </Link>
                    <Link href="/admin/orders">
                        <div className="bg-card p-6 rounded-lg shadow-sm border hover:border-primary cursor-pointer transition-colors">
                            <h2 className="font-semibold text-xl mb-2">Orders</h2>
                            <p className="text-muted-foreground">View transactions</p>
                        </div>
                    </Link>
                    <Link href="/admin/customers">
                        <div className="bg-card p-6 rounded-lg shadow-sm border hover:border-primary cursor-pointer transition-colors">
                            <h2 className="font-semibold text-xl mb-2">Customers</h2>
                            <p className="text-muted-foreground">View client list</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
