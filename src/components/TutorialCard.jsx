import { Link } from 'react-router-dom'
import { PlayCircle, Share2, Video } from 'lucide-react'
import toast from 'react-hot-toast'
import { APP_NAME } from '../config/theme'
import { formatCurrency } from '../lib/records'

const TutorialCard = ({ tutorial }) => {
  const handleShare = async () => {
    const url = `${window.location.origin}/tutorials/${tutorial.id}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: tutorial.title,
          text: `Watch ${tutorial.title} on ${APP_NAME}`,
          url,
        })
        return
      }

      await navigator.clipboard.writeText(url)
      toast.success('Tutorial link copied.')
    } catch {
      toast.error('Unable to share this tutorial right now.')
    }
  }

  return (
    <article className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-sky-800">
        {tutorial.thumbnailUrl ? <img src={tutorial.thumbnailUrl} alt={tutorial.title} className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105" /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 text-white">
          <div className="rounded-full bg-white/10 p-4 ring-1 ring-white/15 transition group-hover:scale-105">
            <PlayCircle size={38} />
          </div>
          <div className="rounded-full bg-slate-950/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur">
            {tutorial.courseCode || tutorial.category || 'Published'}
          </div>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {tutorial.faculty ? <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">{tutorial.faculty}</span> : null}
          {tutorial.department ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{tutorial.department}</span> : null}
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{tutorial.level}</span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            {tutorial.price ? formatCurrency(tutorial.price) : 'Free'}
          </span>
        </div>
        <h3 className="mt-4 text-2xl font-bold text-slate-950">{tutorial.courseTitle || tutorial.title}</h3>
        <p className="mt-2 text-sm text-slate-500">{tutorial.tutorName}</p>
        <p className="mt-4 text-sm leading-6 text-slate-600">{tutorial.description}</p>
        <div className="mt-6 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Video size={16} />
            {tutorial.duration || 'On-demand'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex w-full items-center justify-center gap-1 rounded-full border border-slate-300 px-3 py-2 font-semibold text-slate-700 transition hover:border-sky-500 hover:text-sky-600 sm:w-auto">
              <Share2 size={16} />
              Share
            </button>
            <Link
              to={`/tutorials/${tutorial.id}`}
              className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-slate-800 sm:w-auto">
              {tutorial.price ? 'Buy access' : 'Watch now'}
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export default TutorialCard
