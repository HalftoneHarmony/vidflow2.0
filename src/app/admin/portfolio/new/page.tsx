"use client";

import { createPortfolioItem } from "@/features/showcase/portfolio-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

// Initial state for the form
const initialState = {
    success: false,
    message: "",
};

export default function NewWorkPage() {
    const [state, formAction, isPending] = useActionState(createPortfolioItem, initialState);

    return (
        <div className="max-w-2xl mx-auto p-8 text-white min-h-screen">
            <div className="mb-8">
                <Link href="/admin/portfolio" className="flex items-center text-zinc-400 hover:text-white mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                </Link>
                <h1 className="text-3xl font-bold">Add New Work</h1>
                <p className="text-zinc-500">Add a commercial, documentary, or other creative work.</p>
            </div>

            <form action={formAction} className="space-y-6 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">

                {state.message && (
                    <div className={`p-3 rounded text-sm ${state.success ? 'bg-green-900/50 text-green-300 border border-green-800' : 'bg-red-900/50 text-red-300 border border-red-800'}`}>
                        {state.message}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" placeholder="e.g. Nike Commercial 2024" required className="bg-zinc-950 border-zinc-800" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" name="category" placeholder="e.g. Commercial" defaultValue="General" className="bg-zinc-950 border-zinc-800" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="client_name">Client Name</Label>
                        <Input id="client_name" name="client_name" placeholder="e.g. Nike" className="bg-zinc-950 border-zinc-800" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="video_url">Video URL</Label>
                    <Input id="video_url" name="video_url" placeholder="https://vimeo.com/..." required className="bg-zinc-950 border-zinc-800" />
                    <p className="text-xs text-zinc-500">Supports YouTube and Vimeo links.</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                    <Input id="thumbnail_url" name="thumbnail_url" placeholder="https://..." className="bg-zinc-950 border-zinc-800" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        className="flex w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                        placeholder="Describe the project..."
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input id="tags" name="tags" placeholder="cinematic, sports, dark mode" className="bg-zinc-950 border-zinc-800" />
                </div>

                <div className="pt-4">
                    <Button type="submit" className="bg-white text-black hover:bg-zinc-200 w-full" disabled={isPending}>
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Create Portfolio Item"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
