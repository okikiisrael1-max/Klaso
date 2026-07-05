import { CheckCircle2, Circle, Lightbulb, MoveRight } from 'lucide-react'

const QuestionCard = ({ question, selectedAnswer, answered, onSelectAnswer, onNext, onFinish, isLastQuestion }) => {
  if (!question) {
    return null
  }

  return (
    <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-center gap-2">
        {question.topic ? <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">{question.topic}</span> : null}
        {question.level ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{question.level}</span> : null}
      </div>

      <h3 className="mt-4 text-2xl font-bold text-slate-950">{question.question}</h3>

      <div className="mt-6 grid gap-3">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index
          const isCorrect = question.answerIndex === index
          const showCorrectness = answered

          return (
            <button
              key={`${question.id}-${index}`}
              type="button"
              onClick={() => onSelectAnswer(index)}
              className={`flex items-start gap-3 rounded-[22px] border px-4 py-4 text-left transition ${
                isSelected ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-slate-50 hover:border-sky-300 hover:bg-white'
              }`}
            >
              <span className="mt-0.5">
                {showCorrectness && isCorrect ? (
                  <CheckCircle2 className="text-emerald-600" size={18} />
                ) : isSelected ? (
                  <Circle className="text-sky-600" size={18} fill="currentColor" />
                ) : (
                  <Circle className="text-slate-300" size={18} />
                )}
              </span>
              <span className="text-sm leading-6 text-slate-700">{option}</span>
            </button>
          )
        })}
      </div>

      {answered ? (
        <div className="mt-6 rounded-[24px] bg-amber-50 p-5 text-amber-900">
          <div className="flex items-center gap-2">
            <Lightbulb size={18} />
            <p className="font-semibold">Explanation</p>
          </div>
          <p className="mt-2 text-sm leading-6">{question.explanation || 'Add an explanation to help students learn faster.'}</p>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {answered ? 'Answer locked. Continue when ready.' : 'Pick an answer before moving forward.'}
        </p>

        {isLastQuestion ? (
          <button
            type="button"
            onClick={onFinish}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Finish test
            <MoveRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            Next question
            <MoveRight size={16} />
          </button>
        )}
      </div>
    </article>
  )
}

export default QuestionCard

