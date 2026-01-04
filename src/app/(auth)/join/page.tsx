import { SignUpForm } from "@/features/auth/components/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Join | VidFlow Manager",
    description: "Create your production account.",
};

export default function JoinPage() {
    return <SignUpForm />;
}
