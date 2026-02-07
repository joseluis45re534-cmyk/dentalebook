import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, ArrowLeft, Code, Upload, Check, ChevronsUpDown } from "lucide-react";
import type { Product } from "@shared/schema";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Papa from "papaparse";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export default function AdminProducts() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [openCategory, setOpenCategory] = useState(false);
    const [isSourceView, setIsSourceView] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);

    // Derive unique categories from products
    const categories = Array.from(new Set(products?.map(p => p.category) || [])).sort();

    // Sync state when editingProduct changes
    useEffect(() => {
        if (editingProduct) {
            setDescription(editingProduct.description || "");
            setCategory(editingProduct.category || "");
        } else {
            setDescription("");
            setCategory("");
        }
    }, [editingProduct]);

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

    const bulkImportMutation = useMutation({
        mutationFn: async (products: Partial<Product>[]) => {
            const token = localStorage.getItem("admin_token");
            const res = await fetch("/api/admin/products/bulk", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(products),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to import products");
            }
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            toast({ title: "Success", description: `Imported ${data.count} products successfully` });
            setIsImporting(false);
        },
        onError: (err) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
            setIsImporting(false);
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
        const imageUrlInput = formData.get("imageUrl") as string || "";
        const images = imageUrlInput.split(/[\n,]/).map(url => url.trim()).filter(Boolean);

        const productData = {
            title: formData.get("title") as string,
            price: formData.get("price") as string, // Keep raw string for now
            currentPrice: parseFloat(formData.get("currentPrice") as string),
            originalPrice: formData.get("originalPrice") ? parseFloat(formData.get("originalPrice") as string) : null,
            description: description, // Use state instead of formData
            category: category || "books", // Use state
            imageUrl: images[0] || "", // Backward compatibility
            images: images,
            isOnSale: !!formData.get("originalPrice"), // Simple logic: if original price exists, it's on sale
            url: formData.get("url") as string || "",
        };

        if (editingProduct) {
            updateMutation.mutate({ ...productData, id: editingProduct.id });
        } else {
            createMutation.mutate(productData);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const mappedProducts = results.data.map((row: any) => {
                    const regularPrice = parseFloat(row["Regular price"] || row["Regular Price"] || "0");
                    const salePrice = parseFloat(row["Sale price"] || row["Sale Price"] || "0");
                    const price = salePrice > 0 ? salePrice : regularPrice;
                    const imageUrls = row["Images"] ? row["Images"].split(',').map((u: string) => u.trim()).filter(Boolean) : [];
                    const imageUrl = imageUrls[0] || "";

                    return {
                        title: row["Name"] || "Untitled Product",
                        description: row["Description"] || "",
                        price: `$${price.toFixed(2)}`,
                        currentPrice: price,
                        originalPrice: regularPrice > price ? regularPrice : null,
                        isOnSale: regularPrice > price,
                        url: "", // Need manual update or a column for this if available
                        imageUrl: imageUrl,
                        images: imageUrls,
                        category: row["Categories"] || "Uncategorized"
                    };
                });

                bulkImportMutation.mutate(mappedProducts);
                // Reset file input
                if (fileInputRef.current) fileInputRef.current.value = "";
            },
            error: (err) => {
                toast({ title: "Import Error", description: err.message, variant: "destructive" });
                setIsImporting(false);
            }
        });
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

                    <div className="flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".csv"
                            onChange={handleFileUpload}
                        />
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
                            {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                            Import CSV
                        </Button>
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
                                        <div className="space-y-2 flex flex-col">
                                            <label className="text-sm font-medium">Category</label>
                                            <Popover open={openCategory} onOpenChange={setOpenCategory}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={openCategory}
                                                        className="justify-between"
                                                    >
                                                        {category
                                                            ? category
                                                            : "Select category..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search category..." />
                                                        <CommandList>
                                                            <CommandEmpty>
                                                                <Button
                                                                    variant="ghost"
                                                                    className="w-full justify-start text-sm"
                                                                    onClick={() => {
                                                                        // Logic to add new category would ideally use the search term, 
                                                                        // but shadcn's CommandInput doesn't expose it easily in standard way without controlled state.
                                                                        // For now, simpler to just allow typing in the standard input or use a "Creative" approach.
                                                                        // Let's use a standard input approach if Command is too complex for "create new".
                                                                        // Actually, let's keep it simple: List existing, and allow "Other" which shows an input?
                                                                        // Or better: Use the CommandInput value. 
                                                                        // Since accessing internal input value is tricky, let's just add a fallback text input below if needed
                                                                        // or just generic "Select or Type" is better handled by a Creatable Select. 
                                                                        // Given constraints, I'll switch to a hybrid approach:
                                                                        // 1. Combobox for selection
                                                                        // 2. If valid option not found, show "Create '{search}'" (requires controlling search state)
                                                                    }}
                                                                >
                                                                    Type to search or create...
                                                                </Button>
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {categories.map((c) => (
                                                                    <CommandItem
                                                                        key={c}
                                                                        value={c}
                                                                        onSelect={(currentValue) => {
                                                                            setCategory(currentValue === category ? "" : currentValue)
                                                                            setOpenCategory(false)
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                category === c ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {c}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            {/* Fallback input to allow creating new categories easily if dropdown doesn't suffice or for manual override */}
                                            <Input
                                                name="category"
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                placeholder="Or type new category..."
                                                className="mt-2"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium">Description</label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setIsSourceView(!isSourceView)}
                                                className="h-8 text-xs"
                                            >
                                                <Code className="w-3 h-3 mr-1" />
                                                {isSourceView ? "Visual Editor" : "Edit HTML"}
                                            </Button>
                                        </div>
                                        <div className="min-h-[200px] border rounded-md">
                                            {isSourceView ? (
                                                <Textarea
                                                    name="description-source"
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    className="min-h-[200px] font-mono text-sm"
                                                />
                                            ) : (
                                                <ReactQuill
                                                    theme="snow"
                                                    value={description}
                                                    onChange={setDescription}
                                                    className="h-[200px] mb-12" // Add margin bottom for toolbar
                                                />
                                            )}
                                        </div>
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
                                        <label className="text-sm font-medium">Image URLs (one per line)</label>
                                        <Textarea
                                            name="imageUrl"
                                            defaultValue={editingProduct?.images?.join("\n") || editingProduct?.imageUrl || ""}
                                            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                                            className="min-h-[100px] font-mono text-xs"
                                        />
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
