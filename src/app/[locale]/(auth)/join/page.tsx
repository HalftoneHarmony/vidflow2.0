import { SignUpForm } from "@/features/auth/components/SignUpForm";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: "Auth" });
    return {
        title: `${t("join_title")} | VIDFLOW`,
        description: t("meta_join_desc"),
    };
}

export default function JoinPage() {
    return <SignUpForm />;
}
