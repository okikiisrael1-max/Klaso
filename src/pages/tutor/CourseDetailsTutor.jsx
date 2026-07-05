import { useEffect, useMemo, useState } from 'react'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { ArrowLeft, FileUp, PlayCircle, UploadCloud } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { db } from '../../firebase/config'
import { useUserProfile } from '../../hooks/useUserProfile'
import { uploadToCloudinary } from '../../lib/cloudinary'
import StatusPill from '../../components/StatusPill'

const initialForm = {
  courseTitle: '',
  courseCode: '',
  level: '100 Level',
  faculty: '',
  department: '',
  semester: 'First Semester',
  session: '',
  duration: '',
  price: '',
  description: '',
}

const levels = ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level']
const semesters = ['First Semester', 'Second Semester', 'Special']

const CourseDetailsTutor = () => {
  const navigate = useNavigate()
  const { user, profile, loading } = useUserProfile()
  const [form, setForm] = useState(initialForm)
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const approved = profile?.tutorStatus === 'approved'

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview('')
      return undefined
    }

    const previewUrl = URL.createObjectURL(thumbnailFile)
    setThumbnailPreview(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [thumbnailFile])

  const handleChange = event => {
    const { name, value } = event.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const canSubmit = useMemo(
    () =>
      Boolean(
        form.courseTitle.trim() &&
          form.courseCode.trim() &&
          form.faculty.trim() &&
          form.department.trim() &&
          form.session.trim() &&
          form.price &&
          form.description.trim() &&
          videoFile &&
          thumbnailFile,
      ),
    [form.courseCode, form.courseTitle, form.department, form.description, form.faculty, form.price, form.session, thumbnailFile, videoFile],
  )

  const handleSubmit = async event => {
    event.preventDefault()

    if (!user) {
      toast.error('Please log in first.')
      return
    }

    if (!approved) {
      toast.error('Only approved tutors can upload videos.')
      return
    }

    if (!canSubmit) {
      toast.error('Please complete every required field and attach a video plus thumbnail.')
      return
    }

    try {
      setSubmitting(true)
      const [videoUpload, thumbnailUpload] = await Promise.all([
        uploadToCloudinary(videoFile, { resourceType: 'video' }),
        uploadToCloudinary(thumbnailFile, { resourceType: 'image' }),
      ])

      const tutorialId = `${user.uid}_${Date.now()}`

      await setDoc(doc(db, 'tutorials', tutorialId), {
        tutorId: user.uid,
        tutorName: profile?.fullName || user.displayName || 'Approved tutor',
        title: form.courseTitle.trim(),
        courseTitle: form.courseTitle.trim(),
        courseCode: form.courseCode.trim().toUpperCase(),
        level: form.level,
        faculty: form.faculty.trim(),
        department: form.department.trim(),
        semester: form.semester,
        session: form.session.trim(),
        duration: form.duration.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        thumbnailUrl: thumbnailUpload.secure_url,
        thumbnailPublicId: thumbnailUpload.public_id,
        videoUrl: videoUpload.secure_url,
        videoPublicId: videoUpload.public_id,
        status: 'published',
        createdAt: serverTimestamp(),
      })

      setForm(initialForm)
      setVideoFile(null)
      setThumbnailFile(null)
      toast.success('Tutorial published successfully.')
      navigate('/tutor/dashboard')
    } catch (error) {
      toast.error(error.message || 'Upload failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">Loading tutorial editor...</div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Upload tutorial</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">Sign in to upload a lesson</h1>
          <Link to="/login" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
            Log in
          </Link>
        </div>
      </main>
    )
  }

  if (!approved) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Upload tutorial</p>
              <h1 className="mt-3 text-3xl font-black text-slate-950">Tutorial uploads unlock after approval</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                Once the admin approves your tutor application, you can publish university course content here.
              </p>
            </div>
            <StatusPill status={profile?.tutorStatus || 'draft'} />
          </div>

          <div className="mt-8 rounded-[28px] bg-amber-50 p-6 text-amber-900">
            <p className="text-sm leading-6">
              Complete your tutor approval first. After that, the upload form will unlock and you can start publishing lessons.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/tutor/apply" className="rounded-full bg-amber-950 px-5 py-3 font-semibold text-white">
                Review application
              </Link>
              <Link to="/tutor/dashboard" className="rounded-full border border-amber-200 px-5 py-3 font-semibold text-amber-900">
                Tutor dashboard
              </Link>
            </div>
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
            <div className="flex items-center gap-3">
              <Link to="/tutor/dashboard" className="inline-flex rounded-full border border-slate-200 p-2 text-slate-600">
                <ArrowLeft size={18} />
              </Link>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Upload tutorial</p>
                <h1 className="mt-2 text-3xl font-black text-slate-950">Publish a university course tutorial</h1>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              Fill in the course title, code, level, faculty, department, and semester so students can find the right lesson quickly.
            </p>
          </div>
          <StatusPill status={profile?.tutorStatus || 'draft'} />
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700">Course title</label>
              <input
                name="courseTitle"
                value={form.courseTitle}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
                placeholder="Introduction to Operating Systems"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Course code</label>
              <input
                name="courseCode"
                value={form.courseCode}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
                placeholder="CSC 201"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Level</label>
              <select
                name="level"
                value={form.level}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
              >
                {levels.map(level => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Semester</label>
              <select
                name="semester"
                value={form.semester}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
              >
                {semesters.map(item => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Faculty</label>
              <input
                name="faculty"
                value={form.faculty}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
                placeholder="Computing"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Department</label>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
                placeholder="Computer Science"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Academic session</label>
              <input
                name="session"
                value={form.session}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
                placeholder="2025/2026"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Duration</label>
              <input
                name="duration"
                value={form.duration}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
                placeholder="18 min"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Price</label>
              <input
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
                placeholder="2500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
              placeholder="Tell students what this course lesson covers and why it matters."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex cursor-pointer flex-col rounded-[24px] border-2 border-dashed border-slate-300 bg-slate-50 p-5">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <PlayCircle size={18} className="text-sky-600" />
                Course video
              </span>
              <span className="mt-2 text-sm text-slate-500">{videoFile ? videoFile.name : 'Choose a video file'}</span>
              <input type="file" accept="video/*" className="hidden" onChange={event => setVideoFile(event.target.files?.[0] || null)} />
            </label>

            <label className="flex cursor-pointer flex-col rounded-[24px] border-2 border-dashed border-slate-300 bg-slate-50 p-5">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FileUp size={18} className="text-sky-600" />
                Thumbnail
              </span>
              <span className="mt-2 text-sm text-slate-500">{thumbnailFile ? thumbnailFile.name : 'Choose a thumbnail image'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={event => setThumbnailFile(event.target.files?.[0] || null)}
              />
            </label>
          </div>

          {thumbnailPreview ? (
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50">
              <img src={thumbnailPreview} alt="Thumbnail preview" className="h-64 w-full object-cover" />
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              <UploadCloud size={18} />
              {submitting ? 'Publishing...' : 'Publish lesson'}
            </button>
            <p className="text-sm text-slate-500">Course data, thumbnail, and video are saved directly to Firestore and Cloudinary.</p>
          </div>
        </form>
      </section>
    </main>
  )
}

export default CourseDetailsTutor
