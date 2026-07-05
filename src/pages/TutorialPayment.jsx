import { useEffect, useState } from 'react'
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { ArrowLeft, BadgeCheck, Banknote, UploadCloud } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { db } from '../firebase/config'
import { useUserProfile } from '../hooks/useUserProfile'
import { uploadToCloudinary } from '../lib/cloudinary'
import { formatCurrency, normalizeTutorial, normalizePurchase } from '../lib/records'

const TutorialPayment = () => {
  const { tutorialId } = useParams()
  const navigate = useNavigate()
  const { user, profile, loading: userLoading } = useUserProfile()
  const [tutorial, setTutorial] = useState(null)
  const [proofFile, setProofFile] = useState(null)
  const [paymentRef, setPaymentRef] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [existingRequest, setExistingRequest] = useState(null)

  useEffect(() => {
    const loadTutorial = async () => {
      try {
        const snapshot = await getDoc(doc(db, 'tutorials', tutorialId))
        setTutorial(snapshot.exists() ? normalizeTutorial(snapshot.id, snapshot.data()) : null)
      } catch {
        setTutorial(null)
      } finally {
        setLoading(false)
      }
    }

    loadTutorial()
  }, [tutorialId])

  useEffect(() => {
    const loadRequest = async () => {
      if (!user) {
        setExistingRequest(null)
        return
      }

      try {
        const snapshot = await getDocs(collection(db, 'tutorialPurchases'))
        const request = snapshot.docs
          .map(docSnapshot => normalizePurchase(docSnapshot.id, docSnapshot.data()))
          .find(item => item.tutorialId === tutorialId && item.userId === user.uid)

        setExistingRequest(request || null)
      } catch {
        setExistingRequest(null)
      }
    }

    loadRequest()
  }, [tutorialId, user])

  const handleSubmit = async event => {
    event.preventDefault()

    if (!user) {
      toast.error('Please log in first.')
      navigate('/login')
      return
    }

    if (!proofFile) {
      toast.error('Please upload your payment proof.')
      return
    }

    try {
      setSubmitting(true)
      const proofUpload = await uploadToCloudinary(proofFile, { resourceType: 'auto' })

      const requestId = `${user.uid}_${tutorialId}`
      await setDoc(doc(db, 'tutorialPurchases', requestId), {
        tutorialId,
        tutorialTitle: tutorial?.courseTitle || tutorial?.title || '',
        courseCode: tutorial?.courseCode || '',
        level: tutorial?.level || '',
        userId: user.uid,
        userName: profile?.fullName || user.displayName || '',
        userEmail: user.email || '',
        amount: Number(tutorial?.price || 0),
        paymentRef,
        proofUrl: proofUpload.secure_url,
        proofPublicId: proofUpload.public_id,
        status: 'pending',
        createdAt: serverTimestamp(),
      })

      toast.success('Payment request submitted. Await admin approval.')
      navigate(`/tutorials/${tutorialId}`)
    } catch (error) {
      toast.error(error.message || 'Unable to submit request.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || userLoading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">Loading payment page...</div>
      </main>
    )
  }

  if (!tutorial) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black text-slate-950">Tutorial not found</h1>
          <Link to="/tutorials" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
            Back to tutorials
          </Link>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Manual payment</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">Log in to request access</h1>
          <Link to="/login" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
            Log in
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link to={`/tutorials/${tutorialId}`} className="inline-flex rounded-full border border-slate-200 p-2 text-slate-600">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Manual payment</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Request lifetime access</h1>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[28px] bg-slate-50 p-6">
            <h2 className="text-2xl font-bold text-slate-950">{tutorial.courseTitle || tutorial.title}</h2>
            <p className="mt-2 text-sm text-slate-500">By {tutorial.tutorName || 'Approved tutor'}</p>
            <p className="mt-4 text-sm leading-6 text-slate-600">{tutorial.description}</p>

            <div className="mt-6 rounded-[24px] bg-white p-5">
              <p className="text-sm text-slate-500">One-time payment</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{formatCurrency(tutorial.price)}</p>
              <p className="mt-2 text-sm text-slate-600">Pay once and keep access forever after admin approval.</p>
            </div>

            <div className="mt-6 rounded-[24px] border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
              <div className="flex items-center gap-3">
                <BadgeCheck size={18} />
                <p className="font-semibold">Manual payment review</p>
              </div>
              <p className="mt-2 text-sm leading-6">
                Upload your payment proof and add a payment reference. The admin will confirm the payment before access is granted.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-[28px] bg-slate-950 p-6 text-white">
            <h2 className="text-2xl font-bold">Submit payment proof</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Manual payment lets the admin verify the transaction before the tutorial unlocks on your account.
            </p>

            {existingRequest ? (
              <div className="mt-6 rounded-[24px] bg-white/10 p-5">
                <p className="text-sm font-semibold text-white">Existing request</p>
                <p className="mt-2 text-sm text-slate-300">Status: {existingRequest.status}</p>
              </div>
            ) : null}

            <div className="mt-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-200">Payment reference</label>
                <input
                  value={paymentRef}
                  onChange={event => setPaymentRef(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-sky-400"
                  placeholder="Bank transfer reference or note"
                />
              </div>

              <label className="flex cursor-pointer flex-col rounded-[24px] border-2 border-dashed border-white/15 bg-white/5 p-5">
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <UploadCloud size={18} className="text-sky-300" />
                  Payment proof
                </span>
                <span className="mt-2 text-sm text-slate-300">{proofFile ? proofFile.name : 'Upload screenshot or receipt'}</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={event => setProofFile(event.target.files?.[0] || null)}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60"
            >
              <Banknote size={18} />
              {submitting ? 'Submitting...' : 'Submit request'}
            </button>

            <p className="mt-4 text-xs leading-5 text-slate-400">
              After the admin approves this request, you will keep access to the tutorial forever on the same account.
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}

export default TutorialPayment
