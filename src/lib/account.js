export const normalizeProfile = profile => {
  if (!profile) {
    return null
  }

  return {
    ...profile,
    role: profile.admin === true ? 'admin' : profile.role || 'student',
  }
}

export const isAdminAccount = profile => normalizeProfile(profile)?.role === 'admin'

export const isApprovedTutor = profile =>
  normalizeProfile(profile)?.role === 'tutor' && normalizeProfile(profile)?.tutorStatus === 'approved'
