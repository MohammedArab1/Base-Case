# Explanation

## Key insight

A rotated sorted list is made of at most two sorted runs. At any midpoint, at least one side is fully sorted, and the target's value range tells us whether it belongs there.

## Algorithm

1. Search with inclusive bounds `low` and `high`.
2. If the left side is sorted, check whether the target lies in its range.
3. Otherwise the right side is sorted; check the target against its range.
4. Move to the half that can contain the target.
5. Return `-1` if the range empties.

## Correctness

The sorted half contains a contiguous range of values. If the target lies in that range, it cannot be in the other half; if it does not, it cannot be in the sorted half. Each step discards a half that cannot contain the target, so the remaining range always contains the answer if one exists.

## Complexity

- Time: `O(log n)`.
- Space: `O(1)`.

## Common mistakes

- Comparing values without first identifying the sorted half.
- Using strict or non-strict inequalities inconsistently at the boundaries.
- Forgetting that the list may already be sorted, so the rotation can be zero.

## Related pattern

Binary search variants also find the minimum in a rotated list.
