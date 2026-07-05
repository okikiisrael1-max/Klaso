import { useMemo, useState } from 'react'
import { ArrowRight, Brain, Clock3, Sparkles } from 'lucide-react'
import QuestionCard from '../components/cbt/QuestionCard'
import QuizSummary from '../components/cbt/QuizSummary'
import { getQuestionSets } from '../data/questionBank'

const shuffleQuestions = questions => [...questions]

const CBTPractice = () => {
  const questionSets = useMemo(() => getQuestionSets(), [])
  const availableCourses = useMemo(() => {
    const map = new Map()

    questionSets.forEach(set => {
      const key = set.courseCode || set.courseTitle || set.id
      if (!map.has(key)) {
        map.set(key, {
          key,
          courseTitle: set.courseTitle || set.courseCode || 'Untitled course',
          courseCode: set.courseCode || '',
          department: set.department || '',
          faculty: set.faculty || '',
          levels: new Set(),
        })
      }

      const entry = map.get(key)
      if (set.level) {
        entry.levels.add(set.level)
      }
    })

    return [...map.values()].map(course => ({
      ...course,
      levels: [...course.levels],
    }))
  }, [questionSets])

  const [selectedCourseKey, setSelectedCourseKey] = useState(availableCourses[0]?.key || '')
  const selectedCourse = availableCourses.find(item => item.key === selectedCourseKey) || availableCourses[0] || null
  const availableLevels = selectedCourse?.levels?.length ? selectedCourse.levels : ['Any level']
  const [selectedLevel, setSelectedLevel] = useState(availableLevels[0] || '')
  const [questionCount, setQuestionCount] = useState(5)
  const [quizState, setQuizState] = useState({
    started: false,
    finished: false,
    currentIndex: 0,
    answers: [],
    score: 0,
    questions: [],
  })

  const selectedSet =
    questionSets.find(item => {
      const courseKey = item.courseCode || item.courseTitle || item.id
      const matchesCourse = courseKey === selectedCourse?.key
      const matchesLevel = !selectedLevel || selectedLevel === 'Any level' || item.level === selectedLevel
      return matchesCourse && matchesLevel
    }) ||
    questionSets.find(item => {
      const courseKey = item.courseCode || item.courseTitle || item.id
      return courseKey === selectedCourse?.key
    }) ||
    questionSets[0] ||
    null
  const selectedQuestions = selectedSet?.questions || []
  const activeQuestions = quizState.started ? quizState.questions : []
  const currentQuestion = activeQuestions[quizState.currentIndex] || null

  const startQuiz = () => {
    if (!selectedSet || !selectedQuestions.length) {
      return
    }

    const questions = shuffleQuestions(selectedQuestions).slice(0, Math.max(1, Number(questionCount) || 1))

    setQuizState({
      started: true,
      finished: false,
      currentIndex: 0,
      answers: Array(questions.length).fill(null),
      score: 0,
      questions,
    })
  }

  const restartQuiz = () => {
    setQuizState({
      started: false,
      finished: false,
      currentIndex: 0,
      answers: [],
      score: 0,
      questions: [],
    })
  }

  const selectAnswer = answerIndex => {
    setQuizState(prev => {
      if (!prev.started || prev.finished) {
        return prev
      }

      const nextAnswers = [...prev.answers]
      nextAnswers[prev.currentIndex] = answerIndex
      return {
        ...prev,
        answers: nextAnswers,
      }
    })
  }

  const moveNext = () => {
    setQuizState(prev => {
      if (!prev.started || prev.finished) {
        return prev
      }

      const isLastQuestion = prev.currentIndex >= prev.questions.length - 1
      if (isLastQuestion) {
        return prev
      }

      return {
        ...prev,
        currentIndex: prev.currentIndex + 1,
      }
    })
  }

  const finishQuiz = () => {
    setQuizState(prev => {
      const score = prev.questions.reduce((total, question, index) => total + (prev.answers[index] === question.answerIndex ? 1 : 0), 0)
      return {
        ...prev,
        finished: true,
        score,
      }
    })
  }

  const stats = [
   
  ]

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-sm">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_40%),linear-gradient(135deg,_#0f172a,_#172554)] px-6 py-4 text-white md:px-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-sky-200">
                <Sparkles size={16} />
                CBT Practice
              </div>
              <h1 className="mt-4 text-2xl font-black leading-tight md:text-4xl">Choose a course and level, then start a CBT session.</h1>
            </div>

            <div className="grid gap-3 grid-cols-2 lg:min-w-[360px]">
              {stats.map(([label, value, Icon]) => (
                <div key={label} className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <Icon size={18} className="text-sky-300" />
                  <p className="mt-3 text-xs uppercase tracking-[0.25em] text-slate-300">{label}</p>
                  <p className="mt-2 text-2xl font-black">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="space-y-6">
            <div className="rounded-[32px] bg-slate-50 p-6">
              <div className="flex items-center gap-3">
                <Brain size={20} className="text-sky-600" />
                <h2 className="text-xl font-bold text-slate-950">Select course and level</h2>
              </div>

              <div className="mt-5 space-y-4">
                {availableCourses.length ? (
                  <>
                    <label className="block">
                      <span className="text-sm font-semibold text-slate-700">Course</span>
                      <select
                        value={selectedCourse?.key || ''}
                        onChange={event => {
                          const nextCourse = availableCourses.find(item => item.key === event.target.value)
                          setSelectedCourseKey(event.target.value)
                          setSelectedLevel(nextCourse?.levels?.[0] || 'Any level')
                          setQuizState({
                            started: false,
                            finished: false,
                            currentIndex: 0,
                            answers: [],
                            score: 0,
                            questions: [],
                          })
                        }}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
                      >
                        {availableCourses.map(course => (
                          <option key={course.key} value={course.key}>
                            {course.courseTitle} {course.courseCode ? `(${course.courseCode})` : ''}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold text-slate-700">Level</span>
                      <select
                        value={selectedLevel}
                        onChange={event => {
                          setSelectedLevel(event.target.value)
                          setQuizState({
                            started: false,
                            finished: false,
                            currentIndex: 0,
                            answers: [],
                            score: 0,
                            questions: [],
                          })
                        }}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400">
                        {availableLevels.map(level => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                      <p className="text-sm font-semibold text-slate-950">{selectedSet?.courseTitle || selectedCourse?.courseTitle || 'Selected course'}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500">
                        {selectedSet?.courseCode || selectedCourse?.courseCode || 'No code'} | {selectedSet?.level || selectedLevel || 'Any level'}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">{selectedSet?.department || selectedCourse?.department || 'Department not set'}</p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-5 text-sm leading-6 text-slate-600">
                    Questions are not available yet. wait till admin update the database
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[32px] bg-slate-950 p-6 text-white">
              <div className="flex items-center gap-3">
                <Clock3 size={20} className="text-sky-300" />
                <h2 className="text-xl font-bold">Practice settings</h2>
              </div>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-300">Question count</span>
                  <input
                    type="number"
                    min="1"
                    max={selectedQuestions.length || 1}
                    value={questionCount}
                    onChange={event => setQuestionCount(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-sky-400"
                    placeholder="5"
                  />
                </label>

                <button
                  type="button"
                  onClick={startQuiz}
                  disabled={!selectedQuestions.length}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Start CBT
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            {!quizState.started ? (
              <div className="rounded-[32px] border border-dashed border-slate-300 bg-slate-50 p-8">
                <h2 className="text-2xl font-bold text-slate-950">Ready when you are</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  Pick a course and level, then launch the CBT session. 
                </p>
              </div>
            ) : quizState.finished ? (
              <QuizSummary bank={selectedSet} score={quizState.score} totalQuestions={quizState.questions.length} onRestart={restartQuiz} />
            ) : currentQuestion ? (
              <>
                <div className="rounded-[32px] bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Question progress</p>
                      <p className="mt-1 text-lg font-bold text-slate-950">
                        {quizState.currentIndex + 1} of {activeQuestions.length}
                      </p>
                    </div>
                    <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                      {selectedSet?.courseCode || 'CBT session'}
                    </div>
                  </div>
                </div>

                <QuestionCard
                  question={currentQuestion}
                  selectedAnswer={quizState.answers[quizState.currentIndex]}
                  answered={quizState.answers[quizState.currentIndex] !== null && quizState.answers[quizState.currentIndex] !== undefined}
                  onSelectAnswer={selectAnswer}
                  onNext={moveNext}
                  onFinish={finishQuiz}
                  isLastQuestion={quizState.currentIndex === activeQuestions.length - 1}
                />
              </>
            ) : (
              <div className="rounded-[32px] border border-dashed border-slate-300 bg-slate-50 p-8 text-sm leading-6 text-slate-600">
                No questions are available for this course and level yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default CBTPractice
