import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore'
import { MessageSquareText, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { db } from '../firebase/config'
import { useUserProfile } from '../hooks/useUserProfile'
import { APP_NAME } from '../config/theme'

const formatDate = value => {
  if (!value) {
    return 'Just now'
  }

  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const VideoComments = ({ tutorialId, tutorialTitle, canComment = true }) => {
  const { user, profile } = useUserProfile()
  const [comments, setComments] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const loadComments = useCallback(async () => {
    setLoading(true)

    try {
      const snapshot = await getDocs(query(collection(db, 'tutorialComments'), where('tutorialId', '==', tutorialId)))
      const items = snapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() }))

      items.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0
        const bTime = b.createdAt?.seconds || 0
        return bTime - aTime
      })

      setComments(items)
    } catch {
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [tutorialId])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadComments()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadComments])

  const handleSubmit = async event => {
    event.preventDefault()

    if (!user) {
      toast.error('Sign in to leave a comment.')
      return
    }

    if (!canComment) {
      toast.error('Comments unlock after access is granted.')
      return
    }

    if (!message.trim()) {
      toast.error('Write a message first.')
      return
    }

    try {
      setSubmitting(true)
      await addDoc(collection(db, 'tutorialComments'), {
        tutorialId,
        tutorialTitle: tutorialTitle || '',
        userId: user.uid,
        userName: profile?.fullName || user.displayName || `${APP_NAME} learner`,
        userRole: profile?.role || 'student',
        message: message.trim(),
        createdAt: serverTimestamp(),
      })

      setMessage('')
      await loadComments()
      toast.success('Comment posted.')
    } catch (error) {
      toast.error(error.message || 'Unable to post comment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-center gap-3">
        <MessageSquareText size={20} className="text-sky-600" />
        <div>
          <h2 className="text-xl font-bold text-slate-950">Discussion</h2>
          <p className="text-sm text-slate-500">Share questions, notes, and feedback about this video.</p>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] bg-slate-50 p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={message}
            onChange={event => setMessage(event.target.value)}
            rows={4}
            disabled={!canComment}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-500 disabled:cursor-not-allowed disabled:bg-slate-100"
            placeholder={canComment ? 'Write a helpful comment or question...' : 'Comments unlock after access is granted.'}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </p>
            <button
              type="submit"
              disabled={!canComment || submitting}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={16} />
              {submitting ? 'Posting...' : 'Post comment'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-slate-500">Loading comments...</p>
        ) : comments.length ? (
          comments.map(comment => (
            <article key={comment.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-semibold text-white">
                  {(comment.userName || 'K').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-950">{comment.userName || `${APP_NAME} learner`}</h3>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {comment.userRole || 'student'}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{comment.message}</p>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            No comments yet. Be the first to ask a question or leave a note.
          </div>
        )}
      </div>
    </section>
  )
}

export default VideoComments
