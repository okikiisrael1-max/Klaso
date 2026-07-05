import { Navigate, useLocation } from 'react-router-dom'
import { useUserProfile } from '../hooks/useUserProfile'
import { isAdminAccount } from '../lib/account'

const RoleGate = ({ allowedRoles = [], redirectTo = '/login', children, fallback = 'Checking access...' }) => {
  const { user, profile, loading } = useUserProfile()
  const location = useLocation()

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">{fallback}</div>
      </main>
    )
  }

  if (!user) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
  }

  const role = isAdminAccount(profile) ? 'admin' : profile?.role || 'student'

  if (allowedRoles.length && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RoleGate
