import React, { useEffect, useState } from "react"
import { useNavigate, useParams, useLocation, Link } from "react-router-dom"
import { createOrUpdateTestSet, getTestSets, uploadMedia } from "@/services/admin.service"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { ArrowLeft, Loader2, Upload } from "lucide-react"

const MODULE_OPTIONS = [
  { id: "writing", label: "Writing" },
  { id: "speaking", label: "Speaking" },
  { id: "reading", label: "Reading" },
  { id: "listening", label: "Listening" },
] as const

const MODE_OPTIONS = [
  { id: "practice", label: "Practice" },
  { id: "simulation", label: "Simulation" },
] as const

type FormState = {
  testSetNumber: string
  title: string
  description: string
  modeSupport: string[]
  modules: string[]
  estimatedTimeMinutes: number
  instructionsPractice: string
  instructionsSimulation: string
  writingInstructionText: string
  writingInstructionVideoUrl: string
  speakingInstructionText: string
  speakingInstructionVideoUrl: string
}

const emptyForm: FormState = {
  testSetNumber: "",
  title: "",
  description: "",
  modeSupport: ["practice", "simulation"],
  modules: ["writing", "speaking", "reading", "listening"],
  estimatedTimeMinutes: 120,
  instructionsPractice: "",
  instructionsSimulation: "",
  writingInstructionText: "",
  writingInstructionVideoUrl: "",
  speakingInstructionText: "",
  speakingInstructionVideoUrl: "",
}

const TestSetFormPage: React.FC = () => {
  const { setNumber: setNumberParam } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isNew = location.pathname.endsWith("/new")
  const editNum = setNumberParam && !isNew ? Number(setNumberParam) : NaN

  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<null | "writing" | "speaking">(null)

  useEffect(() => {
    if (isNew) {
      const t = window.setTimeout(() => {
        setForm(emptyForm)
        setLoading(false)
      }, 0)
      return () => window.clearTimeout(t)
    }
    if (!Number.isFinite(editNum) || editNum < 1) {
      const t = window.setTimeout(() => setLoading(false), 0)
      return () => window.clearTimeout(t)
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const list = (await getTestSets()) as Array<{
          testSetNumber: number
          title?: string
          description?: string
          modeSupport?: string[]
          modules?: string[]
          estimatedTimeMinutes?: number
          instructions?: {
            practice?: string
            simulation?: string
            writingInstructionText?: string
            writingInstructionVideoUrl?: string
            speakingInstructionText?: string
            speakingInstructionVideoUrl?: string
          }
        }>
        const m = list.find((s) => s.testSetNumber === editNum)
        if (cancelled) return
        if (!m) {
          window.alert("Test set not found.")
          navigate("/admin/sets", { replace: true })
          return
        }
        setForm({
          testSetNumber: String(m.testSetNumber),
          title: m.title ?? "",
          description: m.description ?? "",
          modeSupport: m.modeSupport?.length ? [...m.modeSupport] : emptyForm.modeSupport,
          modules: m.modules?.length ? [...m.modules] : emptyForm.modules,
          estimatedTimeMinutes: m.estimatedTimeMinutes ?? 120,
          instructionsPractice: m.instructions?.practice ?? "",
          instructionsSimulation: m.instructions?.simulation ?? "",
          writingInstructionText: m.instructions?.writingInstructionText ?? "",
          writingInstructionVideoUrl: m.instructions?.writingInstructionVideoUrl ?? "",
          speakingInstructionText: m.instructions?.speakingInstructionText ?? "",
          speakingInstructionVideoUrl: m.instructions?.speakingInstructionVideoUrl ?? "",
        })
      } catch (e) {
        console.error(e)
        window.alert("Could not load test set.")
        navigate("/admin/sets", { replace: true })
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isNew, editNum, navigate])

  const update =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.target.value
      if (key === "estimatedTimeMinutes") {
        setForm((p) => ({ ...p, [key]: Number(v) || 0 }))
        return
      }
      setForm((p) => ({ ...p, [key]: v }))
    }

  const toggle = (field: "modules" | "modeSupport", id: string) => {
    setForm((p) => {
      const s = new Set(p[field])
      if (s.has(id)) s.delete(id)
      else s.add(id)
      return { ...p, [field]: Array.from(s) }
    })
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const num = isNew ? Number(form.testSetNumber) : editNum
    if (!form.title?.trim() || !Number.isFinite(num) || num < 1) {
      window.alert("Set number and title are required.")
      return
    }
    setSaving(true)
    try {
      await createOrUpdateTestSet({
        testSetNumber: num,
        title: form.title.trim(),
        description: form.description || undefined,
        modeSupport: form.modeSupport,
        modules: form.modules,
        estimatedTimeMinutes: form.estimatedTimeMinutes,
        instructions: {
          practice: form.instructionsPractice,
          simulation: form.instructionsSimulation,
          writingInstructionText: form.writingInstructionText,
          writingInstructionVideoUrl: form.writingInstructionVideoUrl,
          speakingInstructionText: form.speakingInstructionText,
          speakingInstructionVideoUrl: form.speakingInstructionVideoUrl,
        },
        status: "draft",
      })
      navigate("/admin/sets", { replace: true })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      window.alert(e.response?.data?.error || "Save failed.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  const uploadInstructionVideo = async (field: "writing" | "speaking", file?: File) => {
    if (!file) return
    setUploadingField(field)
    try {
      const { mediaUrl } = await uploadMedia(file)
      if (field === "writing") {
        setForm((p) => ({ ...p, writingInstructionVideoUrl: mediaUrl }))
      } else {
        setForm((p) => ({ ...p, speakingInstructionVideoUrl: mediaUrl }))
      }
    } catch {
      window.alert("Video upload failed. Please try again.")
    } finally {
      setUploadingField(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/admin/sets"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "w-fit gap-1.5 -ml-1 text-muted-foreground"
        )}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to list
      </Link>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>{isNew ? "New test set" : `Edit test set #${editNum}`}</CardTitle>
          <CardDescription>
            Title, modules, and instructions are stored on the test set document. Use the builder to add writing and
            speaking questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="testSetNumber">Set number</Label>
                <Input
                  id="testSetNumber"
                  type="number"
                  min={1}
                  required
                  disabled={!isNew}
                  value={form.testSetNumber}
                  onChange={update("testSetNumber")}
                  placeholder="e.g. 1"
                />
                {!isNew && <p className="text-xs text-muted-foreground">Set number cannot be changed.</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="est">Est. time (minutes)</Label>
                <Input
                  id="est"
                  type="number"
                  min={1}
                  value={form.estimatedTimeMinutes || ""}
                  onChange={update("estimatedTimeMinutes")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={update("title")} placeholder="e.g. Practice Set 1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={2} value={form.description} onChange={update("description")} />
            </div>
            <div className="space-y-2">
              <Label>Modules in this set</Label>
              <div className="flex flex-wrap gap-3">
                {MODULE_OPTIONS.map((m) => (
                  <label key={m.id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={form.modules.includes(m.id)}
                      onChange={() => toggle("modules", m.id)}
                    />
                    {m.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mode support</Label>
              <div className="flex flex-wrap gap-3">
                {MODE_OPTIONS.map((m) => (
                  <label key={m.id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={form.modeSupport.includes(m.id)}
                      onChange={() => toggle("modeSupport", m.id)}
                    />
                    {m.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ip">Instructions · Practice</Label>
                <Textarea id="ip" rows={3} value={form.instructionsPractice} onChange={update("instructionsPractice")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="is">Instructions · Simulation</Label>
                <Textarea
                  id="is"
                  rows={3}
                  value={form.instructionsSimulation}
                  onChange={update("instructionsSimulation")}
                />
              </div>
            </div>
            <div className="space-y-4 rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold">Writing module instructions</h3>
              <div className="space-y-2">
                <Label htmlFor="wIntroText">Writing instruction text (page 1)</Label>
                <Textarea
                  id="wIntroText"
                  rows={4}
                  value={form.writingInstructionText}
                  onChange={update("writingInstructionText")}
                  placeholder="Instruction page text shown before Writing starts."
                />
              </div>
              <div className="space-y-2">
                <Label>Writing instruction video (page 2)</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.writingInstructionVideoUrl ? "Video uploaded" : "No video uploaded"}
                    readOnly
                    className="flex-1"
                  />
                  <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-3 text-xs font-semibold">
                    {uploadingField === "writing" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    Upload
                    <input
                      type="file"
                      className="hidden"
                      accept="video/*"
                      onChange={(e) => void uploadInstructionVideo("writing", e.target.files?.[0])}
                      disabled={uploadingField != null}
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="space-y-4 rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold">Speaking module instructions</h3>
              <div className="space-y-2">
                <Label htmlFor="sIntroText">Speaking instruction text (page 1)</Label>
                <Textarea
                  id="sIntroText"
                  rows={4}
                  value={form.speakingInstructionText}
                  onChange={update("speakingInstructionText")}
                  placeholder="Instruction page text shown before Speaking starts."
                />
              </div>
              <div className="space-y-2">
                <Label>Speaking instruction video (page 2)</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.speakingInstructionVideoUrl ? "Video uploaded" : "No video uploaded"}
                    readOnly
                    className="flex-1"
                  />
                  <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-3 text-xs font-semibold">
                    {uploadingField === "speaking" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    Upload
                    <input
                      type="file"
                      className="hidden"
                      accept="video/*"
                      onChange={(e) => void uploadInstructionVideo("speaking", e.target.files?.[0])}
                      disabled={uploadingField != null}
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/admin/sets")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default TestSetFormPage






