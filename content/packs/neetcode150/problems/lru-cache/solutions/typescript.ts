class Solution {
  lruCache(capacity: number, operations: string[], keys: number[], values: number[]): number[] {
    const cache = new Map<number, number>()
    const answers: number[] = []

    for (let index = 0; index < operations.length; index += 1) {
      const key = keys[index]

      if (operations[index] === 'get') {
        if (!cache.has(key)) {
          answers.push(-1)
          continue
        }

        const value = cache.get(key) as number
        cache.delete(key)
        cache.set(key, value)
        answers.push(value)
        continue
      }

      if (cache.has(key)) {
        cache.delete(key)
      } else if (cache.size >= capacity) {
        const oldest = cache.keys().next().value
        if (oldest !== undefined) {
          cache.delete(oldest)
        }
      }

      cache.set(key, values[index])
    }

    return answers
  }
}

export { Solution }
