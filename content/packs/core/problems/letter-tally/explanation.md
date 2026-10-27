# Explanation

## Key insight

Rearranging preserves exactly the multiset of letters. Comparing frequency tables is therefore necessary and sufficient.

## Algorithm

1. Return `false` immediately when the lengths differ.
2. Count each letter in `first`.
3. Scan `second`, decrementing the count for each letter.
4. If a count would become negative, a letter appears too often in `second`; return `false`.
5. If the scan completes, the tables match.

## Correctness

The counts start as the multiset of `first`. Each character of `second` consumes one matching unit. A negative count means `second` has more of that letter than `first`, and equal lengths ensure there cannot be a compensating shortage elsewhere. A complete scan therefore means the multisets are equal.

## Complexity

- Time: `O(n)`, scanning both strings.
- Space: `O(1)` for the 26-letter alphabet.

## Common mistakes

- Comparing sorted strings unnecessarily, which costs extra time or space.
- Forgetting the length check.
- Treating uppercase or spaces as significant when the input contract excludes them.
- Returning `true` when counts go negative.
