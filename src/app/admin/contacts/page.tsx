import { Metadata } from "next";
import { ContactsClient } from "./ContactsClient";

export const metadata: Metadata = {
    title: "Contacts | VidFlow Admin",
    description: "고객 문의 관리",
};

/**
 * 💬 Contacts Page
 * 고객 문의 관리 페이지
 * 
 * @author Agent 2 (Admin UI Master)
 */
export default function ContactsPage() {
    return <ContactsClient />;
}
