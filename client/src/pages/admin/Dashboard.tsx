
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import {
    Users,
    ShoppingCart,
    TrendingUp,
    DollarSign,
    Loader2,
    Package,
    ShoppingBag,
    LogOut,
    Code
} from "lucide-react";

export default function AdminDashboard() {
    const [, setLocation] = useLocation();

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        if (!token) {
            setLocation("/admin/login");
        }
    }, [setLocation]);

    const { data: stats, isLoading } = useQuery({
        queryKey: ["admin-stats"],
        queryFn: async () => {
            const res = await fetch("/api/analytics/dashboard");
            if (!res.ok) throw new Error("Failed to fetch stats");
            return res.json();
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 p-8 space-y-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <div className="flex gap-4">
                        <Link href="/">
                            <Button variant="ghost">View Site</Button>
                        </Link>
                        <Button variant="outline" onClick={() => {
                            localStorage.removeItem("admin_token");
                            setLocation("/admin/login");
                        }}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {(stats?.revenue / 100).toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD"
                                })}
                            </div>
                            <p className="text-xs text-muted-foreground">Lifetime revenue</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.orders || 0}</div>
                            <p className="text-xs text-muted-foreground">Paid orders</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.views || 0}</div>
                            <p className="text-xs text-muted-foreground">All time views</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Growth</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+12%</div>
                            <p className="text-xs text-muted-foreground">Mock data</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Navigation Cards */}
                <h2 className="text-xl font-semibold mt-8">Management</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <Link href="/admin/products">
                        <div
                            className="bg-card p-6 rounded-lg shadow-sm border hover:border-primary cursor-pointer transition-colors flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Package className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-lg">Products</h2>
                                <p className="text-sm text-muted-foreground">Manage books inventory</p>
                            </div>
                        </div>
                    </Link>
                    <Link href="/admin/orders">
                        <div
                            className="bg-card p-6 rounded-lg shadow-sm border hover:border-primary cursor-pointer transition-colors flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <ShoppingBag className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-lg">Orders</h2>
                                <p className="text-sm text-muted-foreground">View transactions</p>
                            </div>
                        </div>
                    </Link>
                    <Link href="/admin/customers">
                        <div
                            className="bg-card p-6 rounded-lg shadow-sm border hover:border-primary cursor-pointer transition-colors flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-lg">Customers</h2>
                                <p className="text-sm text-muted-foreground">View client list</p>
                            </div>
                        </div>
                    </Link>
                    <Link href="/admin/scripts">
                        <div
                            className="bg-card p-6 rounded-lg shadow-sm border hover:border-primary cursor-pointer transition-colors flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Code className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-lg">Scripts</h2>
                                <p className="text-sm text-muted-foreground">Manage tags</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Detailed Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Top Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {stats?.topProducts?.map((product: any, i: number) => (
                                    <div key={i} className="flex items-center">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{product.product_title}</p>
                                        </div>
                                        <div className="ml-auto font-medium">
                                            {product.total_sold} sold
                                        </div>
                                    </div>
                                ))}
                                {(!stats?.topProducts || stats.topProducts.length === 0) && (
                                    <p className="text-sm text-muted-foreground">No sales data yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {stats?.recentEvents?.map((event: any) => (
                                    <div key={event.id} className="flex items-center">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {event.event_type}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {event.path}
                                            </p>
                                        </div>
                                        <div className="ml-auto text-xs text-muted-foreground">
                                            {new Date(event.created_at * 1000).toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))}
                                {(!stats?.recentEvents || stats.recentEvents.length === 0) && (
                                    <p className="text-sm text-muted-foreground">No activity recorded.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
