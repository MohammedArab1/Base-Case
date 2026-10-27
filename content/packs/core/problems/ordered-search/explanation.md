# Explanation

## Key insight

Sorted order lets each comparison discard half of the remaining candidates. The loop must maintain a valid candidate interval.

## Algorithm

1. Set `low = 0` and `high = nums.length`.
2. While `low < high`, compute `middle = low + (high - low) // 2`.
3. Return `middle` if the value matches.
4. If the middle value is smaller than the target, set `low = middle + 1`; otherwise set `high = middle`.
5. Return `-1` when the interval is empty.

## Correctness

The invariant is that if the target exists, it lies in `[low, high)`. A comparison either finds it or discards the half that cannot contain it. The interval strictly shrinks, so the loop terminates. When it is empty, no candidate remains.

## Complexity

- Time: `O(log n)`.
- Space: `O(1)`.

## Common mistakes

- Using `(low + high) / 2` with a closed interval and looping forever.
- Returning `low` when the target is absent.
- Forgetting the empty array.
- Updating the wrong bound after the comparison.
