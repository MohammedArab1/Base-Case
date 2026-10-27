class Solution {
  calculate(expression: string): number {
    let total = 0
    let number = 0
    let sign = 1
    const stack: number[] = []

    for (const character of expression) {
      if (character >= '0' && character <= '9') {
        number = number * 10 + Number(character)
      } else if (character === '+' || character === '-') {
        total += sign * number
        number = 0
        sign = character === '+' ? 1 : -1
      } else if (character === '(') {
        stack.push(total)
        stack.push(sign)
        total = 0
        sign = 1
        number = 0
      } else if (character === ')') {
        total += sign * number
        number = 0
        total *= stack.pop() as number
        total += stack.pop() as number
      }
    }

    return total + sign * number
  }
}

export { Solution }
