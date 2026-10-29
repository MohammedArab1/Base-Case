# Best Stretch

Find the largest sum of a non-empty contiguous stretch of `nums`.

## Input

- `nums`: a non-empty list of integers.

## Output

The maximum possible sum of any contiguous subarray.

## Examples

**Example 1**

```
Input: nums = [4, -2, 9, -7, 3, -1, 6]
Output: 12
```

**Example 2**

```
Input: nums = [8, -9, 2, -1, 4, -3, 5]
Output: 8
```

**Example 3**

```
Input: nums = [-6, -2, -9, -4]
Output: -2
```

Every value is negative, so the best stretch is the single largest value.

**Example 4**

```
Input: nums = [1, 2, 3, 4]
Output: 10
```

**Example 5**

```
Input: nums = [0]
Output: 0
```

## Constraints

- `1 <= nums.length <= 100,000`
- `-1,000,000,000 <= nums[i] <= 1,000,000,000`

## Follow-up

Can you handle the case where the stretch may be empty, returning `0` for an all-negative list?
