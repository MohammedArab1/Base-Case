# Explanation

## Key insight

A permutation is built by choosing an unused value at every level. Sorting the input makes the recursion visit choices in lexicographic order.

## Algorithm

1. Sort `nums`.
2. Recursively build a path of unused values.
3. When the path has `n` values, record a copy.
4. Mark, recurse, unmark, and continue with the next value.

## Correctness

At each depth, the recursion tries every value that has not already been used, so every ordering is generated exactly once. Because values are tried in sorted order at every level, the recorded permutations appear lexicographically.

## Complexity

- Time: `O(n * n!)` for generating all permutations.
- Space: `O(n)` for the recursion path and used flags.

## Common mistakes

- Forgetting to unmark a value after recursion.
- Sorting only the output instead of the choices, which can disturb generation order.
- Recording the path by reference and later mutating it.

## Related pattern

The same backtracking template generates subsets and combination sums.
