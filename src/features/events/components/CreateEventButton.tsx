"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EventFormModal } from "./EventFormModal";

export function CreateEventButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="bg-red-600 hover:bg-red-500 text-white rounded-none uppercase font-bold tracking-wider gap-2"
            >
                <Plus className="w-4 h-4" />
                New Event
            </Button>

            <EventFormModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}
