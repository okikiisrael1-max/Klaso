export const formatCurrency = value => `NGN ${Number(value || 0).toLocaleString()}`

export const getTimestampValue = value => {
  if (!value) {
    return 0
  }

  if (typeof value.toMillis === 'function') {
    return value.toMillis()
  }

  if (typeof value.seconds === 'number') {
    return value.seconds * 1000
  }

  if (value instanceof Date) {
    return value.getTime()
  }

  return 0
}

export const normalizeTutorial = (id, data = {}) => ({
  id,
  title: data.courseTitle || data.title || 'Untitled tutorial',
  courseTitle: data.courseTitle || data.title || '',
  courseCode: data.courseCode || '',
  level: data.level || 'All Levels',
  faculty: data.faculty || '',
  department: data.department || '',
  semester: data.semester || '',
  session: data.session || '',
  category: data.category || data.department || 'General',
  duration: data.duration || '',
  description: data.description || '',
  tutorId: data.tutorId || '',
  tutorName: data.tutorName || '',
  price: Number(data.price || 0),
  thumbnailUrl: data.thumbnailUrl || '',
  thumbnailPublicId: data.thumbnailPublicId || '',
  videoUrl: data.videoUrl || '',
  videoPublicId: data.videoPublicId || '',
  status: data.status || 'draft',
  createdAt: data.createdAt || null,
})

export const normalizePurchase = (id, data = {}) => ({
  id,
  tutorialId: data.tutorialId || '',
  tutorialTitle: data.tutorialTitle || '',
  courseCode: data.courseCode || '',
  level: data.level || '',
  userId: data.userId || '',
  userName: data.userName || '',
  userEmail: data.userEmail || '',
  amount: Number(data.amount || 0),
  paymentRef: data.paymentRef || '',
  proofUrl: data.proofUrl || '',
  proofPublicId: data.proofPublicId || '',
  status: data.status || 'pending',
  createdAt: data.createdAt || null,
  reviewedAt: data.reviewedAt || null,
  accessGrantedAt: data.accessGrantedAt || null,
})

export const normalizeUserRecord = (id, data = {}) => ({
  id,
  uid: data.uid || id,
  fullName: data.fullName || data.displayName || '',
  email: data.email || '',
  photoURL: data.photoURL || '',
  role: data.admin === true ? 'admin' : data.role || 'student',
  tutorStatus: data.tutorStatus || 'draft',
  specialty: data.specialty || '',
  title: data.title || '',
  bio: data.bio || '',
  studentCount: Number(data.studentCount || 0),
  rating: Number(data.rating || 0),
  createdAt: data.createdAt || null,
  updatedAt: data.updatedAt || null,
})

