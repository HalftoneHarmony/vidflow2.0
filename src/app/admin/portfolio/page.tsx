import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Edit, ExternalLink } from "lucide-react";
import { DeleteButton } from "./DeleteButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminWorksPage() {
    const supabase = await createClient();

    // Fetch items from portfolio_items
    const { data: works } = await supabase
        .from("portfolio_items")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Portfolio Management</h1>
                    <p className="text-zinc-400">Manage your expanded portfolio (commercials, documentaries, etc).</p>
                </div>
                <Link href="/admin/portfolio/new">
                    <Button className="bg-white text-black hover:bg-zinc-200">
                        <Plus className="mr-2 h-4 w-4" /> Add New Work
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {works?.map((work) => (
                    <Card key={work.id} className="bg-zinc-900 border-zinc-800 text-white overflow-hidden">
                        <div className="aspect-video bg-zinc-800 relative group">
                            {work.thumbnail_url ? (
                                <img src={work.thumbnail_url} alt={work.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600">No Image</div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {work.video_url && (
                                    <a href={work.video_url} target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-white/30 text-white">
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        </div>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">{work.category}</span>
                                    <CardTitle className="text-lg mt-1 line-clamp-1">{work.title}</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center text-zinc-500 text-xs mt-2">
                                <span>Client: {work.client_name || "N/A"}</span>
                                <div className="flex gap-2">
                                    {/* Edit removed for MVP speed, using direct DB or Re-add if requested, I'll add Link to Edit */}
                                    {/* <Link href={`/admin/works/${work.id}`}>
                      <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                    </Link> */}
                                    <DeleteButton id={work.id} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {(!works || works.length === 0) && (
                    <div className="col-span-full h-40 flex items-center justify-center border border-dashed border-zinc-800 rounded-lg text-zinc-500">
                        No portfolio items found.
                    </div>
                )}
            </div>
        </div>
    );
}
