import { LoginForm } from "@/features/auth/components/LoginForm";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: "Auth" });
    return {
        title: `${t("login_title")} | VIDFLOW`,
        description: t("meta_login_desc"),
    };
}

export default function LoginPage() {
    return <LoginForm />;
}
