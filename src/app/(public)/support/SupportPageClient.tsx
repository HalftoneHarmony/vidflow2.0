"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, HelpCircle, ChevronDown, ChevronUp, Mail, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitContactForm } from "@/features/support/actions";
import { toast } from "sonner";

type Tab = "faq" | "privacy" | "terms" | "contact";

type FAQ = {
    id: number;
    question: string;
    answer: string;
    category: string;
};

interface SupportPageClientProps {
    faqs: FAQ[];
    privacyContent: string;
    privacyTitle: string;
    termsContent: string;
    termsTitle: string;
    supportEmail: string;
}

export function SupportPageClient({
    faqs,
    privacyContent,
    privacyTitle,
    termsContent,
    termsTitle,
    supportEmail,
}: SupportPageClientProps) {
    const [activeTab, setActiveTab] = useState<Tab>("faq");
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Contact form state
    const [contactForm, setContactForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const result = await submitContactForm(contactForm);

        if (result.success) {
            toast.success("문의가 성공적으로 접수되었습니다.");
            setContactForm({ name: "", email: "", subject: "", message: "" });
        } else {
            toast.error("문의 접수에 실패했습니다. 다시 시도해주세요.");
        }

        setIsSubmitting(false);
    };

    // Render markdown-like content
    const renderContent = (content: string) => {
        return content.split("\n").map((line, i) => {
            if (line.startsWith("## ")) {
                return (
                    <h3 key={i} className="text-white font-bold mb-2 mt-6 first:mt-0">
                        {line.replace("## ", "")}
                    </h3>
                );
            }
            if (line.startsWith("### ")) {
                return (
                    <h4 key={i} className="text-zinc-300 font-semibold mb-1 mt-4">
                        {line.replace("### ", "")}
                    </h4>
                );
            }
            if (line.startsWith("- ")) {
                return (
                    <li key={i} className="text-zinc-400 text-sm ml-4">
                        {line.replace("- ", "")}
                    </li>
                );
            }
            if (line.trim() === "") {
                return <br key={i} />;
            }
            return (
                <p key={i} className="text-zinc-400 text-sm leading-relaxed mb-2">
                    {line}
                </p>
            );
        });
    };

    return (
        <div className="container mx-auto px-6 py-12 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-2 mb-10 text-center">
                <h1 className="text-4xl font-bold text-white font-[family-name:var(--font-oswald)] uppercase tracking-wide">
                    Support Center
                </h1>
                <p className="text-zinc-400 max-w-2xl mx-auto">
                    VidFlow 이용에 필요한 모든 정보를 찾아보세요. 원하는 답변을 찾지 못하셨다면 문의하기를 이용해주세요.
                </p>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar / Tabs */}
                <div className="lg:col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab("faq")}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-sm border",
                            activeTab === "faq"
                                ? "bg-zinc-900 border-red-500/50 text-white"
                                : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                        )}
                    >
                        <HelpCircle className={cn("w-4 h-4", activeTab === "faq" ? "text-red-500" : "text-zinc-500")} />
                        FAQ
                    </button>
                    <button
                        onClick={() => setActiveTab("privacy")}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-sm border",
                            activeTab === "privacy"
                                ? "bg-zinc-900 border-red-500/50 text-white"
                                : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                        )}
                    >
                        <Shield className={cn("w-4 h-4", activeTab === "privacy" ? "text-red-500" : "text-zinc-500")} />
                        개인정보 처리방침
                    </button>
                    <button
                        onClick={() => setActiveTab("terms")}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-sm border",
                            activeTab === "terms"
                                ? "bg-zinc-900 border-red-500/50 text-white"
                                : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                        )}
                    >
                        <FileText className={cn("w-4 h-4", activeTab === "terms" ? "text-red-500" : "text-zinc-500")} />
                        이용약관
                    </button>
                    <button
                        onClick={() => setActiveTab("contact")}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-sm border",
                            activeTab === "contact"
                                ? "bg-zinc-900 border-red-500/50 text-white"
                                : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                        )}
                    >
                        <Mail className={cn("w-4 h-4", activeTab === "contact" ? "text-red-500" : "text-zinc-500")} />
                        문의하기
                    </button>

                    {/* Contact Info Box */}
                    <Card className="mt-8 bg-gradient-to-br from-red-950/20 to-black border-red-900/30">
                        <CardContent className="p-4 space-y-3">
                            <h3 className="font-bold text-white text-sm">고객 지원</h3>
                            <p className="text-xs text-zinc-400">
                                이메일: <span className="text-white">{supportEmail}</span>
                            </p>
                            <p className="text-xs text-zinc-500">
                                평일 10:00 ~ 18:00
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <Card className="bg-zinc-900/20 border-zinc-800 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl text-white font-[family-name:var(--font-oswald)] uppercase tracking-wide">
                                {activeTab === "faq" && "자주 묻는 질문"}
                                {activeTab === "privacy" && privacyTitle}
                                {activeTab === "terms" && termsTitle}
                                {activeTab === "contact" && "문의하기"}
                            </CardTitle>
                            <CardDescription className="text-zinc-500">
                                {activeTab === "faq" && "가장 많이 문의하시는 질문과 답변입니다."}
                                {activeTab === "privacy" && "개인정보 수집 및 이용에 관한 안내입니다."}
                                {activeTab === "terms" && "서비스 이용에 관한 약관입니다."}
                                {activeTab === "contact" && "문의 사항을 남겨주시면 빠르게 답변드리겠습니다."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* FAQ Tab */}
                            {activeTab === "faq" && (
                                <div className="space-y-4">
                                    {faqs.length > 0 ? (
                                        faqs.map((faq, index) => (
                                            <div
                                                key={faq.id}
                                                className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/30"
                                            >
                                                <button
                                                    onClick={() => toggleFaq(index)}
                                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/50 transition-colors"
                                                >
                                                    <span className="font-medium text-zinc-200">{faq.question}</span>
                                                    {openFaqIndex === index ? (
                                                        <ChevronUp className="w-5 h-5 text-red-500 flex-shrink-0" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-zinc-500 flex-shrink-0" />
                                                    )}
                                                </button>
                                                {openFaqIndex === index && (
                                                    <div className="p-4 pt-0 text-zinc-400 text-sm animate-in slide-in-from-top-2 fade-in duration-200">
                                                        <div className="pt-4 border-t border-zinc-800/50">
                                                            {faq.answer}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 text-zinc-500">
                                            등록된 FAQ가 없습니다.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Privacy Tab */}
                            {activeTab === "privacy" && (
                                <div className="space-y-2 animate-in fade-in duration-300">
                                    {renderContent(privacyContent)}
                                </div>
                            )}

                            {/* Terms Tab */}
                            {activeTab === "terms" && (
                                <div className="space-y-2 animate-in fade-in duration-300">
                                    {renderContent(termsContent)}
                                </div>
                            )}

                            {/* Contact Tab */}
                            {activeTab === "contact" && (
                                <form onSubmit={handleContactSubmit} className="space-y-6 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-400 mb-2">이름 *</label>
                                            <Input
                                                value={contactForm.name}
                                                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                                placeholder="홍길동"
                                                required
                                                className="bg-zinc-900/50 border-zinc-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-400 mb-2">이메일 *</label>
                                            <Input
                                                type="email"
                                                value={contactForm.email}
                                                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                                placeholder="email@example.com"
                                                required
                                                className="bg-zinc-900/50 border-zinc-700"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-2">제목</label>
                                        <Input
                                            value={contactForm.subject}
                                            onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                                            placeholder="문의 제목을 입력해주세요"
                                            className="bg-zinc-900/50 border-zinc-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-2">내용 *</label>
                                        <textarea
                                            value={contactForm.message}
                                            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                            placeholder="문의 내용을 자세히 적어주세요"
                                            required
                                            rows={6}
                                            className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                전송 중...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Send className="w-4 h-4" />
                                                문의 보내기
                                            </span>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
