"use client";

import * as React from "react";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { InlineEdit } from "@/components/ui/inline-edit";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate, formatCurrency } from "@/shared/utils/formatters";
import { updateUserRole, updateCommissionRate } from "../actions";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Shield, Edit3, User as UserIcon } from "lucide-react";

/**
 * 👥 User Table Component
 * Heavy Metal 스타일 사용자 관리 테이블
 * 
 * @author Vulcan (The Forge Master)
 */

type Profile = {
    id: string;
    email: string;
    name: string;
    role: "ADMIN" | "EDITOR" | "USER";
    phone: string | null;
    commission_rate: number;
    created_at: string;
};

interface UserTableProps {
    users: Profile[];
}

const roleConfig = {
    ADMIN: { label: "ADMIN", variant: "destructive" as const, icon: Shield },
    EDITOR: { label: "EDITOR", variant: "default" as const, icon: Edit3 },
    USER: { label: "USER", variant: "secondary" as const, icon: UserIcon },
};

export function UserTable({ users }: UserTableProps) {
    const [isLoading, setIsLoading] = React.useState(false);

    const handleRoleChange = async (userId: string, newRole: "ADMIN" | "EDITOR" | "USER") => {
        try {
            setIsLoading(true);
            await updateUserRole(userId, newRole);
            toast.success(`역할이 ${newRole}로 변경되었습니다.`);
        } catch (error) {
            toast.error("역할 변경에 실패했습니다.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCommissionChange = async (userId: string, value: string) => {
        const rate = parseInt(value, 10);
        if (isNaN(rate)) {
            toast.error("올바른 숫자를 입력해주세요.");
            return;
        }

        try {
            await updateCommissionRate(userId, rate);
            toast.success("커미션율이 변경되었습니다.");
        } catch (error) {
            toast.error("커미션율 변경에 실패했습니다.");
            console.error(error);
        }
    };

    const columns: Column<Profile>[] = [
        {
            header: "Name",
            cell: (user) => (
                <div className="flex flex-col">
                    <span className="font-bold text-white">{user.name}</span>
                    <span className="text-xs text-zinc-500">{user.email}</span>
                </div>
            ),
        },
        {
            header: "Role",
            cell: (user) => {
                const config = roleConfig[user.role];
                const Icon = config.icon;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1 px-2 hover:bg-zinc-800"
                                disabled={isLoading}
                            >
                                <Badge variant={config.variant} className="gap-1">
                                    <Icon className="w-3 h-3" />
                                    {config.label}
                                </Badge>
                                <ChevronDown className="w-3 h-3 text-zinc-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="bg-zinc-900 border-zinc-800">
                            {(["ADMIN", "EDITOR", "USER"] as const).map((role) => {
                                const roleConf = roleConfig[role];
                                const RoleIcon = roleConf.icon;
                                return (
                                    <DropdownMenuItem
                                        key={role}
                                        onClick={() => handleRoleChange(user.id, role)}
                                        className="gap-2 cursor-pointer"
                                    >
                                        <RoleIcon className="w-4 h-4" />
                                        {roleConf.label}
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
        {
            header: "Commission",
            cell: (user) => (
                <InlineEdit
                    value={String(user.commission_rate || 0)}
                    onSave={(val) => handleCommissionChange(user.id, val)}
                    className="font-mono text-emerald-500"
                    placeholder="0"
                />
            ),
        },
        {
            header: "Phone",
            cell: (user) => (
                <span className="text-zinc-400 font-mono text-sm">
                    {user.phone || "-"}
                </span>
            ),
        },
        {
            header: "Joined",
            cell: (user) => (
                <span className="text-zinc-500 text-xs">
                    {formatDate(user.created_at)}
                </span>
            ),
        },
    ];

    return <DataTable columns={columns} data={users} />;
}
