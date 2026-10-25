class Solution {
  daysUntilWarmer(temperatures: number[]): number[] {
    const answer = new Array<number>(temperatures.length).fill(0)
    const stack: number[] = []

    for (let index = 0; index < temperatures.length; index += 1) {
      while (stack.length > 0 && temperatures[index] > temperatures[stack[stack.length - 1]]) {
        const earlier = stack.pop() as number
        answer[earlier] = index - earlier
      }

      stack.push(index)
    }

    return answer
  }
}

export { Solution }
