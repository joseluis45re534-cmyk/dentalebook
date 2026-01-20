
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
import { Loader2, CalendarIcon } from "lucide-react";
import type { Order } from "../../../../shared/schema";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function AdminOrders() {
    const [date, setDate] = useState<Date | undefined>();

    const { data: orders, isLoading } = useQuery<Order[]>({
        queryKey: ["admin-orders"],
        queryFn: async () => {
            const res = await fetch("/api/orders");
            if (!res.ok) throw new Error("Failed to fetch orders");
            return res.json();
        },
    });

    const filteredOrders = orders?.filter((order: any) => {
        if (!date) return true;

        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        const filterDate = new Date(date);

        return (
            orderDate.getDate() === filterDate.getDate() &&
            orderDate.getMonth() === filterDate.getMonth() &&
            orderDate.getFullYear() === filterDate.getFullYear()
        );
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
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[240px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Filter by date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                        {date && (
                            <div className="p-2 border-t">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-center text-xs h-8"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDate(undefined);
                                    }}
                                >
                                    Clear Filter
                                </Button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date & Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders?.map((order: any) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium text-xs font-mono">
                                        {order.id}
                                    </TableCell>
                                    <TableCell>{order.customerName}</TableCell>
                                    <TableCell>{order.customerEmail}</TableCell>
                                    <TableCell className="max-w-xs truncate" title={order.products}>
                                        {order.products}
                                    </TableCell>
                                    <TableCell>
                                        {(order.amount / 100).toLocaleString("en-US", {
                                            style: "currency",
                                            currency: order.currency.toUpperCase(),
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                order.status === "completed" || order.status === "succeeded" || order.status === "paid"
                                                    ? "default"
                                                    : order.status === "pending"
                                                        ? "destructive" // Red for abandoned/pending
                                                        : "secondary"
                                            }
                                        >
                                            {order.status === 'pending' ? 'Abandoned' : order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(order.createdAt!).toLocaleString()}
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
