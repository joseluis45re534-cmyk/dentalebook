
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
import { Loader2 } from "lucide-react";
import type { Order } from "../../../../shared/schema";

export default function AdminOrders() {
    const { data: orders, isLoading } = useQuery<Order[]>({
        queryKey: ["admin-orders"],
        queryFn: async () => {
            const res = await fetch("/api/orders");
            if (!res.ok) throw new Error("Failed to fetch orders");
            return res.json();
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders?.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium text-xs font-mono">
                                        {order.id}
                                    </TableCell>
                                    <TableCell>{order.customerName}</TableCell>
                                    <TableCell>{order.customerEmail}</TableCell>
                                    <TableCell>
                                        {(order.amount / 100).toLocaleString("en-US", {
                                            style: "currency",
                                            currency: order.currency.toUpperCase(),
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                order.status === "completed" || order.status === "succeeded"
                                                    ? "default"
                                                    : "secondary"
                                            }
                                        >
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(order.createdAt!).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {orders?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        No orders found
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
