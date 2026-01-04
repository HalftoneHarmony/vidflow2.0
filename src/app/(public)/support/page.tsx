import { getFAQs, getLegalDocument } from "@/features/support/actions";
import { getSetting } from "@/features/settings/actions";
import { SupportPageClient } from "./SupportPageClient";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
    // Fetch data from DB
    const [faqs, privacyDoc, termsDoc, supportEmail] = await Promise.all([
        getFAQs(),
        getLegalDocument("privacy"),
        getLegalDocument("terms"),
        getSetting("support_email"),
    ]);

    return (
        <SupportPageClient
            faqs={faqs}
            privacyContent={privacyDoc?.content || "개인정보 처리방침을 불러올 수 없습니다."}
            privacyTitle={privacyDoc?.title || "개인정보 처리방침"}
            termsContent={termsDoc?.content || "이용약관을 불러올 수 없습니다."}
            termsTitle={termsDoc?.title || "이용약관"}
            supportEmail={supportEmail || "support@vidflow.com"}
        />
    );
}
