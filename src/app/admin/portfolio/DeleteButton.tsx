"use client";

import { deletePortfolioItem } from "@/features/showcase/portfolio-actions";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { useTransition } from "react";

export function DeleteButton({ id }: { id: number }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm("Are you sure you want to delete this work?")) return;

        startTransition(async () => {
            const result = await deletePortfolioItem(id);
            if (result.success) {
                toast.success("Item deleted");
            } else {
                toast.error("Failed to delete item");
            }
        });
    };

    return (
        <Button variant="destructive" size="icon" onClick={handleDelete} disabled={isPending}>
            <Trash className="w-4 h-4" />
        </Button>
    );
}
