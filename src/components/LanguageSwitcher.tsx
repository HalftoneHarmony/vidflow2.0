"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations("Common");

    const onSelectChange = (nextLocale: "ko" | "en") => {
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9 text-zinc-400 hover:text-white hover:bg-zinc-800">
                    <Globe className="h-4 w-4" />
                    <span className="sr-only">{t("language")}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0A0A0A] border-zinc-800 text-white">
                <DropdownMenuItem
                    onClick={() => onSelectChange("ko")}
                    className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer"
                >
                    {t("korean")} {locale === 'ko' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onSelectChange("en")}
                    className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer"
                >
                    {t("english")} {locale === 'en' && '✓'}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
