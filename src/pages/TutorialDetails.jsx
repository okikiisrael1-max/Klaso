import { useEffect, useMemo, useState } from 'react'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { Copy, Lock, PlayCircle, Share2, ShieldCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { db } from '../firebase/config'
import { useUserProfile } from '../hooks/useUserProfile'
import StatusPill from '../components/StatusPill'
import VideoComments from '../components/VideoComments'
import { APP_NAME, theme } from '../config/theme'
import { formatCurrency, normalizeTutorial } from '../lib/records'

const TutorialDetails = () => {
  const { tutorialId } = useParams()
  const { user } = useUserProfile()
  const [tutorial, setTutorial] = useState(null)
  const [access, setAccess] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTutorial = async () => {
      try {
        const snapshot = await getDoc(doc(db, 'tutorials', tutorialId))
        if (snapshot.exists()) {
          setTutorial(normalizeTutorial(snapshot.id, snapshot.data()))
          return
        }
        setTutorial(null)
      } catch {
        setTutorial(null)
      } finally {
        setLoading(false)
      }
    }

    loadTutorial()
  }, [tutorialId])

  useEffect(() => {
    const loadAccess = async () => {
      if (!user) {
        setAccess(null)
        return
      }

      try {
        const snapshot = await getDocs(collection(db, 'tutorialPurchases'))
        const record = snapshot.docs
          .map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() }))
          .find(item => item.tutorialId === tutorialId && item.userId === user.uid && item.status === 'approved')

        setAccess(record || null)
      } catch {
        setAccess(null)
      }
    }

    loadAccess()
  }, [tutorialId, user])

  const hasAccess = Boolean(access)
  const ctaHref = useMemo(() => `/tutorials/${tutorialId}/pay`, [tutorialId])
  const shareUrl = `${window.location.origin}/tutorials/${tutorialId}`

  const handleShare = async type => {
    try {
      const url = type === 'video' && hasAccess && tutorial.videoUrl ? tutorial.videoUrl : shareUrl
      const title = type === 'video' ? `${tutorial.courseTitle || tutorial.title} video` : tutorial.courseTitle || tutorial.title
      const text =
        type === 'video' && hasAccess && tutorial.videoUrl
          ? `Watch the video lesson "${tutorial.courseTitle || tutorial.title}" on ${APP_NAME}`
          : `Open "${tutorial.courseTitle || tutorial.title}" on ${APP_NAME}`

      if (navigator.share) {
        await navigator.share({ title, text, url })
        return
      }

      await navigator.clipboard.writeText(url)
      toast.success('Link copied.')
    } catch {
      toast.error('Unable to share this tutorial right now.')
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">Loading tutorial...</div>
      </main>
    )
  }

  if (!tutorial) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black text-slate-950">Tutorial not found</h1>
          <Link to="/tutorials" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
            Back to tutorials
          </Link>
        </div>
      </main>
    )
  }

  const price = formatCurrency(tutorial.price)

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill status={hasAccess ? 'approved' : 'pending'} />
            {tutorial.courseCode ? <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">{tutorial.courseCode}</span> : null}
            {tutorial.faculty ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{tutorial.faculty}</span> : null}
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{tutorial.level}</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{price}</span>
          </div>

          <h1 className="mt-4 text-4xl font-black text-slate-950">{tutorial.courseTitle || tutorial.title}</h1>
          <p className="mt-3 text-sm text-slate-500">By {tutorial.tutorName || 'Approved tutor'}</p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">{tutorial.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleShare('page')}
              className={theme.ui.secondaryButton + ' inline-flex items-center gap-2'}
            >
              <Share2 size={16} />
              Share page
            </button>
            {hasAccess ? (
              <button
                type="button"
                onClick={() => handleShare('video')}
                className={theme.ui.secondaryButton + ' inline-flex items-center gap-2'}
              >
                <Copy size={16} />
                Share video
              </button>
            ) : null}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <span className="flex flex-col gap-1">
            <p className='font-bold text-[14px]'>Bank Name: </p><p className='font-semibold text-sky-600'>Indulge MFB</p>
          </span>
          <span className="flex flex-col gap-1">
            <p className='font-bold text-[14px]'>Acc No: </p><p className='font-semibold text-sky-600'>9907214744</p>
          </span>
          <span className="flex flex-col gap-1">
            <p className='font-bold text-[14px]'>Bank Name: </p><p className='font-semibold text-sky-600'>ZenithCV Klaso FLW</p>
          </span>
          </div>

          {hasAccess ? (
            <div className="mt-8 rounded-[28px] bg-emerald-50 p-6 text-emerald-900">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} />
                <h2 className="text-lg font-semibold">You own lifetime access to this tutorial</h2>
              </div>
              <p className="mt-3 text-sm leading-6">
                Your payment has been approved by the admin. You can come back any time and watch this video forever.
              </p>
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] bg-slate-950 p-6 text-white">
              <div className="flex items-center gap-3">
                <Lock size={20} className="text-sky-300" />
                <h2 className="text-lg font-semibold">This lesson is locked until manual payment is approved</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Pay once, upload your payment proof, and wait for the admin to approve the request.
              </p>
              <Link
                to={ctaHref}
                className="mt-5 inline-flex rounded-full bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Request access
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3">
              <PlayCircle className="text-sky-600" size={20} />
              <h2 className="text-xl font-bold text-slate-950">Video preview</h2>
            </div>

            <div className="mt-5 overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-sky-800">
              {hasAccess ? (
                <video controls className="aspect-video w-full">
                  <source src={tutorial.videoUrl} />
                </video>
              ) : tutorial.thumbnailUrl ? (
                <div className="relative">
                  <img src={tutorial.thumbnailUrl} alt={tutorial.courseTitle || tutorial.title} className="h-full w-full object-cover opacity-70" />
                  <div className="absolute inset-0 flex min-h-[240px] items-center justify-center bg-slate-950/45 p-6 text-center text-white sm:min-h-[320px] sm:p-10">
                    <div>
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                        <PlayCircle size={34} />
                      </div>
                      <h3 className="mt-5 text-2xl font-bold">Payment required</h3>
                      <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
                        The full video unlocks after your manual payment is approved.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[240px] items-center justify-center p-6 text-center text-white sm:min-h-[320px] sm:p-10">
                  <div>
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                      <PlayCircle size={34} />
                    </div>
                    <h3 className="mt-5 text-2xl font-bold">Payment required</h3>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
                      The full video unlocks after your manual payment is approved.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {!hasAccess ? (
              <div className="mt-6 rounded-[24px] bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-950">What happens next?</p>
                <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  <li>1. Submit payment proof.</li>
                  <li>2. Admin confirms the manual payment.</li>
                  <li>3. Access is granted forever on your account.</li>
                </ol>
              </div>
            ) : null}
          </div>

          <VideoComments tutorialId={tutorialId} tutorialTitle={tutorial.courseTitle || tutorial.title} canComment={hasAccess} />
        </div>
      </section>
    </main>
  )
}

export default TutorialDetails
