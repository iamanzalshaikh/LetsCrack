import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getTestSets, publishTestSet } from "@/services/admin.service"
import { Loader2, PenLine, Plus, Settings2 } from "lucide-react"

type TestSetRow = {
  _id: string
  testSetNumber: number
  title: string
  status?: string
  modules?: string[]
}

const TestSetListPage: React.FC = () => {
  const [rows, setRows] = useState<TestSetRow[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all")
  const [moduleFilter, setModuleFilter] = useState<"all" | "writing" | "speaking" | "reading" | "listening">("all")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = (await getTestSets()) as TestSetRow[]
      setRows(list)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const onPublish = async (num: number) => {
    if (!window.confirm(`Publish test set ${num}? Students may see it depending on your access rules.`)) return
    setPublishing(num)
    try {
      await publishTestSet(num)
      await load()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } }
      window.alert(err.response?.data?.error || "Publish failed.")
    } finally {
      setPublishing(null)
    }
  }

  const columns = useMemo<ColumnDef<TestSetRow>[]>(
    () => [
      {
        accessorKey: "testSetNumber",
        header: "#",
        cell: ({ row }) => (
          <span className="font-black tabular-nums text-foreground">{row.original.testSetNumber}</span>
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => <span className="text-foreground">{row.original.title}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase",
              row.original.status === "published"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-800"
            )}
          >
            {row.original.status ?? "—"}
          </span>
        ),
      },
      {
        id: "modules",
        header: "Modules",
        cell: ({ row }) => (
          <span className="text-sm">{(row.original.modules || []).join(", ") || "—"}</span>
        ),
        enableColumnFilter: false,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const n = row.original.testSetNumber
          const isPub = row.original.status === "published"
          return (
            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                to={`/admin/sets/${n}/edit`}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "h-8 gap-1 px-2 text-xs font-bold"
                )}
              >
                <Settings2 className="h-3.5 w-3.5" />
                Meta
              </Link>
              <Link
                to={`/admin/test-builder/${n}`}
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "h-8 gap-1 px-2 text-xs font-bold"
                )}
              >
                <PenLine className="h-3.5 w-3.5" />
                Builder
              </Link>
              {!isPub && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs font-bold"
                  disabled={publishing === n}
                  onClick={() => void onPublish(n)}
                >
                  {publishing === n ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Publish"}
                </Button>
              )}
            </div>
          )
        },
        enableHiding: false,
        enableColumnFilter: false,
      },
    ],
    [publishing]
  )

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const statusOk =
        statusFilter === "all" ||
        (statusFilter === "published" ? row.status === "published" : row.status !== "published")
      const moduleOk = moduleFilter === "all" || (row.modules || []).includes(moduleFilter)
      return statusOk && moduleOk
    })
  }, [moduleFilter, rows, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Test sets</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage metadata here, then open the builder to edit writing and speaking content.
          </p>
        </div>
        <Link
          to="/admin/sets/new"
          className={cn(buttonVariants({ size: "default" }), "inline-flex w-fit gap-2 rounded-xl shadow-sm")}
        >
          <Plus className="h-4 w-4" />
          New test set
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={filteredRows}
        searchKey="title"
        placeholder="Search by title…"
        onRefresh={load}
        isLoading={loading}
        showExport={false}
        showColumnToggle={false}
        maxHeight="min(70vh, 720px)"
        headerActions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value as typeof moduleFilter)}
            >
              <option value="all">All modules</option>
              <option value="writing">Writing</option>
              <option value="speaking">Speaking</option>
              <option value="reading">Reading</option>
              <option value="listening">Listening</option>
            </select>
            {(statusFilter !== "all" || moduleFilter !== "all") && (
              <button
                type="button"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-9 px-2 text-xs")}
                onClick={() => {
                  setStatusFilter("all")
                  setModuleFilter("all")
                }}
              >
                Clear
              </button>
            )}
          </div>
        }
      />
    </div>
  )
}

export default TestSetListPage
