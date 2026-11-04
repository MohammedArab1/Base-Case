# Explanation

## Approach

Sort the candidates and backtrack with a start index and the remaining target. Choosing a candidate advances the next start past its index, enforcing at most one use per position. A remaining target of zero means the path is a valid combination.

At each recursion level, skip a candidate when it equals the value just before it. This removes duplicate combinations created by equal values. Since values are positive and sorted, break the loop once a candidate exceeds the remaining target.

## Correctness

Every path uses strictly increasing indices, so no input position is used twice. The remaining target decreases by exactly the values on the path, and it reaches zero precisely when the path sums to the target. The level-level duplicate guard removes only choices that recreate an earlier combination; equal values can still be chosen together at different depths. Thus each distinct combination appears once. Sorting the input makes paths nondecreasing, and depth-first exploration of sorted choices produces lexicographic order.

## Complexity

- Time: `O(n * 2^n)` in the worst case, including copying results.
- Space: `O(n)` recursion and path space, plus the output.

## Common mistakes

- Using the same input position more than once.
- Removing duplicates across all depths instead of within one level.
- Continuing after a value exceeds the remaining target.
- Returning `[[]]` when the target cannot be reached.
