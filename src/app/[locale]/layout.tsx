import type { Metadata } from "next";
import { fontVariables } from "@/styles/fonts";
import { Toaster } from "@/components/ui/sonner";
import "@/app/globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export const metadata: Metadata = {
    title: "VidFlow",
    description: "Bodybuilding Video Production Management Engine",
    keywords: ["Bodybuilding", "Video Production", "VidFlow"],
};

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <html lang={locale} className="dark" suppressHydrationWarning>
            <body className={`${fontVariables} antialiased`} suppressHydrationWarning>
                <NextIntlClientProvider messages={messages}>
                    {children}
                </NextIntlClientProvider>
                <Toaster position="top-right" richColors closeButton />
            </body>
        </html>
    );
}
