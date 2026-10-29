# Explanation

## Key insight

Each index has two states: it was chosen, or it was skipped. If you choose the current value, the previous index must have been skipped. If you skip the current value, the previous index could have been either chosen or skipped.

## Why greedy fails

A greedy rule that always takes a value larger than its neighbors can still miss a better combination. For example, in `[0, 4, 0, 4]`, taking both `4`s gives `8`, which is better than taking only one of them.

## Algorithm

1. Initialize `take = 0` and `skip = 0`.
2. For each value:
   - `nextTake = skip + value`.
   - `nextSkip = max(skip, take)`.
   - Update `take` and `skip`.
3. Return `max(take, skip)`.

## Correctness

After processing a prefix, `take` is the best sum for that prefix with the last index chosen, and `skip` is the best sum with the last index skipped. To choose the current value, the previous index must be skipped, so the best sum is `skip + value`. To skip the current value, either previous state is allowed, so the best is `max(skip, take)`. These are the only two possibilities, so the recurrence is complete. Taking the maximum of the final states gives the best sum for the whole list.

## Complexity

- Time: `O(n)`, because each value is processed once.
- Space: `O(1)`, because only two sums are stored.

## Common mistakes

- Only considering starting at index `0`; the best subset may start at index `1`.
- Using a greedy rule based on local comparisons.
- Forgetting that skipping a value does not require taking the next one.
