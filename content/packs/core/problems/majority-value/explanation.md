# Explanation

## Key insight

Think of repeatedly removing pairs of different values. The majority value cannot be completely removed because it occurs more than all other values combined.

## Algorithm

1. Start with the first value as a candidate and count zero.
2. For each value, reset the candidate when the count is zero.
3. Increment for a match, decrement for a mismatch.
4. Return the final candidate.

## Correctness

The count represents an unmatched group of identical values. A different value cancels one member. Since the majority value appears more than half the time, it must remain after all cancellations and become the final candidate. The guarantee that a majority exists makes a second verification pass unnecessary.

## Complexity

- Time: `O(n)`.
- Space: `O(1)`.

## Common mistakes

- Assuming the mode of the list is always the majority.
- Forgetting to reset the candidate when the count is zero.
- Requiring a second pass when the problem already guarantees existence.

## Related pattern

Boyer-Moore voting is useful for finding candidates in streaming data.
