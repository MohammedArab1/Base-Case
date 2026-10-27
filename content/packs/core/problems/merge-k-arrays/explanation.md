# Explanation

## Key insight

Merging two sorted arrays is easy. Pairwise merging reduces the number of arrays by half each round, so every value is merged only logarithmically many times.

## Algorithm

1. Return `[]` when there are no arrays.
2. Merge adjacent pairs of arrays into a new list.
3. Repeat until one array remains.
4. Return that array.

## Correctness

Merging two sorted arrays produces a sorted array containing exactly their values. By induction, each round preserves the full multiset of values and keeps every result sorted. When one array remains, it contains all values in sorted order.

## Complexity

- Time: `O(N log k)`, where `N` is the total number of values and `k` is the number of arrays.
- Space: `O(N)` for merged output.

## Common mistakes

- Sorting every value from scratch, which is `O(N log N)` rather than `O(N log k)`.
- Losing values from empty arrays.
- Merging in a way that skips the tail of one array.

## Related pattern

A k-way heap merge solves the same problem in one pass over the heads.
