import type { Metadata } from "next";
import { fontVariables } from "@/styles/fonts";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "VidFlow Manager",
  description: "보디빌딩 대회 영상 프로덕션의 전 과정을 관리하는 통합 비즈니스 엔진",
  keywords: ["보디빌딩", "영상 제작", "대회 촬영", "VidFlow"],
  authors: [{ name: "VidFlow Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <body className={`${fontVariables} antialiased`} suppressHydrationWarning>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
