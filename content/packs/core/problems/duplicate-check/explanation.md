# Explanation

## Key insight

The problem only asks whether a repeat exists, so remembering the set of values seen so far is sufficient.

## Algorithm

1. Create an empty set.
2. Scan values from left to right.
3. If the current value is already in the set, return `true`.
4. Otherwise add it.
5. Return `false` after the scan.

## Correctness

If a duplicate exists, the second occurrence is encountered after the first and triggers `true`. If the scan completes without a trigger, every value was distinct when inserted, so no duplicate exists.

## Complexity

- Time: `O(n)` expected.
- Space: `O(n)`.

## Common mistakes

- Comparing each pair, which is quadratic.
- Returning `true` only when adjacent values match without sorting.
- Forgetting the empty and single-element cases.

## Related pattern

The same membership set detects cycles in sequences.
