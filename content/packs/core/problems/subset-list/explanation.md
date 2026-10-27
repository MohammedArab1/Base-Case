# Explanation

## Key insight

Each subset is determined by choosing, for each value, whether to include it. Recording the current path at every recursion level captures all sizes.

## Algorithm

1. Sort `nums`.
2. Start with an empty path and append a copy to the result.
3. For each later value, include it, recurse, then remove it.
4. Sort the subsets by length and then lexicographically.

## Correctness

Every subset corresponds to one sequence of include/skip choices. The recursion tries both choices for every value, so every subset is generated. Sorting applies the required presentation order, and distinct input values ensure no duplicate subsets.

## Complexity

- Time: `O(n * 2^n)` including copying and sorting.
- Space: `O(n)` for the recursion path.

## Common mistakes

- Recording only complete selections, which omits smaller subsets.
- Starting every loop at zero, which generates duplicates in different orders.
- Forgetting the empty subset.

## Related pattern

The same include/skip recursion generates combination sums and power sets.
