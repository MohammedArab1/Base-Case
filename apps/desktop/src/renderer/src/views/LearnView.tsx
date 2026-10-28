import { useEffect, useMemo, useState } from 'react'
import type { JSX } from 'react'
import type {
  LessonCategory,
  LessonDetail,
  LessonExercise,
  LessonProgress,
  LessonSummary,
} from '../../../shared/types'
import { LessonTutor } from '../components/LessonTutor'
import { Markdown } from '../components/Markdown'
import { Badge } from '../ui/Badge'

const categoryLabels: Record<LessonCategory, string> = {
  foundation: 'Foundations',
  'data-structure': 'Data structures',
  algorithm: 'Algorithms',
  'system-design': 'System design',
}

const categoryOrder: readonly LessonCategory[] = [
  'foundation',
  'data-structure',
  'algorithm',
  'system-design',
]

const categoryDescriptions: Record<LessonCategory, string> = {
  foundation: 'The mental models and vocabulary used everywhere else.',
  'data-structure': 'How data is stored, and what each layout makes cheap.',
  algorithm: 'Repeatable ways to search, traverse, and combine data.',
  'system-design': 'How to reason about services, storage, and failure at scale.',
}

interface LearnViewProps {
  readonly onOpenProblem: (problemId: string) => void
  readonly onOpenDesign: (designId: string) => void
}

function progressFor(
  progress: ReadonlyMap<string, LessonProgress>,
  lessonId: string,
): LessonProgress {
  return (
    progress.get(lessonId) ?? {
      lessonId,
      completed: false,
      completedAt: null,
      lastViewedAt: null,
    }
  )
}

export function LearnView({ onOpenProblem, onOpenDesign }: LearnViewProps): JSX.Element {
  const [lessons, setLessons] = useState<readonly LessonSummary[]>([])
  const [progress, setProgress] = useState<ReadonlyMap<string, LessonProgress>>(new Map())
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'all' | LessonCategory>('all')
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void Promise.all([window.baseCase.learn.list(), window.baseCase.learn.progress()])
      .then(([nextLessons, nextProgress]) => {
        if (!cancelled) {
          setLessons(nextLessons)
          setProgress(new Map(nextProgress.map((entry) => [entry.lessonId, entry])))
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : String(loadError))
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const visibleLessons = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    return lessons.filter((lesson) => {
      if (category !== 'all' && lesson.category !== category) {
        return false
      }

      if (!normalized) {
        return true
      }

      const haystack = [lesson.title, lesson.summary, ...lesson.tags].join(' ').toLowerCase()
      return haystack.includes(normalized)
    })
  }, [category, lessons, query])

  const completedCount = lessons.filter((lesson) => progress.get(lesson.id)?.completed).length

  if (selectedLessonId) {
    return (
      <LessonWorkspace
        key={selectedLessonId}
        lessonId={selectedLessonId}
        progress={progressFor(progress, selectedLessonId)}
        onProgressChange={(entry) =>
          setProgress((current) => new Map(current).set(entry.lessonId, entry))
        }
        onBack={() => setSelectedLessonId(null)}
        onOpenLesson={setSelectedLessonId}
        onOpenProblem={onOpenProblem}
        onOpenDesign={onOpenDesign}
      />
    )
  }

  return (
    <div className="workspace-stack">
      <div className="list-toolbar">
        <div>
          <h2>Learning library</h2>
          <p className="muted">
            {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'} · {completedCount}{' '}
            complete · offline, beginner-friendly, with linked practice
          </p>
        </div>
        <input
          className="input search-input"
          type="search"
          placeholder="Search a topic, tag, or idea"
          aria-label="Search lessons"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="learn-filters" role="group" aria-label="Lesson category">
        <button
          type="button"
          className="learn-filter"
          aria-pressed={category === 'all'}
          onClick={() => setCategory('all')}
        >
          All topics
        </button>
        {categoryOrder.map((id) => (
          <button
            key={id}
            type="button"
            className="learn-filter"
            aria-pressed={category === id}
            onClick={() => setCategory(id)}
          >
            {categoryLabels[id]}
          </button>
        ))}
      </div>

      {error ? (
        <div className="callout callout-error" role="alert">
          <strong>Could not load the learning library.</strong>
          <p>{error}</p>
        </div>
      ) : null}

      {loading ? (
        <p className="muted">Loading lessons…</p>
      ) : lessons.length === 0 ? (
        <section className="empty-state">
          <h2>No lessons yet</h2>
          <p>Install a content pack with lessons to start learning offline.</p>
        </section>
      ) : visibleLessons.length === 0 ? (
        <section className="empty-state">
          <h2>No matches</h2>
          <p>Try a different topic, tag, or phrase from the summary.</p>
        </section>
      ) : (
        <div className="learn-groups">
          {categoryOrder.map((id) => {
            const entries = visibleLessons.filter((lesson) => lesson.category === id)

            if (entries.length === 0) {
              return null
            }

            return (
              <section key={id} className="learn-group" aria-labelledby={`learn-${id}`}>
                <div className="learn-group-heading">
                  <div>
                    <h3 id={`learn-${id}`}>{categoryLabels[id]}</h3>
                    <p className="muted small">{categoryDescriptions[id]}</p>
                  </div>
                  <span className="tag">{entries.length}</span>
                </div>

                <div className="lesson-list">
                  {entries.map((lesson) => {
                    const entry = progress.get(lesson.id)

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        className="lesson-row"
                        onClick={() => setSelectedLessonId(lesson.id)}
                        data-testid="lesson-row"
                      >
                        <span className="lesson-row-main">
                          <span className="lesson-row-title">
                            {lesson.title}
                            {entry?.completed ? (
                              <span className="tag tag-accepted">Complete</span>
                            ) : null}
                          </span>
                          <span className="lesson-row-summary">{lesson.summary}</span>
                          <span className="problem-meta">
                            {lesson.tags.slice(0, 4).map((tag) => (
                              <span className="tag" key={tag}>
                                {tag}
                              </span>
                            ))}
                            <span className="tag">{lesson.estimatedMinutes} min read</span>
                            <span className="tag">
                              {lesson.exerciseCount}{' '}
                              {lesson.exerciseCount === 1 ? 'exercise' : 'exercises'}
                            </span>
                          </span>
                        </span>
                        <span className={`difficulty difficulty-${lesson.difficulty}`}>
                          {lesson.difficulty}
                        </span>
                        <span className="problem-arrow" aria-hidden="true">
                          →
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface LessonWorkspaceProps {
  readonly lessonId: string
  readonly progress: LessonProgress
  readonly onProgressChange: (entry: LessonProgress) => void
  readonly onBack: () => void
  readonly onOpenLesson: (lessonId: string) => void
  readonly onOpenProblem: (problemId: string) => void
  readonly onOpenDesign: (designId: string) => void
}

function LessonWorkspace({
  lessonId,
  progress,
  onProgressChange,
  onBack,
  onOpenLesson,
  onOpenProblem,
  onOpenDesign,
}: LessonWorkspaceProps): JSX.Element {
  const [lesson, setLesson] = useState<LessonDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void window.baseCase.learn
      .get(lessonId)
      .then((nextLesson) => {
        if (!cancelled) {
          setLesson(nextLesson)
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : String(loadError))
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [lessonId])

  const toggleComplete = async (): Promise<void> => {
    setSaving(true)
    setSaveError(null)

    try {
      const entry = await window.baseCase.learn.setComplete({
        lessonId,
        completed: !progress.completed,
      })
      onProgressChange(entry)
    } catch (toggleError: unknown) {
      setSaveError(toggleError instanceof Error ? toggleError.message : String(toggleError))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="muted">Loading lesson…</p>
  }

  if (error || !lesson) {
    return (
      <div className="workspace-stack">
        <button type="button" className="text-button" onClick={onBack}>
          ← Back to lessons
        </button>
        <div className="callout callout-error" role="alert">
          <strong>Could not load this lesson.</strong>
          <p>{error ?? 'The lesson is missing from the content pack.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="workspace-stack lesson-workspace">
      <div className="lesson-topbar">
        <button type="button" className="text-button" onClick={onBack}>
          ← Back to lessons
        </button>
        <div className="lesson-topbar-actions">
          {saveError ? (
            <span className="muted small" role="alert">
              {saveError}
            </span>
          ) : null}
          <button
            type="button"
            className={progress.completed ? 'btn btn-secondary' : 'btn btn-primary'}
            onClick={() => void toggleComplete()}
            disabled={saving}
            aria-pressed={progress.completed}
            data-testid="lesson-complete"
          >
            {saving ? 'Saving…' : progress.completed ? 'Completed ✓' : 'Mark as complete'}
          </button>
        </div>
      </div>

      <header className="lesson-header">
        <div className="lesson-kicker">
          <Badge tone="accent">{categoryLabels[lesson.category]}</Badge>
          <span className="tag">{lesson.estimatedMinutes} min read</span>
          <span className={`difficulty difficulty-${lesson.difficulty}`}>{lesson.difficulty}</span>
          <span className="tag tag-pack">{lesson.packName}</span>
        </div>
        <h2 id="lesson-title">{lesson.title}</h2>
        <p className="lesson-summary">{lesson.summary}</p>
        <div className="problem-meta">
          {lesson.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        {lesson.prerequisites.length > 0 ? (
          <p className="muted small">
            Read first:{' '}
            {lesson.prerequisites.map((prerequisite, index) => (
              <span key={prerequisite.id}>
                {index > 0 ? ', ' : ''}
                <button
                  type="button"
                  className="inline-link"
                  onClick={() => onOpenLesson(prerequisite.id)}
                >
                  {prerequisite.title}
                </button>
              </span>
            ))}
          </p>
        ) : null}
      </header>

      <div className="lesson-layout">
        <article className="lesson-article" aria-labelledby="lesson-title">
          <Markdown>{lesson.content}</Markdown>

          <section className="lesson-check" aria-labelledby="lesson-check-heading">
            <h2 id="lesson-check-heading">Check yourself</h2>
            <p className="muted small">Answer in your own words before opening the answer.</p>
            {lesson.checkYourself.map((check) => (
              <details key={check.question} className="lesson-check-item">
                <summary>{check.question}</summary>
                <p>{check.answer}</p>
              </details>
            ))}
          </section>
        </article>

        <aside className="lesson-aside" aria-label="Lesson summary and practice">
          <section className="lesson-card">
            <h3>Key ideas</h3>
            <ul>
              {lesson.keyPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>

          <section className="lesson-card">
            <h3>Complexity cheatsheet</h3>
            <div className="lesson-table-wrap">
              <table className="lesson-table">
                <caption className="sr-only">Common operations for this topic</caption>
                <thead>
                  <tr>
                    <th scope="col">Operation</th>
                    <th scope="col">{lesson.category === 'system-design' ? 'Target' : 'Time'}</th>
                    <th scope="col">
                      {lesson.category === 'system-design' ? 'Storage / cost' : 'Space'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lesson.complexity.map((row) => (
                    <tr key={`${row.operation}-${row.time}`}>
                      <th scope="row">
                        {row.operation}
                        {row.note ? <span className="lesson-note">{row.note}</span> : null}
                      </th>
                      <td>{row.time}</td>
                      <td>{row.space}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="lesson-card" aria-labelledby="lesson-practice-heading">
            <h3 id="lesson-practice-heading">Practice this idea</h3>
            {lesson.exercises.length === 0 ? (
              <p className="muted small">This lesson has no linked exercises yet.</p>
            ) : (
              <div className="lesson-exercises">
                {lesson.exercises.map((exercise) => (
                  <ExerciseButton
                    key={`${exercise.kind}-${exercise.id}`}
                    exercise={exercise}
                    onOpenProblem={onOpenProblem}
                    onOpenDesign={onOpenDesign}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="lesson-card">
            <h3>Interview notes</h3>
            <ul>
              {lesson.interviewNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>

          <section className="lesson-card">
            <h3>Common mistakes</h3>
            <ul>
              {lesson.commonMistakes.map((mistake) => (
                <li key={mistake}>{mistake}</li>
              ))}
            </ul>
          </section>

          <LessonTutor lesson={lesson} />
        </aside>
      </div>
    </div>
  )
}

function ExerciseButton({
  exercise,
  onOpenProblem,
  onOpenDesign,
}: {
  readonly exercise: LessonExercise
  readonly onOpenProblem: (problemId: string) => void
  readonly onOpenDesign: (designId: string) => void
}): JSX.Element {
  const open = (): void => {
    if (exercise.kind === 'problem') {
      onOpenProblem(exercise.id)
    } else {
      onOpenDesign(exercise.id)
    }
  }

  return (
    <button type="button" className="lesson-exercise" onClick={open}>
      <span className="lesson-exercise-main">
        <span className="lesson-exercise-title">{exercise.title}</span>
        <span className="muted small">{exercise.subtitle}</span>
      </span>
      <span className={`difficulty difficulty-${exercise.difficulty}`}>{exercise.difficulty}</span>
      <span className="problem-arrow" aria-hidden="true">
        →
      </span>
    </button>
  )
}
