import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import heroImage from '../assets/form-banner.png'
import toast from 'react-hot-toast'
import { isAdminAccount } from '../lib/account'
import { APP_NAME } from '../config/theme'

const provider = new GoogleAuthProvider()

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const routeByRole = async user => {
    const snapshot = await getDoc(doc(db, 'users', user.uid))
    const profile = snapshot.exists() ? snapshot.data() : null

    if (!profile) {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          fullName: user.displayName || '',
          email: user.email,
          photoURL: user.photoURL || '',
          role: 'student',
          tutorStatus: 'approved',
          createdAt: serverTimestamp(),
        },
        { merge: true },
      )
    }

    if (isAdminAccount(profile)) {
      navigate('/admin/dashboard')
      return
    }

    if (profile?.role === 'tutor') {
      navigate(profile.tutorStatus === 'approved' ? '/tutor/dashboard' : '/tutor/apply')
      return
    }

    navigate('/')
  }

  const handleLogin = async event => {
    event.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }

    try {
      setLoading(true)
      const result = await signInWithEmailAndPassword(auth, email, password)
      await routeByRole(result.user)
      toast.success('Welcome back.')
    } catch {
      setError('Invalid email or password.')
      toast.error('Login failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const result = await signInWithPopup(auth, provider)
      await routeByRole(result.user)
      toast.success('Signed in with Google.')
    } catch {
      setError('Google sign in failed.')
      toast.error('Google sign in failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-[100dvh] bg-[radial-gradient(circle_at_top,_#eff6ff_0%,_#ffffff_45%,_#f8fafc_100%)] lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-slate-950 p-12 text-white lg:flex">
        <div>
          <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-sky-200 ring-1 ring-white/10">
            Sign in to continue learning on {APP_NAME}
          </div>
          <h2 className="mt-8 max-w-xl text-5xl font-black leading-tight">
            Watch tutorials, manage your tutor status, and stay in one workspace.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Students browse approved lessons, tutors upload only after approval, and admins handle identity verification in Firestore.
          </p>
        </div>

        <img src={heroImage} alt="Learning" className="max-w-lg rounded-[28px] border border-white/10 shadow-2xl" />
      </section>

      <section className="flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl rounded-[34px] border border-slate-200 bg-white p-5 shadow-xl sm:p-6 md:p-8">
          <h1 className="text-3xl font-black text-slate-950">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Log in to continue learning or manage your tutor workspace.</p>

          <button
            onClick={handleGoogleLogin}
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

          <form onSubmit={handleLogin} className="space-y-5">
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
                  placeholder="Password"
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
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={event => setRemember(event.target.checked)}
                />
                Remember me
              </label>
              <Link to="/signup" className="font-semibold text-sky-600 hover:underline">
                Need an account?
              </Link>
            </div>

            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-sky-600 px-4 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-sky-600 hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default Login
