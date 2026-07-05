import { useEffect, useMemo, useState } from 'react'
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { ArrowRight, Award, BookOpen, CalendarDays, GraduationCap, ShieldCheck, Star, UserCircle2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { db } from '../firebase/config'
import { useUserProfile } from '../hooks/useUserProfile'
import StatusPill from '../components/StatusPill'
import TutorialCard from '../components/TutorialCard'
import { APP_NAME } from '../config/theme'
import { formatCurrency, getTimestampValue, normalizeTutorial, normalizeUserRecord } from '../lib/records'

const TutorProfile = () => {
  const { tutorId } = useParams()
  const { user, profile, loading: userLoading } = useUserProfile()
  const [tutor, setTutor] = useState(null)
  const [tutorials, setTutorials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true)

      try {
        const [tutorSnapshot, tutorialSnapshot] = await Promise.all([
          getDoc(doc(db, 'users', tutorId)),
          getDocs(query(collection(db, 'tutorials'), where('tutorId', '==', tutorId))),
        ])

        if (tutorSnapshot.exists()) {
          setTutor(normalizeUserRecord(tutorSnapshot.id, tutorSnapshot.data()))
        } else {
          setTutor(null)
        }

        const items = tutorialSnapshot.docs.map(docSnapshot => normalizeTutorial(docSnapshot.id, docSnapshot.data()))
        items.sort((a, b) => getTimestampValue(b.createdAt) - getTimestampValue(a.createdAt))
        setTutorials(items)
      } catch {
        setTutor(null)
        setTutorials([])
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [tutorId])

  const displayName = tutor?.fullName || tutor?.name || 'Tutor profile'
  const speciality = tutor?.specialty || tutor?.bio || `Verified tutor on ${APP_NAME}`
  const title = tutor?.title || 'Tutor'
  const status = tutor?.tutorStatus || 'draft'
  const isOwnProfile = user?.uid === tutorId

  const stats = useMemo(() => {
    const totalPrice = tutorials.reduce((sum, item) => sum + Number(item.price || 0), 0)
    const averagePrice = tutorials.length ? Math.round(totalPrice / tutorials.length) : 0

    return [
      { label: 'Lessons', value: tutorials.length },
      { label: 'Average price', value: tutorials.length ? formatCurrency(averagePrice) : 'NGN 0' },
      { label: 'Tutor status', value: status },
      { label: 'Profile type', value: tutor?.title || 'Public tutor profile' },
    ]
  }, [status, tutor?.title, tutorials])

  const matchedFallbackTutorials = useMemo(() => {
    return tutorials
  }, [tutorials])

  if (loading || userLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">Loading tutor profile...</div>
      </main>
    )
  }

  if (!tutor) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Tutor profile</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">Tutor not found</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            We could not find this tutor profile in Firestore.
          </p>
          <Link to="/explore" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
            Back to explore
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-sm">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.25),_transparent_45%),linear-gradient(135deg,_#0f172a,_#1d4ed8)] px-6 py-10 text-white md:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-black">
                  {(displayName || 'T').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-200">Tutor profile</p>
                  <h1 className="mt-2 text-4xl font-black md:text-5xl">{displayName}</h1>
                  <p className="mt-2 text-sm text-slate-200">{title}</p>
                </div>
              </div>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200">{speciality}</p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <StatusPill status={status} />
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
                  <ShieldCheck size={16} />
                  {status === 'approved' ? `Verified on ${APP_NAME}` : 'Profile awaiting approval'}
                </div>
                {tutor?.rating ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
                    <Star size={16} className="fill-current" />
                    {tutor.rating.toFixed(1)} rating
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[330px] lg:max-w-[380px]">
              {stats.map(item => (
                <div key={item.label} className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.25em] text-sky-200">{item.label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <article className="rounded-[28px] bg-slate-50 p-6">
              <div className="flex items-center gap-3">
                <UserCircle2 size={20} className="text-sky-600" />
                <h2 className="text-xl font-bold text-slate-950">About this tutor</h2>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {tutor.bio || tutor.specialty || 'This tutor has not added a bio yet.'}
              </p>
            </article>

            <article className="rounded-[28px] bg-slate-50 p-6">
              <div className="flex items-center gap-3">
                <Award size={20} className="text-sky-600" />
                <h2 className="text-xl font-bold text-slate-950">Tutor details</h2>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[22px] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Email</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{tutor.email || profile?.email || user?.email || 'Not set'}</p>
                </div>
                <div className="rounded-[22px] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Specialty</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{tutor.specialty || 'Not set'}</p>
                </div>
                <div className="rounded-[22px] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Joined</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {tutor.createdAt?.toDate ? tutor.createdAt.toDate().toLocaleDateString() : 'Available after approval'}
                  </p>
                </div>
                <div className="rounded-[22px] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Role</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{tutor.role || 'tutor'}</p>
                </div>
              </div>
            </article>

            <article className="rounded-[28px] bg-slate-50 p-6">
              <div className="flex items-center gap-3">
                <BookOpen size={20} className="text-sky-600" />
                <h2 className="text-xl font-bold text-slate-950">Published lessons</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                This is a live list of tutorials linked to the tutor profile.
              </p>

              <div className="mt-5 grid gap-5">
                {matchedFallbackTutorials.length ? (
                  matchedFallbackTutorials.map(item => <TutorialCard key={item.id} tutorial={item} />)
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                    No tutorials have been published yet.
                  </div>
                )}
              </div>
            </article>
          </div>

          <aside className="space-y-6">
            <article className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white">
              <div className="flex items-center gap-3">
                <GraduationCap size={20} className="text-sky-300" />
                <h2 className="text-xl font-bold">Teaching overview</h2>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                {isOwnProfile
                  ? 'Use this page to present your public profile to learners and keep your lessons organized.'
                  : 'Learners can use this page to understand the tutor, browse lessons, and decide what to study next.'}
              </p>

              <div className="mt-5 space-y-3">
                <Link
                  to="/tutorials"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Browse tutorials
                  <ArrowRight size={18} />
                </Link>
                {isOwnProfile && status === 'approved' ? (
                  <Link
                    to="/tutor/upload"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
                  >
                    Upload lesson
                  </Link>
                ) : null}
                {isOwnProfile && status !== 'approved' ? (
                  <Link
                    to="/tutor/apply"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
                  >
                    Complete approval
                  </Link>
                ) : null}
              </div>
            </article>

            <article className="rounded-[28px] bg-slate-50 p-6">
              <div className="flex items-center gap-3">
                <CalendarDays size={20} className="text-sky-600" />
                <h2 className="text-xl font-bold text-slate-950">Lesson summary</h2>
              </div>
              <div className="mt-5 grid gap-3">
                <div className="rounded-[22px] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Published lessons</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{tutorials.length}</p>
                </div>
                <div className="rounded-[22px] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Top price</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">
                    {tutorials.length ? formatCurrency(Math.max(...tutorials.map(item => Number(item.price || 0)))) : 'NGN 0'}
                  </p>
                </div>
                <div className="rounded-[22px] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Profile owner</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{isOwnProfile ? 'You' : 'Public profile'}</p>
                </div>
              </div>
            </article>
          </aside>
        </div>
      </section>
    </main>
  )
}

export default TutorProfile
