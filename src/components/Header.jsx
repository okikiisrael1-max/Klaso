import { useState } from 'react'
import { Menu, Search, LogOut, X } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import logo from '../assets/logo.png'
import { auth } from '../firebase/config'
import { useUserProfile } from '../hooks/useUserProfile'
import { APP_NAME } from '../config/theme'
import { isAdminAccount, isApprovedTutor } from '../lib/account'

const Header = () => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { user, profile } = useUserProfile()

  const closeMenu = () => setOpen(false)
  const toggleMenu = () => setOpen(prev => !prev)

  const navClass = ({ isActive }) =>
    isActive ? 'text-sky-600 font-semibold' : 'text-slate-700 transition hover:text-sky-600'

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
  }

  const isTutor = profile?.role === 'tutor'
  const isAdmin = isAdminAccount(profile)
  const approvedTutor = isApprovedTutor(profile)
  const isPendingTutor = isTutor && profile?.tutorStatus !== 'approved'

  const accountLinks = (
    <>
      {isAdmin ? (
        <NavLink to="/admin/dashboard" className={navClass} onClick={closeMenu}>
          Admin
        </NavLink>
      ) : null}
      {user ? (
        <NavLink to="/purchases" className={navClass} onClick={closeMenu}>
          Purchases
        </NavLink>
      ) : null}
      {approvedTutor ? (
        <>
          <NavLink to={`/tutors/${user?.uid}`} className={navClass} onClick={closeMenu}>
            Tutor Profile
          </NavLink>
          <NavLink to="/tutor/dashboard" className={navClass} onClick={closeMenu}>
            Tutor Dashboard
          </NavLink>
          <NavLink to="/tutor/upload" className={navClass} onClick={closeMenu}>
            Upload Tutorial
          </NavLink>
          <NavLink to="/tutor/withdrawals" className={navClass} onClick={closeMenu}>
            Withdrawals
          </NavLink>
        </>
      ) : isPendingTutor ? (
        <>
          <NavLink to="/tutor/apply" className={navClass} onClick={closeMenu}>
            Tutor Approval
          </NavLink>
          <NavLink to={`/tutors/${user?.uid}`} className={navClass} onClick={closeMenu}>
            Tutor Profile
          </NavLink>
        </>
      ) : (
        <NavLink to="/tutor/apply" className={navClass} onClick={closeMenu}>
          Become a Tutor
        </NavLink>
      )}
    </>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
          <img src={logo} alt={`${APP_NAME} logo`} className="h-11 w-11 rounded-2xl object-cover" />
          <div>
            <h1 className="text-xl font-black text-slate-950">{APP_NAME}</h1>
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Verified learning</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>
          <NavLink to="/explore" className={navClass}>
            Explore
          </NavLink>
          <NavLink to="/tutorials" className={navClass}>
            Tutorials
          </NavLink>
          <NavLink to="/cbt" className={navClass}>
            CBT Practice
          </NavLink>
          {accountLinks}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/explore"
            className="hidden rounded-full border border-slate-300 p-3 text-slate-600 transition hover:border-sky-500 hover:text-sky-600 lg:inline-flex"
          >
            <Search size={18} />
          </Link>

          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-3 rounded-full border border-slate-200 px-3 py-2 transition hover:border-sky-500">
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-sky-600 text-sm font-semibold text-white">
                  {(profile?.fullName || user.email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-slate-950">{profile?.fullName || 'Account'}</p>
                  <p className="text-xs text-slate-500">
                    {approvedTutor ? 'approved tutor' : profile?.role || 'student'}
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 lg:inline-flex"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <div className="hidden items-center gap-3 lg:flex">
              <Link to="/login" className="rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800">
                Login
              </Link>
              <Link to="/signup" className="rounded-full bg-sky-600 px-4 py-3 text-sm font-semibold text-white">
                Sign up
              </Link>
            </div>
          )}

          <button onClick={toggleMenu} className="rounded-full border border-slate-300 p-3 text-slate-700 lg:hidden" aria-label="Toggle menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-slate-200 bg-white lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
            <NavLink to="/" className={navClass} onClick={closeMenu}>
              Home
            </NavLink>
            <NavLink to="/explore" className={navClass} onClick={closeMenu}>
              Explore
            </NavLink>
            <NavLink to="/tutorials" className={navClass} onClick={closeMenu}>
              Tutorials
            </NavLink>
            <NavLink to="/cbt" className={navClass} onClick={closeMenu}>
              CBT Practice
            </NavLink>
            {accountLinks}
            {user ? (
              <button onClick={handleLogout} className="rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                Logout
              </button>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" onClick={closeMenu} className="flex-1 rounded-full border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-800">
                  Login
                </Link>
                <Link to="/signup" onClick={closeMenu} className="flex-1 rounded-full bg-sky-600 px-4 py-3 text-center text-sm font-semibold text-white">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  )
}

export default Header
