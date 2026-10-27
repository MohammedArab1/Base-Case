class Solution {
  evalRPN(tokens: string[]): number {
    const stack: number[] = []

    for (const token of tokens) {
      if (token === '+' || token === '-' || token === '*' || token === '/') {
        const right = stack.pop() as number
        const left = stack.pop() as number

        if (token === '+') {
          stack.push(left + right)
        } else if (token === '-') {
          stack.push(left - right)
        } else if (token === '*') {
          stack.push(left * right)
        } else {
          stack.push(Math.trunc(left / right))
        }
      } else {
        stack.push(Number(token))
      }
    }

    return stack[stack.length - 1]
  }
}

export { Solution }
