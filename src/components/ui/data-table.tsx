"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface Column<T> {
    header: string
    accessorKey?: keyof T
    cell?: (item: T) => React.ReactNode
    className?: string
    headerClassName?: string
}

interface DataTableProps<T> {
    columns: Column<T>[]
    data: T[]
    onRowClick?: (item: T) => void
    loading?: boolean
    pagination?: {
        currentPage: number
        totalPages: number
        onPageChange: (page: number) => void
    }
    className?: string
}

export function DataTable<T>({
    columns,
    data,
    onRowClick,
    loading,
    pagination,
    className,
}: DataTableProps<T>) {
    return (
        <div className={cn("space-y-4", className)}>
            <div className="rounded-none border border-zinc-800 bg-[#0A0A0A] overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-900/50">
                        <TableRow className="hover:bg-zinc-900/50 border-zinc-800">
                            {columns.map((column, index) => (
                                <TableHead
                                    key={index}
                                    className={cn(
                                        "h-12 px-4 text-xs font-bold text-zinc-400 uppercase tracking-wider font-[family-name:var(--font-oswald)]",
                                        column.headerClassName
                                    )}
                                >
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-zinc-500">
                                        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                                        <span className="text-xs uppercase tracking-widest animate-pulse">Loading Data...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-zinc-500">
                                    No data available.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item, rowIndex) => (
                                <TableRow
                                    key={rowIndex}
                                    onClick={() => onRowClick && onRowClick(item)}
                                    className={cn(
                                        "border-zinc-800/50 transition-colors data-[state=selected]:bg-zinc-800",
                                        onRowClick
                                            ? "cursor-pointer hover:bg-zinc-900 hover:border-l-2 hover:border-l-red-500"
                                            : "hover:bg-transparent"
                                    )}
                                >
                                    {columns.map((column, colIndex) => (
                                        <TableCell
                                            key={colIndex}
                                            className={cn("px-4 py-3 text-sm text-zinc-300", column.className)}
                                        >
                                            {column.cell
                                                ? column.cell(item)
                                                : column.accessorKey
                                                    ? (item[column.accessorKey] as React.ReactNode)
                                                    : null}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage <= 1}
                        className="h-8 w-8 rounded-none border-zinc-700 bg-black hover:bg-zinc-900"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-zinc-500 font-mono">
                        Page {pagination.currentPage} / {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage >= pagination.totalPages}
                        className="h-8 w-8 rounded-none border-zinc-700 bg-black hover:bg-zinc-900"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    )
}
