class Solution {
  partitionLengths(text: string): number[] {
    const last = new Map<string, number>()

    for (let index = 0; index < text.length; index += 1) {
      last.set(text[index], index)
    }

    const result: number[] = []
    let start = 0
    let end = 0

    for (let index = 0; index < text.length; index += 1) {
      end = Math.max(end, last.get(text[index]) ?? index)

      if (index === end) {
        result.push(end - start + 1)
        start = index + 1
      }
    }

    return result
  }
}

export { Solution }
