# Explanation

## Key insight

Postfix notation is designed for a stack: operands are pushed, and an operator consumes the two most recent operands.

## Algorithm

1. Scan tokens left to right.
2. Push numeric tokens as integers.
3. On an operator, pop `right`, then `left`.
4. Apply `left op right` and push the result.
5. Return the single remaining value.

## Correctness

The stack always contains the values of completely evaluated subexpressions, in order. When an operator appears, the two popped values are exactly the operands of that operator, with the second pop being the left operand. Replacing them with the result preserves the invariant. At the end, the stack holds the whole expression's value.

## Complexity

- Time: `O(n)`.
- Space: `O(n)` for the stack.

## Common mistakes

- Popping operands in the wrong order for subtraction or division.
- Using floating-point division instead of truncation toward zero.
- Treating a negative number as an operator.

## Related pattern

The same operand stack extends to infix expressions with parentheses.
