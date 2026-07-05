import { useState } from 'react'
import { updateProfile as updateAuthProfile } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { Edit3, Save, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { auth, db } from '../firebase/config'
import { useUserProfile } from '../hooks/useUserProfile'
import StatusPill from '../components/StatusPill'
import { APP_NAME, theme } from '../config/theme'
import { isAdminAccount, isApprovedTutor } from '../lib/account'

const createFormState = (profile, user) => ({
  fullName: profile?.fullName || user?.displayName || '',
  photoURL: profile?.photoURL || user?.photoURL || '',
  title: profile?.title || '',
  specialty: profile?.specialty || '',
  bio: profile?.bio || '',
})

const ProfileEditor = ({ user, profile }) => {
  const [form, setForm] = useState(() => createFormState(profile, user))
  const [saving, setSaving] = useState(false)

  const handleChange = event => {
    const { name, value } = event.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async event => {
    event.preventDefault()

    if (!user) {
      toast.error('Please sign in first.')
      return
    }

    try {
      setSaving(true)

      const nextName = form.fullName.trim()
      const nextPhotoURL = form.photoURL.trim()

      await updateAuthProfile(auth.currentUser || user, {
        displayName: nextName || user.displayName || '',
        photoURL: nextPhotoURL || user.photoURL || '',
      })

      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          fullName: nextName || user.displayName || '',
          photoURL: nextPhotoURL || user.photoURL || '',
          title: form.title.trim(),
          specialty: form.specialty.trim(),
          bio: form.bio.trim(),
          email: user.email,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )

      toast.success('Profile updated.')
    } catch (error) {
      toast.error(error.message || 'Unable to update your profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-center gap-3">
        <Edit3 className="text-sky-600" size={20} />
        <h2 className="text-2xl font-bold text-slate-950">Edit profile</h2>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-700">Full name</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Photo URL</label>
            <input
              name="photoURL"
              value={form.photoURL}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Profile title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
              placeholder="Student, tutor, coach..."
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Specialty</label>
            <input
              name="specialty"
              value={form.specialty}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
              placeholder="React, math, exam prep..."
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={6}
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
            placeholder="Tell learners a bit about you."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className={theme.ui.primaryButton}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <p className="text-sm text-slate-500">Your tutor status stays unchanged while you update the public profile fields.</p>
        </div>
      </form>
    </div>
  )
}

const Profile = () => {
  const { user, profile, loading } = useUserProfile()
  const isAdmin = isAdminAccount(profile)
  const approvedTutor = isApprovedTutor(profile)
  const isTutor = profile?.role === 'tutor'
  const editorKey = `${user?.uid || 'guest'}-${profile?.updatedAt?.seconds || 'initial'}`

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <div className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Profile</p>
            <h1 className="mt-3 text-3xl font-black text-slate-950">Your {APP_NAME} account</h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Update your public identity, bio, and teaching details. Changes save to Firebase Auth and Firestore so the rest of the app stays in sync.
            </p>

            <div className="mt-8 rounded-[28px] bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-950">Account details</h2>
              {loading ? (
                <p className="mt-4 text-sm text-slate-500">Loading profile...</p>
              ) : user ? (
                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <p>
                    <span className="font-semibold">Name:</span> {profile?.fullName || user.displayName || 'Unnamed user'}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span> {profile?.email || user.email}
                  </p>
                  <p>
                    <span className="font-semibold">Role:</span> {profile?.role || 'student'}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Tutor status:</span>
                    <StatusPill status={profile?.tutorStatus || 'draft'} />
                  </p>
                  {isAdmin ? (
                    <p className="rounded-full bg-sky-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">
                      Admin access enabled
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">You are not signed in yet. Please create an account or log in first.</p>
              )}
            </div>
          </div>

          <div className="rounded-[34px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm md:p-8">
            <div className="flex items-center gap-3">
              <Sparkles className="text-sky-300" size={20} />
              <h2 className="text-xl font-bold">Quick actions</h2>
            </div>
            <div className="mt-5 flex flex-col gap-3">
              <Link to="/explore" className={theme.ui.primaryButton + ' text-center'}>
                Explore tutors
              </Link>
              <Link to="/tutorials" className="rounded-full border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10">
                Browse tutorials
              </Link>
              <Link to="/purchases" className="rounded-full border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10">
                My purchases
              </Link>
              {isAdmin ? (
                <Link to="/admin/dashboard" className={theme.ui.primaryButton + ' text-center'}>
                  Admin dashboard
                </Link>
              ) : approvedTutor ? (
                <>
                  <Link to="/tutor/dashboard" className={theme.ui.primaryButton + ' text-center'}>
                    Tutor dashboard
                  </Link>
                  <Link to="/tutor/upload" className="rounded-full border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10">
                    Upload tutorial
                  </Link>
                  <Link to="/tutor/withdrawals" className="rounded-full border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10">
                    Withdrawals
                  </Link>
                </>
              ) : (
                <Link to="/tutor/apply" className={theme.ui.primaryButton + ' text-center'}>
                  Apply as a tutor
                </Link>
              )}
              {isTutor ? (
                <Link to={`/tutors/${user?.uid}`} className="rounded-full border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10">
                  View tutor profile
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <ProfileEditor key={editorKey} user={user} profile={profile} />
      </section>
    </main>
  )
}

export default Profile
