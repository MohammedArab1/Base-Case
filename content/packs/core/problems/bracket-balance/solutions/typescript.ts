class Solution {
  isBalanced(text: string): boolean {
    const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' }
    const stack: string[] = []

    for (const char of text) {
      if (char === '(' || char === '[' || char === '{') {
        stack.push(char)
      } else if (char in pairs) {
        if (stack.length === 0 || stack.pop() !== pairs[char]) {
          return false
        }
      }
    }

    return stack.length === 0
  }
}

export { Solution }
