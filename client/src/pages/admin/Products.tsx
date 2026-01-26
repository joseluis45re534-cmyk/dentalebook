import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import type { Product } from "@shared/schema";

export default function AdminProducts() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Fetch Products
    const { data: products, isLoading } = useQuery<Product[]>({
        queryKey: ["/api/products"],
        queryFn: async () => {
            const res = await fetch("/api/products");
            if (!res.ok) throw new Error("Failed to fetch products");
            return res.json();
        }
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (newProduct: Partial<Product>) => {
            const token = localStorage.getItem("admin_token");
            const res = await fetch("/api/admin/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newProduct),
            });
            if (!res.ok) throw new Error("Failed to create product");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            toast({ title: "Success", description: "Product created successfully" });
            setIsDialogOpen(false);
        },
        onError: (err) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (product: Partial<Product>) => {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`/api/admin/products/${product.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(product),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update product");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            toast({ title: "Success", description: "Product updated successfully" });
            setIsDialogOpen(false);
            setEditingProduct(null);
        },
        onError: (err) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`/api/admin/products/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
            });
            if (!res.ok) throw new Error("Failed to delete product");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            toast({ title: "Success", description: "Product deleted successfully" });
        },
        onError: (err) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        // Parse form data
        const productData = {
            title: formData.get("title") as string,
            price: formData.get("price") as string, // Keep raw string for now
            currentPrice: parseFloat(formData.get("currentPrice") as string),
            originalPrice: formData.get("originalPrice") ? parseFloat(formData.get("originalPrice") as string) : null,
            description: formData.get("description") as string,
            category: formData.get("category") as string,
            imageUrl: formData.get("imageUrl") as string,
            isOnSale: !!formData.get("originalPrice"), // Simple logic: if original price exists, it's on sale
            url: formData.get("url") as string || "",
        };

        if (editingProduct) {
            updateMutation.mutate({ ...productData, id: editingProduct.id });
        } else {
            createMutation.mutate(productData);
        }
    };

    const openEdit = (product: Product) => {
        setEditingProduct(product);
        setIsDialogOpen(true);
    };

    return (
        <div className="min-h-screen bg-muted/30 p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold">Products</h1>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingProduct(null); }}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" /> Add Product
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Title</label>
                                        <Input name="title" defaultValue={editingProduct?.title} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Category</label>
                                        <Input name="category" defaultValue={editingProduct?.category || "books"} required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea name="description" defaultValue={editingProduct?.description} className="h-32" />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Display Price Text</label>
                                        <Input name="price" defaultValue={editingProduct?.price || "$0.00"} required placeholder="$99.00" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Numeric Price</label>
                                        <Input name="currentPrice" type="number" step="0.01" defaultValue={editingProduct?.currentPrice} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Original Price (opt)</label>
                                        <Input name="originalPrice" type="number" step="0.01" defaultValue={editingProduct?.originalPrice || ""} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Image URL</label>
                                    <Input name="imageUrl" defaultValue={editingProduct?.imageUrl || ""} placeholder="https://..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Product URL / Download Link</label>
                                    <Input name="url" defaultValue={editingProduct?.url || ""} />
                                </div>

                                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {createMutation.isPending || updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Product"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="bg-card rounded-lg border shadow-sm">
                    {isLoading ? (
                        <div className="p-8 flex justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products?.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>{product.id}</TableCell>
                                        <TableCell>
                                            <div className="w-10 h-10 rounded bg-muted overflow-hidden">
                                                {product.imageUrl && <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{product.title}</TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell>${product.currentPrice.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                                                    if (confirm("Are you sure?")) deleteMutation.mutate(product.id);
                                                }}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {products?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No products found. Import data or create one.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </div>
    );
}
