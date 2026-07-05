import { useState } from 'react'
import {
  BookOpen,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import heroImage from '../assets/form-banner.png'
import toast from 'react-hot-toast'

const provider = new GoogleAuthProvider()

const passwordStrength = password => {
  if (password.length < 6) {
    return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' }
  }

  if (password.length < 8) {
    return { label: 'Fair', color: 'bg-amber-500', width: 'w-2/4' }
  }

  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) {
    return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' }
  }

  return { label: 'Good', color: 'bg-sky-500', width: 'w-3/4' }
}

const SignUp = () => {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('student')
  const [agree, setAgree] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const redirectAfterSignup = selectedRole => {
    if (selectedRole === 'tutor') {
      navigate('/tutor/apply')
      return
    }

    navigate('/')
  }

  const persistUser = async (firebaseUser, selectedRole, tutorStatus = 'draft') => {
    await setDoc(
      doc(db, 'users', firebaseUser.uid),
      {
        uid: firebaseUser.uid,
        fullName: firebaseUser.displayName || fullName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL || '',
        role: selectedRole,
        tutorStatus,
        createdAt: serverTimestamp(),
      },
      { merge: true },
    )
  }

  const handleSignup = async event => {
    event.preventDefault()
    setError('')

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!agree) {
      setError('Please agree to the Terms & Conditions.')
      return
    }

    try {
      setLoading(true)
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(credential.user, { displayName: fullName })
      await persistUser(credential.user, role, role === 'tutor' ? 'pending' : 'approved')
      toast.success(role === 'tutor' ? 'Account created. Submit your tutor application.' : 'Account created successfully.')
      redirectAfterSignup(role)
    } catch (err) {
      setError(err.message)
      toast.error('Sign up failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      setLoading(true)
      const result = await signInWithPopup(auth, provider)
      await persistUser(result.user, 'student', 'approved')
      toast.success('Welcome back.')
      navigate('/')
    } catch {
      setError('Google sign up failed.')
      toast.error('Google sign up failed.')
    } finally {
      setLoading(false)
    }
  }

  const strength = passwordStrength(password)

  return (
    <main className="grid min-h-[100dvh] bg-[radial-gradient(circle_at_top,_#eff6ff_0%,_#ffffff_45%,_#f8fafc_100%)] lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-slate-950 p-12 text-white lg:flex">
        <div className="space-y-8">
          <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-sky-200 ring-1 ring-white/10">
            Join the verified tutor platform
          </div>
          <h2 className="max-w-xl text-5xl font-black leading-tight">
            Build trust first, then publish lessons that students can rely on.
          </h2>
          <p className="max-w-xl text-lg leading-8 text-slate-300">
            Students can learn freely, while tutors submit credentials for admin approval before they get publishing access.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Verified tutors', 'Identity and credential upload required'],
              ['Cloudinary storage', 'Documents and videos stored securely'],
              ['Firestore records', 'Profiles, status, and tutorials saved'],
              ['Role-based access', 'Tutors upload only after approval'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sky-200">
                  <ShieldCheck size={18} />
                  <span className="font-semibold">{title}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <img src={heroImage} alt="Learning" className="max-w-lg rounded-[28px] border border-white/10 shadow-2xl" />
      </section>

      <section className="flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl rounded-[34px] border border-slate-200 bg-white p-5 shadow-xl sm:p-6 md:p-8">
          <h1 className="text-3xl font-black text-slate-950">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500">Choose student or tutor, then complete the onboarding flow.</p>

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="mt-8 w-full rounded-full border border-slate-300 px-4 py-3 font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-sm text-slate-400">OR</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-slate-700">Full name</label>
              <div className="relative mt-2">
                <User size={18} className="absolute left-4 top-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={event => setFullName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <div className="relative mt-2">
                <Mail size={18} className="absolute left-4 top-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative mt-2">
                <Lock size={18} className="absolute left-4 top-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-12 outline-none transition focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-4 top-4 text-slate-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="mt-3">
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className={`${strength.color} ${strength.width} h-full`} />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Password strength: <span className="font-semibold">{strength.label}</span>
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Confirm password</label>
              <div className="relative mt-2">
                <Lock size={18} className="absolute left-4 top-4 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={event => setConfirmPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-12 outline-none transition focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="absolute right-4 top-4 text-slate-500"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-700">Choose your role</label>
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`rounded-[24px] border p-4 text-left transition ${
                    role === 'student' ? 'border-sky-500 bg-sky-50' : 'border-slate-300 hover:border-sky-300'
                  }`}
                >
                  <GraduationCap className="text-sky-600" size={28} />
                  <h3 className="mt-4 font-semibold text-slate-950">Student</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Watch tutorials and practice CBT exams.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('tutor')}
                  className={`rounded-[24px] border p-4 text-left transition ${
                    role === 'tutor' ? 'border-sky-500 bg-sky-50' : 'border-slate-300 hover:border-sky-300'
                  }`}
                >
                  <BookOpen className="text-sky-600" size={28} />
                  <h3 className="mt-4 font-semibold text-slate-950">Tutor</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Upload a credential, request approval, then teach.</p>
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={agree}
                onChange={event => setAgree(event.target.checked)}
                className="mt-1"
              />
              <span>
                I agree to the platform terms and privacy policy.
              </span>
            </label>

            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-sky-600 px-4 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
            >
              {loading ? 'Creating your account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-sky-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default SignUp
