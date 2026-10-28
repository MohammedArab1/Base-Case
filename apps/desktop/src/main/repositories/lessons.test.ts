import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { AppDatabase } from '../database'
import { LessonProgressRepository } from './lessons'

function withLessons(run: (lessons: LessonProgressRepository) => void): void {
  const directory = mkdtempSync(join(tmpdir(), 'base-case-lessons-'))
  const database = new AppDatabase(directory)

  try {
    run(new LessonProgressRepository(database))
  } finally {
    database.close()
    rmSync(directory, { recursive: true, force: true })
  }
}

describe('LessonProgressRepository', () => {
  it('returns an incomplete entry before a lesson is opened', () => {
    withLessons((lessons) => {
      expect(lessons.get('core/big-o')).toEqual({
        lessonId: 'core/big-o',
        completed: false,
        completedAt: null,
        lastViewedAt: null,
      })
    })
  })

  it('touches recency without completing the lesson', () => {
    withLessons((lessons) => {
      const touched = lessons.touch('core/big-o')

      expect(touched.completed).toBe(false)
      expect(touched.lastViewedAt).toEqual(expect.any(String))
      expect(lessons.list()).toHaveLength(1)
    })
  })

  it('marks complete, unmarks, and preserves the first completion time', () => {
    withLessons((lessons) => {
      const completed = lessons.setComplete('core/big-o', true)
      expect(completed.completed).toBe(true)
      expect(completed.completedAt).toEqual(expect.any(String))

      const repeated = lessons.setComplete('core/big-o', true)
      expect(repeated.completedAt).toBe(completed.completedAt)

      const unmarked = lessons.setComplete('core/big-o', false)
      expect(unmarked.completed).toBe(false)
      expect(unmarked.completedAt).toBeNull()
      expect(unmarked.lastViewedAt).toBeNull()
    })
  })
})
