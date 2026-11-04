# Explanation

## Approach

Sort the input and explore subsets with depth-first backtracking. Each call records the current path as a subset, then tries each later index as the next chosen value.

The duplicate guard runs at a single recursion level. If the current value equals the previous value and that previous occurrence was not chosen at this level, choosing the current one would generate the same multiset as the earlier branch. Skipping it removes duplicates while still allowing equal values to be chosen at different depths.

## Correctness

Sorting makes each generated path nondecreasing, matching the required internal order. The recursion considers every index-based subset. For any distinct multiset, there is at least one index choice that generates it, and the duplicate guard skips only choices that repeat a multiset already generated at the same level. Thus every distinct subset is produced exactly once. Recording a copy of the path on each call includes the empty subset. The depth-first order over sorted values is lexicographic, so the outer order is canonical too.

## Complexity

- Time: `O(n * 2^n)` in the worst case, including copying subsets into the result.
- Space: `O(n)` recursion and path space, plus the output.

## Common mistakes

- Skipping duplicates at every depth rather than only within one level.
- Omitting the empty subset.
- Adding the mutable path directly instead of a copy.
- Forgetting to sort the input.
