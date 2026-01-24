import { useQuery } from "@tanstack/react-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminOrders() {
    const { data: orders, isLoading, refetch } = useQuery({
        queryKey: ["admin-orders"],
        queryFn: async () => {
            const token = localStorage.getItem("admin_token");
            const res = await fetch("/api/admin/orders", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            if (res.status === 401) {
                // Handle unauthorized (redirect logic could go here or in a wrapper)
                throw new Error("Unauthorized");
            }
            if (!res.ok) throw new Error("Failed to fetch orders");
            return res.json();
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead className="text-right">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders?.map((order: any) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs">#{order.id}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{order.customerName}</span>
                                            <span className="text-xs text-muted-foreground">{order.customerEmail}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={order.status === 'paid' ? 'default' : 'destructive'}>
                                            {order.status.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {(order.amount / 100).toLocaleString("en-US", {
                                            style: "currency",
                                            currency: order.currency.toUpperCase(),
                                        })}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                                        {order.products}
                                    </TableCell>
                                    <TableCell className="text-right text-xs">
                                        {new Date(order.createdAt).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {orders?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No recent orders found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
