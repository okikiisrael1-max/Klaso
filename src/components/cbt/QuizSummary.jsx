import { Award, BadgeCheck, CircleCheckBig, School, TimerReset } from 'lucide-react'

const QuizSummary = ({ bank, score, totalQuestions, onRestart }) => {
  return (
    <article className="rounded-[32px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm md:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <BadgeCheck size={18} className="text-sky-300" />
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-200">Result</p>
      </div>

      <h3 className="mt-4 text-3xl font-black">Quiz complete</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">
        {bank?.courseTitle || bank?.courseCode || 'Selected course'}
        {bank?.level ? ` (${bank.level})` : ''} has been scored. Run the test again anytime.
      </p>

      <div className="mt-6 grid gap-4 grid-cols-2 xl:grid-cols-4">
        {[
          ['Score', `${score}/${totalQuestions}`, Award],
          ['Questions', totalQuestions, School],
          ['Accuracy', totalQuestions ? `${Math.round((score / totalQuestions) * 100)}%` : '0%', CircleCheckBig],
          ['Status', score >= Math.ceil(totalQuestions / 2) ? 'Pass' : 'Try again', TimerReset],
        ].map(([label, value, Icon]) => (
          <div key={label} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <Icon size={18} className="text-sky-300" />
            <p className="mt-3 text-xs uppercase tracking-widest text-slate-400">{label}</p>
            <p className="mt-2 text-[16px] font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
      >
        Try another course
      </button>
    </article>
  )
}

export default QuizSummary
