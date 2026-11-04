# Explanation

## Key insight

The median is determined by how the merged array splits into a lower half and an upper half. We do not need to build the merge; we only need to choose a split in each sorted array so that the lower half contains the correct number of values and every lower-half value is at most every upper-half value.

## Algorithm

1. Ensure `nums1` is the shorter array. Let `m` and `n` be the lengths.
2. Let `half = (m + n + 1) // 2`, the number of values that belong on the lower side.
3. Binary search a split position `i` in `nums1` from `0` to `m`. The corresponding split in `nums2` is `j = half - i`.
4. Define `left1`, `right1`, `left2`, and `right2`, using negative infinity for a missing left boundary and positive infinity for a missing right boundary.
5. If `left1 <= right2` and `left2 <= right1`, the split is valid. For an odd total, return the larger of the two left boundary values. For an even total, return the average of the larger left boundary and the smaller right boundary.
6. If `left1 > right2`, the split in `nums1` is too far right, so decrease `i`. Otherwise increase `i`.

## Correctness

The chosen `half` makes the left side contain exactly the lower half of the merged values, with the extra value on the left when the total is odd. The two boundary inequalities say that no left value exceeds a right value across the split. Therefore the left side is exactly the smallest `half` values and the right side is exactly the remaining values. The median is then the largest left value for an odd total, or the average of the largest left and smallest right values for an even total. The binary search is guaranteed to find such a split because the arrays are sorted.

## Complexity

- Time: `O(log(min(m, n)))`, because binary search runs over the shorter array.
- Space: `O(1)` extra space.

## Common mistakes

- Forgetting to swap the arrays so the search runs over the shorter one.
- Using `(m + n) // 2` instead of `(m + n + 1) // 2` for the lower-half size.
- Mishandling an empty array or a split at position `0` or at the end.
- Returning the average for an odd total, or an integer division for an even total.
- Comparing the wrong boundary pair when deciding how to move the split.
