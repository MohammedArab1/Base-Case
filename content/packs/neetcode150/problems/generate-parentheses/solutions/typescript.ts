class Solution {
  generateParentheses(n: number): string[] {
    const result: string[] = []
    const path: string[] = []

    const build = (opened: number, closed: number): void => {
      if (path.length === 2 * n) {
        result.push(path.join(''))
        return
      }

      if (opened < n) {
        path.push('(')
        build(opened + 1, closed)
        path.pop()
      }

      if (closed < opened) {
        path.push(')')
        build(opened, closed + 1)
        path.pop()
      }
    }

    build(0, 0)
    result.sort()
    return result
  }
}

export { Solution }
