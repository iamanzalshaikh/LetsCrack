import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getAvailableTests, type TestSet } from "@/services/test.service"
import { BookOpen, ChevronRight, Loader2 } from "lucide-react"

const StudentCoursesPage: React.FC = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<TestSet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const run = async () => {
      try {
        setCourses(await getAvailableTests())
        setError("")
      } catch {
        setError("Too many requests right now. Please wait a few seconds and refresh.")
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [])

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Courses</h2>
        <p className="mt-1 text-sm text-slate-500">
          This section lists CELPIP practice courses/sets. Subscription plans can later gate premium courses here.
        </p>
      </section>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex justify-center py-12 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course.testSetNumber}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">
                  Set {course.testSetNumber}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900">{course.title}</h3>
              <p className="mt-1 min-h-10 text-sm text-slate-500">{course.description}</p>
              <button
                onClick={() => navigate(`/test/setup/${course.testSetNumber}`)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-black text-white transition hover:bg-blue-600"
              >
                Start Course <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  )
}

export default StudentCoursesPage
