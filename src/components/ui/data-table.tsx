"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import * as XLSX from "xlsx"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, ChevronLeft, ChevronRight, RefreshCw, Search, Filter, Upload } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  placeholder?: string
  headerActions?: React.ReactNode
  children?: React.ReactNode
  onRefresh?: () => void
  pageCount?: number
  pageIndex?: number
  onPageChange?: (index: number) => void
  manualPagination?: boolean
  totalItems?: number
  exportFilename?: string
  onExport?: (data: Record<string, unknown>[]) => void
  isLoading?: boolean
  hidePagination?: boolean
  maxHeight?: string
  showExport?: boolean
  showColumnToggle?: boolean
}

function DataTableComponent<TData, TValue>({
  columns,
  data,
  searchKey,
  placeholder = "Search...",
  headerActions,
  children,
  onRefresh,
  pageCount,
  pageIndex,
  onPageChange,
  manualPagination,
  totalItems,
  exportFilename = "Table-Export",
  onExport,
  isLoading = false,
  hidePagination = true,
  maxHeight = "600px",
  showExport = true,
  showColumnToggle = true,
}: DataTableProps<TData, TValue>) {
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleRefresh = () => {
    if (!onRefresh) return
    setIsRefreshing(true)
    onRefresh()
    setTimeout(() => setIsRefreshing(false), 800)
  }

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination || hidePagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: manualPagination,
    pageCount: pageCount,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: hidePagination ? 100000 : 10,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      ...((manualPagination || !hidePagination) && {
        pagination: {
          pageIndex: (pageIndex ?? 1) - 1,
          pageSize: 10,
        },
      }),
    },
  })

  const exportToExcel = () => {
    const rowsToExport = table.getFilteredRowModel().rows
    const visibleColumns = table.getVisibleFlatColumns().filter(
      (col) => col.id !== "actions" && col.id !== "select" && (!!col.columnDef.header || !!col.id)
    )

    const dataToExport = rowsToExport.map((row) => {
      const rowData: Record<string, unknown> = {}
      visibleColumns.forEach((col) => {
        let header = col.id
        if (typeof col.columnDef.header === "string") {
          header = col.columnDef.header
        } else if (col.id) {
          header = col.id
            .split(/[._]/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        }

        let value: unknown = row.getValue(col.id)

        if (value && typeof value === "object" && !Array.isArray(value)) {
          const o = value as { name?: string; fullName?: string; title?: string }
          value = o.name ?? o.fullName ?? o.title ?? JSON.stringify(value)
        } else if (Array.isArray(value)) {
          if (value.length > 0 && (typeof value[0] === "string" || typeof value[0] === "number")) {
            value = value.join(", ")
          } else {
            value = String(value.length)
          }
        }

        if (typeof value === "string" && value.includes(".") && !isNaN(Number(value))) {
          const num = Number(value)
          value = Number(num.toFixed(2))
        } else if (typeof value === "string" && /^\d+$/.test(value)) {
          if (value.length === 1 || value[0] !== "0") {
            value = Number(value)
          }
        }

        rowData[header] = value
      })
      return rowData
    })

    onExport?.(dataToExport)

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Export")
    XLSX.writeFile(workbook, `${exportFilename}-${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4">
          {searchKey && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                placeholder={placeholder}
                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
                className="pl-10 h-11 border-input bg-background/50 text-foreground shadow-sm focus-visible:ring-primary/20 rounded-xl font-bold"
              />
            </div>
          )}
          {headerActions}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={handleRefresh}
              className="h-9 w-9 p-0"
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 transition-transform duration-700 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          )}
          {showExport && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={exportToExcel}
              className="h-10 border-input bg-background shadow-sm hover:shadow-md transition-all flex items-center gap-2 font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-100"
              title="Export to Excel"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}
          {showColumnToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-10 border-input bg-background shadow-sm flex items-center gap-2 font-bold text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  Columns <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border shadow-sm bg-card relative">
        <div
          className="overflow-auto [scrollbar-gutter:stable] [&::-webkit-scrollbar]:w-2"
          style={hidePagination ? { maxHeight: maxHeight } : undefined}
        >
          <Table>
            <TableHeader
              className={cn(
                "bg-card/95 backdrop-blur-sm border-b border-border transition-colors",
                hidePagination && "sticky top-0 z-30"
              )}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="bg-card/95 font-black uppercase text-[10px] tracking-widest text-muted-foreground/80 h-14"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(10)].map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j} className="h-14">
                        <div className="h-5 w-full bg-muted/20 animate-pulse rounded-lg" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="font-medium text-muted-foreground">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {(!hidePagination || manualPagination) && (
        <div className="flex items-center justify-end space-x-2 py-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {(() => {
              if (manualPagination) {
                const from = ((pageIndex ?? 1) - 1) * 10 + 1
                const to = Math.min((pageIndex ?? 1) * 10, totalItems ?? 0)
                return `Showing ${from}–${to} of ${totalItems ?? 0} results (Page ${pageIndex} of ${pageCount})`
              }
              const state = table.getState()
              const pageIndexInternal = state.pagination?.pageIndex ?? 0
              const pageSizeInternal = state.pagination?.pageSize ?? 10
              const total = table.getFilteredRowModel().rows.length
              const from = total === 0 ? 0 : pageIndexInternal * pageSizeInternal + 1
              const to = Math.min((pageIndexInternal + 1) * pageSizeInternal, total)
              return `Showing ${from}–${to} of ${total} results`
            })()}
          </div>
          <div className="space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                manualPagination ? onPageChange?.((pageIndex ?? 1) - 1) : table.previousPage()
              }
              disabled={manualPagination ? (pageIndex ?? 1) <= 1 : !table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => (manualPagination ? onPageChange?.((pageIndex ?? 1) + 1) : table.nextPage())}
              disabled={
                manualPagination ? (pageIndex ?? 1) >= (pageCount ?? 1) : !table.getCanNextPage()
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {children}
    </div>
  )
}

export const DataTable = React.memo(DataTableComponent) as typeof DataTableComponent
