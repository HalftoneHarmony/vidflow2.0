"use client";

import * as React from "react";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate, formatCurrency } from "@/shared/utils/formatters";
import { updateUserRole } from "../actions";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Shield, Edit3, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";

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
    instagram_id: string | null;
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



    const columns: Column<Profile>[] = [
        {
            header: "Name",
            cell: (user) => {
                return (
                    <div className="flex items-center gap-3 group cursor-default">
                        <Avatar className="h-9 w-9 border border-zinc-800 transition-transform group-hover:scale-110">
                            <AvatarFallback className="bg-zinc-900 font-bold text-zinc-500 group-hover:text-zinc-200 transition-colors">
                                {user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-bold text-white group-hover:text-red-500 transition-colors">{user.name}</span>
                            <span className="text-xs text-zinc-500">{user.email}</span>
                        </div>
                    </div>
                );
            },
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
                                <Badge variant={config.variant} className="gap-1 animate-in fade-in zoom-in duration-300">
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
            header: "Instagram",
            cell: (user) => (
                <span className="text-zinc-400 font-mono text-sm">
                    {user.instagram_id || "-"}
                </span>
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
