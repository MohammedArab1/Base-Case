# Explanation

## Key insight

The expression is a sum of signed terms. Parentheses only require saving the outer total and the sign that precedes the group.

## Algorithm

1. Scan characters left to right.
2. Build multi-digit numbers.
3. On `+` or `-`, add the completed signed term to the total and update the sign.
4. On `(`, push the outer total and sign, then reset the inner state.
5. On `)`, complete the inner term, apply the saved sign, and add the saved total.
6. Add the final term after the scan.

## Correctness

Between operators, the scanner builds exactly one term. Each operator commits the previous term with the correct sign, so the running total is the value of the processed prefix. Parentheses push a complete outer state and restore it after evaluating the group, which is equivalent to substituting the group's value. Thus the final total is the expression's value.

## Complexity

- Time: `O(n)`.
- Space: `O(n)` for nested parentheses.

## Common mistakes

- Forgetting to add the final number after the loop.
- Treating a unary minus as a binary operator with a missing left operand.
- Losing the outer sign when closing parentheses.
- Building numbers one character at a time without the decimal shift.

## Related pattern

The same state stack evaluates nested expressions with precedence.
