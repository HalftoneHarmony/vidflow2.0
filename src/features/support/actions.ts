"use server";

import { createClient } from "@/lib/supabase/server";

export type FAQ = {
    id: number;
    question: string;
    answer: string;
    category: string;
    sort_order: number;
};

export type LegalDocument = {
    id: number;
    type: "privacy" | "terms" | "cookie" | "refund";
    title: string;
    content: string;
    version: string;
    published_at: string;
};

// Get all published FAQs
export async function getFAQs(): Promise<FAQ[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("faqs")
        .select("id, question, answer, category, sort_order")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

    if (error) {
        console.error("Error fetching FAQs:", error);
        return [];
    }

    return data || [];
}

// Get active legal document by type
export async function getLegalDocument(type: "privacy" | "terms" | "refund"): Promise<LegalDocument | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("legal_documents")
        .select("id, type, title, content, version, published_at")
        .eq("type", type)
        .eq("is_active", true)
        .order("published_at", { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error(`Error fetching ${type} document:`, error);
        return null;
    }

    return data;
}

// Get user inquiries
export async function getUserInquiries(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching user inquiries:", error);
        return [];
    }

    return data || [];
}

// Submit contact form
export async function submitContactForm(formData: {
    name: string;
    email: string;
    subject?: string;
    message: string;
    category?: string;
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("contact_submissions").insert({
        name: formData.name,
        email: formData.email,
        subject: formData.subject || null,
        message: formData.message,
        category: formData.category || "general",
        user_id: user?.id || null,
    });

    if (error) {
        console.error("Error submitting contact form:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
