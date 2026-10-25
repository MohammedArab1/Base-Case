# Explanation

## Key insight

Brackets nest, so the most recently opened bracket must be the next one closed. That is a last-in, first-out rule, which is exactly what a stack provides.

## Why a simple counter is not enough

Counting opening and closing brackets can tell you whether the totals match, but it cannot tell you whether the brackets are nested correctly. For example, `([)]` has two of each type, yet it is invalid because the pairs overlap.

## Algorithm

1. Create an empty stack.
2. For each character:
   - If it is an opening bracket, push it.
   - If it is a closing bracket, pop the stack. If the stack was empty, or the popped bracket is the wrong type, return `false`.
3. After the loop, return `true` only when the stack is empty.

## Correctness

Every closing bracket is checked against the most recent unmatched opener. If the types match, that opener is correctly closed and can be removed. If any check fails, the string cannot be balanced because either a closer has no opener or the nesting order is wrong. At the end, any remaining opener is unmatched. Therefore the algorithm returns `true` exactly for balanced strings.

## Complexity

- Time: `O(n)`, because each character is pushed or popped at most once.
- Space: `O(n)` in the worst case, when every character is an opening bracket.

## Common mistakes

- Popping from an empty stack when the string starts with a closing bracket.
- Forgetting the final emptiness check, which accepts strings such as `"(()"`.
- Comparing only the number of brackets instead of their order.
