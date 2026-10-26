import { describe, expect, it } from 'vitest'
import { inferJavascriptMemberKind, inferPythonMemberKind } from './editor-completions'

describe('editor member inference', () => {
  it('infers JavaScript member kinds from constructors and annotations', () => {
    expect(inferJavascriptMemberKind('const myMap = new Map<string, number>()', 'myMap')).toBe(
      'map',
    )
    expect(inferJavascriptMemberKind('const seen = new Set<number>()', 'seen')).toBe('set')
    expect(inferJavascriptMemberKind('const items: string[] = []', 'items')).toBe('array')
    expect(inferJavascriptMemberKind('const text = "hello"', 'text')).toBe('string')
    expect(inferJavascriptMemberKind('function f(count: number) {}', 'count')).toBe('number')
  })

  it('returns null when the type is unknown', () => {
    expect(inferJavascriptMemberKind('const result = compute()', 'result')).toBeNull()
    expect(inferJavascriptMemberKind('const value = new Widget()', 'value')).toBeNull()
  })

  it('infers Python member kinds from literals and annotations', () => {
    expect(inferPythonMemberKind('counts = {}', 'counts')).toBe('map')
    expect(inferPythonMemberKind('names = []', 'names')).toBe('array')
    expect(inferPythonMemberKind('seen = set()', 'seen')).toBe('set')
    expect(inferPythonMemberKind('label = "hello"', 'label')).toBe('string')
    expect(inferPythonMemberKind('def f(items: list[int]): pass', 'items')).toBe('array')
  })
})
