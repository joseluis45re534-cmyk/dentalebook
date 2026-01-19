
import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface OrderItem {
    id: number;
    productId: number;
    quantity: number;
    priceAtPurchase: number;
    productTitle: string;
    productImage: string;
}

interface Order {
    id: number;
    customerEmail: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: OrderItem[];
}

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [, setLocation] = useLocation();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("adminToken");
            if (!token) {
                setLocation("/admin/login");
                return;
            }

            const res = await fetch("/api/orders", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.status === 401) {
                setLocation("/admin/login");
                return;
            }

            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setOrders(data);
        } catch (error) {
            console.error("Error loading orders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredOrders = orders.filter(order =>
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto py-10 px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Package className="h-8 w-8" />
                        Orders
                    </h1>
                </div>

                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            type="search"
                            placeholder="Search by email or ID..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Items</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                No orders found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">#{order.id}</TableCell>
                                                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell>{order.customerEmail}</TableCell>
                                                <TableCell>
                                                    <Badge variant={order.status === 'paid' ? 'secondary' : 'outline'} className={order.status === 'paid' ? 'bg-green-100 text-green-800' : ''}>
                                                        {order.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-600">
                                                        {order.items.map(i => (
                                                            <div key={i.id} title={i.productTitle}>
                                                                {i.quantity}x {i.productTitle.substring(0, 20)}{i.productTitle.length > 20 ? '...' : ''}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
