# Explanation

## Key insight

A rotated sorted list has two sorted runs. The minimum is the first value of the second run. Comparing the middle value with the rightmost value tells you which side contains that boundary.

## Why scanning is too slow

A linear scan takes `O(n)` time. The list is still mostly sorted, so we can discard half of the remaining candidates at each step and finish in `O(log n)`.

## Algorithm

1. Set `left = 0` and `right = nums.length - 1`.
2. While `left < right`:
   - Compute `mid = (left + right) // 2`.
   - If `nums[mid] > nums[right]`, the minimum is strictly to the right of `mid`, so set `left = mid + 1`.
   - Otherwise, the minimum is at `mid` or to its left, so set `right = mid`.
3. Return `nums[left]`.

## Correctness

If `nums[mid] > nums[right]`, the subarray from `mid` to `right` is not sorted in ascending order, so the rotation point lies after `mid`. If `nums[mid] <= nums[right]`, the right half is sorted, so the minimum cannot be strictly to the right of `mid`. Each step keeps the minimum inside the remaining range, and the range shrinks by at least one element. When `left == right`, that index must hold the minimum.

## Complexity

- Time: `O(log n)`, because the range is halved on each step.
- Space: `O(1)`.

## Common mistakes

- Comparing `nums[mid]` with `nums[left]`; this does not identify the unsorted half as reliably.
- Setting `right = mid - 1` when `nums[mid] <= nums[right]`, which can discard the minimum.
- Forgetting the already-sorted case, where the minimum is the first element.
