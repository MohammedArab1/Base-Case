# Explanation

## Key insight

Binary addition works exactly like decimal column addition, with a carry of at most one because the largest column sum is `1 + 1 + 1 = 3`.

## Algorithm

1. Start at the last character of both strings.
2. Add the two available bits and the carry.
3. Append `total % 2` and set the new carry to `total // 2`.
4. Continue until both strings and the carry are exhausted.
5. Reverse the appended bits.

## Correctness

Each iteration computes exactly one output bit from the corresponding input bits and the incoming carry. The carry passed forward is the overflow into the next column. Processing every column and the final carry therefore produces the standard binary sum.

## Complexity

- Time: `O(n + m)`.
- Space: `O(n + m)` for the output.

## Common mistakes

- Forgetting the final carry.
- Reversing the strings but forgetting to reverse the result.
- Converting enormous strings to fixed-width numbers and overflowing.

## Related pattern

The same column algorithm adds decimal strings and linked-list digits.
