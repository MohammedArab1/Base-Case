# Best Stretch

Find the largest sum of a non-empty contiguous stretch of `nums`.

## Input

- `nums`: a non-empty list of integers.

## Output

The maximum possible sum of any contiguous subarray.

## Examples

**Example 1**

```
Input: nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
Output: 6
```

The stretch `[4, -1, 2, 1]` sums to `6`.

**Example 2**

```
Input: nums = [1]
Output: 1
```

**Example 3**

```
Input: nums = [-3, -2, -5]
Output: -2
```

Every value is negative, so the best stretch is the single largest value.

## Constraints

- `1 <= nums.length <= 100,000`
- `-1,000,000,000 <= nums[i] <= 1,000,000,000`

## Follow-up

Can you handle the case where the stretch may be empty, returning `0` for an all-negative list?
