import { LoginForm } from "@/features/auth/components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | VidFlow Manager",
    description: "Access your production engine.",
};

export default function LoginPage() {
    return <LoginForm />;
}
