import { Star, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

const TutorCard = ({ tutor }) => {
  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className={`h-32 bg-gradient-to-br ${tutor.accent}`} />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-sky-600">{tutor.level}</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-950">{tutor.name}</h3>
            <p className="text-sm text-slate-500">{tutor.title}</p>
          </div>
          <div className="rounded-2xl bg-slate-950 px-3 py-2 text-right text-white">
            <div className="flex items-center gap-1 text-sm font-semibold text-[gold]">
              <Star size={14} className="fill-current" />
              {tutor.rating}
            </div>
            <p className="text-[11px] text-slate-300">ratings</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">{tutor.specialty}</p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Users size={16} />
            {tutor.students}
          </div>
          <Link
            to={`/tutors/${tutor.id}`}
            className="inline-flex w-full items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 sm:w-auto"
          >
            View profile
          </Link>
        </div>
      </div>
    </article>
  )
}

export default TutorCard
