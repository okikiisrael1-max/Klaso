const CourseCard = ({ course }) => {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-950">{course.title}</h2>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
          {course.level}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{course.description}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <span>{course.tutor}</span>
        <span>•</span>
        <span>{course.duration}</span>
      </div>

      <button className="mt-6 w-full rounded-full bg-sky-600 px-4 py-3 font-semibold text-white transition hover:bg-sky-700">
        View course
      </button>
    </article>
  )
}

export default CourseCard
