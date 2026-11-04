class Solution {
  minStack(operations: string[], arguments_: number[][]): number[] {
    const stack: Array<[number, number]> = []
    const results: number[] = []

    for (let index = 0; index < operations.length; index += 1) {
      const operation = operations[index]
      const payload = arguments_[index]

      if (operation === 'push') {
        const value = payload[0]
        const currentMin = stack.length === 0 ? value : Math.min(value, stack[stack.length - 1][1])
        stack.push([value, currentMin])
      } else if (operation === 'pop') {
        stack.pop()
        results.push(-1)
      } else if (operation === 'top') {
        results.push(stack[stack.length - 1][0])
      } else {
        results.push(stack[stack.length - 1][1])
      }
    }

    return results
  }
}

export { Solution }
