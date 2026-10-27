# Explanation

## Key insight

Sorting turns the search for two remaining values into a two-pointer scan. Duplicate skipping then replaces a costly set of triplets.

## Algorithm

1. Sort `nums`.
2. For each index `i`, stop at `n - 3`.
3. Skip repeated values at `i`.
4. Set `left = i + 1` and `right = n - 1`.
5. Move the appropriate pointer based on the triplet sum.
6. On a zero sum, record the triplet, move both pointers, and skip repeated values.

## Correctness

For each fixed `i`, the two pointers examine all pairs that could complete a zero sum: increasing the left value raises the sum, and decreasing the right value lowers it. Skipping duplicates removes only equivalent triplets. Every recorded triplet is therefore valid and unique, and every valid triplet is found.

## Complexity

- Time: `O(n^2)`.
- Space: `O(1)` aside from the output and the sort's internal storage.

## Common mistakes

- Using the same index twice.
- Forgetting to skip duplicates at all three positions.
- Returning triplets in inconsistent order, making comparison ambiguous.

## Related pattern

A sorted two-pointer scan also solves pair-sum and closest-triplet problems.
