"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Shield,
    FileText,
    HelpCircle,
    ChevronDown,
    Mail,
    Send,
    Sparkles,
    AlertCircle,
    CheckCircle,
    Filter,
    Search,
    Loader2,
    MessageSquare,
    Clock,
    Users,
    CreditCard,
    Package,
    Settings
} from "lucide-react";
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

// Category icons and colors
const categoryConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
    "general": { icon: HelpCircle, color: "text-blue-400 bg-blue-500/10 border-blue-500/30", label: "일반" },
    "order": { icon: Package, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", label: "주문" },
    "payment": { icon: CreditCard, color: "text-amber-400 bg-amber-500/10 border-amber-500/30", label: "결제" },
    "account": { icon: Users, color: "text-purple-400 bg-purple-500/10 border-purple-500/30", label: "계정" },
    "service": { icon: Settings, color: "text-red-400 bg-red-500/10 border-red-500/30", label: "서비스" },
};

// Form validation
interface FormError {
    name?: string;
    email?: string;
    message?: string;
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
    const [openFaqIndices, setOpenFaqIndices] = useState<Set<number>>(new Set([0]));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // FAQ filtering
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Form validation
    const [formErrors, setFormErrors] = useState<FormError>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Contact form state
    const [contactForm, setContactForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    // Get unique categories from FAQs
    const categories = useMemo(() => {
        const cats = [...new Set(faqs.map(f => f.category))];
        return cats;
    }, [faqs]);

    // Filter FAQs
    const filteredFaqs = useMemo(() => {
        return faqs.filter(faq => {
            const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
            const matchesSearch = searchQuery === "" ||
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [faqs, selectedCategory, searchQuery]);

    const toggleFaq = (index: number) => {
        const newSet = new Set(openFaqIndices);
        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }
        setOpenFaqIndices(newSet);
    };

    // Validation
    const validateField = (name: string, value: string): string | undefined => {
        switch (name) {
            case "name":
                if (!value.trim()) return "이름을 입력해주세요";
                if (value.length < 2) return "이름은 2자 이상이어야 합니다";
                break;
            case "email":
                if (!value.trim()) return "이메일을 입력해주세요";
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "올바른 이메일 형식이 아닙니다";
                break;
            case "message":
                if (!value.trim()) return "문의 내용을 입력해주세요";
                if (value.length < 10) return "문의 내용은 10자 이상이어야 합니다";
                break;
        }
        return undefined;
    };

    const handleBlur = (name: string) => {
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, contactForm[name as keyof typeof contactForm]);
        setFormErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleInputChange = (name: string, value: string) => {
        setContactForm(prev => ({ ...prev, [name]: value }));
        if (touched[name]) {
            const error = validateField(name, value);
            setFormErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields
        const errors: FormError = {
            name: validateField("name", contactForm.name),
            email: validateField("email", contactForm.email),
            message: validateField("message", contactForm.message),
        };

        setFormErrors(errors);
        setTouched({ name: true, email: true, message: true });

        if (errors.name || errors.email || errors.message) {
            toast.error("폼을 올바르게 작성해주세요.");
            return;
        }

        setIsSubmitting(true);

        const result = await submitContactForm(contactForm);

        if (result.success) {
            setIsSuccess(true);
            toast.success("문의가 성공적으로 접수되었습니다. 곧 답변 드리겠습니다!");
            setContactForm({ name: "", email: "", subject: "", message: "" });
            setFormErrors({});
            setTouched({});

            // Reset success state after animation
            setTimeout(() => setIsSuccess(false), 3000);
        } else {
            toast.error("문의 접수에 실패했습니다. 다시 시도해주세요.");
        }

        setIsSubmitting(false);
    };

    // Render markdown-like content with enhanced styling
    const renderContent = (content: string) => {
        return content.split("\n").map((line, i) => {
            if (line.startsWith("## ")) {
                return (
                    <h3 key={i} className="text-white font-bold mb-3 mt-8 first:mt-0 text-lg flex items-center gap-2 border-l-4 border-red-500 pl-4">
                        {line.replace("## ", "")}
                    </h3>
                );
            }
            if (line.startsWith("### ")) {
                return (
                    <h4 key={i} className="text-zinc-200 font-semibold mb-2 mt-5 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-red-500" />
                        {line.replace("### ", "")}
                    </h4>
                );
            }
            if (line.startsWith("- ")) {
                return (
                    <li key={i} className="text-zinc-400 text-sm ml-6 mb-1 list-disc marker:text-red-500">
                        {line.replace("- ", "")}
                    </li>
                );
            }
            if (line.trim() === "") {
                return <div key={i} className="h-3" />;
            }
            return (
                <p key={i} className="text-zinc-400 text-sm leading-relaxed mb-2">
                    {line}
                </p>
            );
        });
    };

    const getCategoryConfig = (category: string) => {
        return categoryConfig[category] || categoryConfig["general"];
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-20">
            {/* Header - Enhanced */}
            <div className="flex flex-col gap-4 mb-8 sm:mb-12 text-center">
                <div className="relative inline-block mx-auto">
                    <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
                    <h1 className="relative text-3xl sm:text-4xl md:text-5xl font-bold text-white font-[family-name:var(--font-oswald)] uppercase tracking-wide">
                        Support Center
                    </h1>
                </div>
                <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base">
                    VidFlow 이용에 필요한 모든 정보를 찾아보세요.
                    <br className="hidden sm:block" />
                    원하는 답변을 찾지 못하셨다면 <span className="text-red-400 font-medium">문의하기</span>를 이용해주세요.
                </p>

                {/* Quick stats */}
                <div className="flex items-center justify-center gap-6 mt-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>평균 응답 24시간</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>FAQ {faqs.length}개</span>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
                {/* Sidebar / Tabs - Mobile: Horizontal scroll, Desktop: Vertical */}
                <div className="lg:col-span-1">
                    {/* Mobile: Horizontal tabs */}
                    <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                        {[
                            { id: "faq", icon: HelpCircle, label: "FAQ" },
                            { id: "privacy", icon: Shield, label: "개인정보" },
                            { id: "terms", icon: FileText, label: "이용약관" },
                            { id: "contact", icon: Mail, label: "문의하기" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-lg whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "bg-red-500/20 border border-red-500/50 text-white"
                                        : "bg-zinc-900/50 border border-zinc-800 text-zinc-400"
                                )}
                            >
                                <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-red-500" : "text-zinc-500")} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Desktop: Vertical tabs */}
                    <div className="hidden lg:flex flex-col gap-2">
                        {[
                            { id: "faq", icon: HelpCircle, label: "FAQ", desc: "자주 묻는 질문" },
                            { id: "privacy", icon: Shield, label: "개인정보 처리방침", desc: "정보 보호 안내" },
                            { id: "terms", icon: FileText, label: "이용약관", desc: "서비스 약관" },
                            { id: "contact", icon: Mail, label: "문의하기", desc: "1:1 문의" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-4 text-left transition-all rounded-lg border group",
                                    activeTab === tab.id
                                        ? "bg-gradient-to-r from-red-500/10 to-transparent border-red-500/50 text-white"
                                        : "bg-zinc-900/30 border-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-900/50 hover:border-zinc-700"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    activeTab === tab.id ? "bg-red-500/20" : "bg-zinc-800 group-hover:bg-zinc-700"
                                )}>
                                    <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-red-500" : "text-zinc-500 group-hover:text-zinc-300")} />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{tab.label}</p>
                                    <p className="text-xs text-zinc-500">{tab.desc}</p>
                                </div>
                            </button>
                        ))}

                        {/* Contact Info Box - Enhanced */}
                        <Card className="mt-6 bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border-zinc-800 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl" />
                            <CardContent className="p-5 space-y-4 relative">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-red-500/10 rounded-lg border border-red-500/20">
                                        <MessageSquare className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm">고객 지원</h3>
                                        <p className="text-xs text-zinc-500">빠른 답변을 드립니다</p>
                                    </div>
                                </div>
                                <div className="space-y-2 pt-2 border-t border-zinc-800">
                                    <p className="text-xs text-zinc-400 flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5" />
                                        <span className="text-white">{supportEmail}</span>
                                    </p>
                                    <p className="text-xs text-zinc-500 flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" />
                                        평일 10:00 ~ 18:00
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <Card className="bg-zinc-900/30 border-zinc-800 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="border-b border-zinc-800/50">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <CardTitle className="text-xl sm:text-2xl text-white font-[family-name:var(--font-oswald)] uppercase tracking-wide">
                                        {activeTab === "faq" && "자주 묻는 질문"}
                                        {activeTab === "privacy" && privacyTitle}
                                        {activeTab === "terms" && termsTitle}
                                        {activeTab === "contact" && "문의하기"}
                                    </CardTitle>
                                    <CardDescription className="text-zinc-500 mt-1">
                                        {activeTab === "faq" && `${filteredFaqs.length}개의 FAQ가 있습니다`}
                                        {activeTab === "privacy" && "개인정보 수집 및 이용에 관한 안내입니다"}
                                        {activeTab === "terms" && "서비스 이용에 관한 약관입니다"}
                                        {activeTab === "contact" && "문의 사항을 남겨주시면 빠르게 답변드리겠습니다"}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-4 sm:p-6">
                            {/* FAQ Tab - Enhanced */}
                            {activeTab === "faq" && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    {/* Search and Filter */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        {/* Search */}
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                            <Input
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="FAQ 검색..."
                                                className="pl-10 bg-zinc-900/50 border-zinc-700 focus:border-red-500/50"
                                            />
                                        </div>

                                        {/* Category Filter */}
                                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                            <button
                                                onClick={() => setSelectedCategory("all")}
                                                className={cn(
                                                    "px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5",
                                                    selectedCategory === "all"
                                                        ? "bg-red-500/20 border border-red-500/50 text-white"
                                                        : "bg-zinc-800/50 border border-zinc-700 text-zinc-400 hover:text-white"
                                                )}
                                            >
                                                <Filter className="w-3.5 h-3.5" />
                                                전체
                                            </button>
                                            {categories.map((cat) => {
                                                const config = getCategoryConfig(cat);
                                                const Icon = config.icon;
                                                return (
                                                    <button
                                                        key={cat}
                                                        onClick={() => setSelectedCategory(cat)}
                                                        className={cn(
                                                            "px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 border",
                                                            selectedCategory === cat
                                                                ? config.color
                                                                : "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:text-white"
                                                        )}
                                                    >
                                                        <Icon className="w-3.5 h-3.5" />
                                                        {config.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* FAQ List */}
                                    <div className="space-y-3">
                                        {filteredFaqs.length > 0 ? (
                                            filteredFaqs.map((faq, index) => {
                                                const config = getCategoryConfig(faq.category);
                                                const Icon = config.icon;
                                                const isOpen = openFaqIndices.has(index);

                                                return (
                                                    <div
                                                        key={faq.id}
                                                        className={cn(
                                                            "border rounded-lg overflow-hidden transition-all duration-300",
                                                            isOpen
                                                                ? "bg-zinc-900/60 border-zinc-700 shadow-lg shadow-black/20"
                                                                : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"
                                                        )}
                                                    >
                                                        <button
                                                            onClick={() => toggleFaq(index)}
                                                            className="w-full flex items-start gap-3 p-4 text-left group"
                                                        >
                                                            {/* Category Icon */}
                                                            <div className={cn(
                                                                "p-2 rounded-lg shrink-0 mt-0.5 transition-colors",
                                                                config.color
                                                            )}>
                                                                <Icon className="w-4 h-4" />
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", config.color)}>
                                                                        {config.label}
                                                                    </Badge>
                                                                </div>
                                                                <span className={cn(
                                                                    "font-medium text-sm sm:text-base transition-colors block",
                                                                    isOpen ? "text-white" : "text-zinc-200 group-hover:text-white"
                                                                )}>
                                                                    {faq.question}
                                                                </span>
                                                            </div>

                                                            <ChevronDown className={cn(
                                                                "w-5 h-5 shrink-0 transition-all duration-300 mt-1",
                                                                isOpen ? "text-red-500 rotate-180" : "text-zinc-500 group-hover:text-zinc-300"
                                                            )} />
                                                        </button>

                                                        {/* Answer with animation */}
                                                        <div className={cn(
                                                            "overflow-hidden transition-all duration-300 ease-out",
                                                            isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                                                        )}>
                                                            <div className="px-4 pb-4 pt-0">
                                                                <div className="ml-11 pl-4 border-l-2 border-red-500/30">
                                                                    <p className="text-zinc-400 text-sm leading-relaxed">
                                                                        {faq.answer}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-16 space-y-4">
                                                <div className="w-16 h-16 mx-auto bg-zinc-800/50 rounded-full flex items-center justify-center">
                                                    <Search className="w-8 h-8 text-zinc-600" />
                                                </div>
                                                <div>
                                                    <p className="text-zinc-400 font-medium">검색 결과가 없습니다</p>
                                                    <p className="text-zinc-600 text-sm mt-1">다른 검색어로 시도해보세요</p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                                                    className="mt-2"
                                                >
                                                    필터 초기화
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Privacy Tab - Enhanced */}
                            {activeTab === "privacy" && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        {renderContent(privacyContent)}
                                    </div>
                                </div>
                            )}

                            {/* Terms Tab - Enhanced */}
                            {activeTab === "terms" && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        {renderContent(termsContent)}
                                    </div>
                                </div>
                            )}

                            {/* Contact Tab - Enhanced with Validation */}
                            {activeTab === "contact" && (
                                <form onSubmit={handleContactSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    {/* Success animation overlay */}
                                    {isSuccess && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                                            <div className="bg-zinc-900 border border-emerald-500/50 rounded-xl p-8 text-center space-y-4 animate-in zoom-in-90">
                                                <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center">
                                                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">문의 접수 완료!</h3>
                                                    <p className="text-zinc-400 text-sm mt-1">빠른 시일 내에 답변 드리겠습니다</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Name Field */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-zinc-400">
                                                이름 <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    value={contactForm.name}
                                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                                    onBlur={() => handleBlur("name")}
                                                    placeholder="홍길동"
                                                    className={cn(
                                                        "bg-zinc-900/50 transition-all",
                                                        formErrors.name && touched.name
                                                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                                            : "border-zinc-700 focus:border-red-500/50"
                                                    )}
                                                />
                                                {touched.name && !formErrors.name && contactForm.name && (
                                                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                                )}
                                            </div>
                                            {formErrors.name && touched.name && (
                                                <p className="text-xs text-red-400 flex items-center gap-1 animate-in slide-in-from-top-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {formErrors.name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Email Field */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-zinc-400">
                                                이메일 <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    type="email"
                                                    value={contactForm.email}
                                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                                    onBlur={() => handleBlur("email")}
                                                    placeholder="email@example.com"
                                                    className={cn(
                                                        "bg-zinc-900/50 transition-all",
                                                        formErrors.email && touched.email
                                                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                                            : "border-zinc-700 focus:border-red-500/50"
                                                    )}
                                                />
                                                {touched.email && !formErrors.email && contactForm.email && (
                                                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                                )}
                                            </div>
                                            {formErrors.email && touched.email && (
                                                <p className="text-xs text-red-400 flex items-center gap-1 animate-in slide-in-from-top-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {formErrors.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Subject Field */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-zinc-400">
                                            제목 <span className="text-zinc-600">(선택)</span>
                                        </label>
                                        <Input
                                            value={contactForm.subject}
                                            onChange={(e) => handleInputChange("subject", e.target.value)}
                                            placeholder="문의 제목을 입력해주세요"
                                            className="bg-zinc-900/50 border-zinc-700 focus:border-red-500/50"
                                        />
                                    </div>

                                    {/* Message Field */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-medium text-zinc-400">
                                                내용 <span className="text-red-500">*</span>
                                            </label>
                                            <span className={cn(
                                                "text-xs",
                                                contactForm.message.length < 10 ? "text-zinc-600" : "text-emerald-500"
                                            )}>
                                                {contactForm.message.length}/10자 이상
                                            </span>
                                        </div>
                                        <textarea
                                            value={contactForm.message}
                                            onChange={(e) => handleInputChange("message", e.target.value)}
                                            onBlur={() => handleBlur("message")}
                                            placeholder="문의 내용을 자세히 적어주세요"
                                            rows={6}
                                            className={cn(
                                                "w-full px-3 py-3 bg-zinc-900/50 border rounded-md text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 transition-all resize-none",
                                                formErrors.message && touched.message
                                                    ? "border-red-500 focus:ring-red-500/20"
                                                    : "border-zinc-700 focus:ring-red-500/50 focus:border-red-500"
                                            )}
                                        />
                                        {formErrors.message && touched.message && (
                                            <p className="text-xs text-red-400 flex items-center gap-1 animate-in slide-in-from-top-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {formErrors.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        size="lg"
                                        className={cn(
                                            "w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600",
                                            "text-white font-bold shadow-lg shadow-red-500/20 hover:shadow-red-500/30",
                                            "transition-all duration-300 h-12"
                                        )}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                전송 중...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Send className="w-5 h-5" />
                                                문의 보내기
                                            </span>
                                        )}
                                    </Button>

                                    {/* Form hint */}
                                    <p className="text-center text-xs text-zinc-600">
                                        문의 접수 후 영업일 기준 1~2일 내에 답변 드립니다
                                    </p>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
