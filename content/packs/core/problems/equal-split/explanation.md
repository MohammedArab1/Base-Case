# Explanation

## Key insight

Two equal-sum groups are equivalent to one subset summing to half of the total. The other group is automatically the complement.

## Algorithm

1. Return `false` if the total is odd.
2. Set `target = total / 2`.
3. Mark sum zero reachable.
4. For each value, update reachable sums from `target` downward.
5. Return whether `target` is reachable.

## Correctness

Before processing each value, `reachable[s]` records whether a subset of the processed values sums to `s`. Updating downward prevents using the current value more than once. The transition adds either no copy or one copy of the value, so every subset is represented. Thus `reachable[target]` is true exactly when a valid split exists.

## Complexity

- Time: `O(n * target)`.
- Space: `O(target)`.

## Common mistakes

- Iterating sums upward, which allows unlimited reuse.
- Forgetting the odd-total shortcut.
- Returning true for a single value.

## Related pattern

This is the subset-sum special case of 0/1 knapsack.
