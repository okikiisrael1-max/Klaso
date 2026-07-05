import { useState } from 'react'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { CheckCircle2, FileUp, UploadCloud } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { db } from '../../firebase/config'
import { useUserProfile } from '../../hooks/useUserProfile'
import { uploadToCloudinary } from '../../lib/cloudinary'
import StatusPill from '../../components/StatusPill'

const TutorApply = () => {
  const { user, profile, loading } = useUserProfile()
  const [fullName, setFullName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [bio, setBio] = useState('')
  const [credentialType, setCredentialType] = useState('National ID')
  const [credentialFile, setCredentialFile] = useState(null)
  const [supportingLink, setSupportingLink] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isApprovedTutor = profile?.role === 'tutor' && profile?.tutorStatus === 'approved'

  const handleSubmit = async event => {
    event.preventDefault()

    if (!user) {
      toast.error('Please log in first.')
      return
    }

    if (!credentialFile) {
      toast.error('Please upload an identity or verified credential.')
      return
    }

    try {
      setSubmitting(true)
      const uploadResult = await uploadToCloudinary(credentialFile, { resourceType: 'auto' })

      const payload = {
        uid: user.uid,
        fullName,
        email: user.email,
        specialty,
        bio,
        credentialType,
        supportingLink,
        credentialUrl: uploadResult.secure_url,
        credentialPublicId: uploadResult.public_id,
        status: 'pending',
        role: 'tutor',
        submittedAt: serverTimestamp(),
      }

      await setDoc(doc(db, 'tutorApplications', user.uid), payload, { merge: true })
      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          fullName,
          email: user.email,
          role: 'tutor',
          tutorStatus: 'pending',
          specialty,
          bio,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )

      toast.success('Application submitted for admin review.')
    } catch (error) {
      toast.error(error.message || 'Application failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">Loading tutor application...</div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Tutor application</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">Sign in to request tutor approval</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            You need an account before you can upload a credential for review.
          </p>
          <Link to="/login" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
            Log in
          </Link>
        </div>
      </main>
    )
  }

  if (isApprovedTutor) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Tutor approval</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">Your tutor account is already approved</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
            You can manage your tutorials, revenue, and withdrawals from your tutor dashboard instead of resubmitting an application.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to="/tutor/dashboard" className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
              Tutor dashboard
            </Link>
            <Link to="/tutor/upload" className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-800">
              Upload tutorial
            </Link>
            <Link to="/tutor/withdrawals" className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-3 font-semibold text-white">
              Withdrawals
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Tutor application</p>
            <h1 className="mt-3 text-3xl font-black text-slate-950">Upload your identity or verified credential</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              The uploaded file is stored in Cloudinary. Once submitted, the application record is saved in Firestore for admin review.
            </p>
          </div>
          <StatusPill status={profile?.tutorStatus || 'draft'} />
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-700">Full name</label>
            <input
              value={fullName || profile?.fullName || ''}
              onChange={event => setFullName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Credential type</label>
            <select
              value={credentialType}
              onChange={event => setCredentialType(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500"
            >
              <option>National ID</option>
              <option>Professional certificate</option>
              <option>School credential</option>
              <option>Government issued ID</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Teaching specialty</label>
            <input
              value={specialty || profile?.specialty || ''}
              onChange={event => setSpecialty(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500"
              placeholder="React, math, exam prep..."
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Supporting link</label>
            <input
              value={supportingLink}
              onChange={event => setSupportingLink(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500"
              placeholder="Portfolio, website, or document link"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Short bio</label>
            <textarea
              value={bio || profile?.bio || ''}
              onChange={event => setBio(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500"
              placeholder="Tell the admin why you should be approved."
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Identity or verified credential file</label>
            <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">
              <UploadCloud size={30} className="text-sky-600" />
              <p className="mt-3 text-sm font-semibold text-slate-950">
                {credentialFile ? credentialFile.name : 'Click to choose an image, PDF, or document'}
              </p>
              <p className="mt-1 text-xs text-slate-500">This file uploads to Cloudinary before the Firestore request is created.</p>
              <input
                type="file"
                className="hidden"
                onChange={event => setCredentialFile(event.target.files?.[0] || null)}
                accept="image/*,.pdf,.doc,.docx"
              />
            </label>
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
            >
              <FileUp size={18} />
              {submitting ? 'Submitting...' : 'Submit application'}
            </button>
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
              <CheckCircle2 size={16} />
              Admin review required before tutorial uploads unlock
            </div>
          </div>
        </form>
      </section>
    </main>
  )
}

export default TutorApply
