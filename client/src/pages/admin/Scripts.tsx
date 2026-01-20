
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Trash2, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminScripts() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [content, setContent] = useState("");
    const [location, setScriptLocation] = useState("head");

    const { data: scripts, isLoading } = useQuery({
        queryKey: ["admin-scripts"],
        queryFn: async () => {
            const res = await fetch("/api/scripts");
            if (!res.ok) throw new Error("Failed to fetch scripts");
            return res.json();
        }
    });

    const createScript = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/scripts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, content, location })
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-scripts"] });
            setIsCreating(false);
            setName("");
            setContent("");
            setScriptLocation("head");
            toast({ title: "Script created", description: "Script successfully added." });
        }
    });

    const toggleScript = useMutation({
        mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) => {
            await fetch(`/api/scripts/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled })
            });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-scripts"] })
    });

    const deleteScript = useMutation({
        mutationFn: async (id: number) => {
            await fetch(`/api/scripts/${id}`, { method: "DELETE" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-scripts"] });
            toast({ title: "Deleted", variant: "destructive" });
        }
    });

    if (isLoading) return <Loader2 className="animate-spin w-8 h-8 m-auto" />;

    return (
        <div className="min-h-screen bg-muted/30 p-8 space-y-6">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
                <h1 className="text-3xl font-bold">Script Manager</h1>
                <Button variant="outline" onClick={() => setLocation("/admin/dashboard")}>Back to Dashboard</Button>
            </div>

            <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
                {/* Create Form */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add New Script
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                                placeholder="e.g. Google Analytics"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Location</label>
                            <Select value={location} onValueChange={setScriptLocation}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="head">Head ( Metadata, Analytics )</SelectItem>
                                    <SelectItem value="body_start">Body Start ( GTM NoScript )</SelectItem>
                                    <SelectItem value="footer">Footer ( Chat Widgets )</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Content</label>
                            <Textarea
                                className="font-mono text-xs h-32"
                                placeholder="<script>...</script>"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>
                        <Button
                            className="w-full"
                            disabled={createScript.isPending || !name || !content}
                            onClick={() => createScript.mutate()}
                        >
                            {createScript.isPending ? <Loader2 className="animate-spin" /> : "Save Script"}
                        </Button>
                    </CardContent>
                </Card>

                {/* List */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Code className="w-4 h-4" /> Installed Scripts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scripts?.map((script: any) => (
                                    <TableRow key={script.id}>
                                        <TableCell>
                                            <Switch
                                                checked={!!script.enabled}
                                                onCheckedChange={(c) => toggleScript.mutate({ id: script.id, enabled: c })}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{script.name}</TableCell>
                                        <TableCell className="text-xs font-mono bg-muted px-2 py-1 rounded w-fit">
                                            {script.location}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:bg-destructive/10"
                                                onClick={() => deleteScript.mutate(script.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {scripts?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            No scripts installed.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
