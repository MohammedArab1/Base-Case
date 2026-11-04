# Top K Frequent Values

Given an integer list `nums` and an integer `k`, return the `k` distinct values that occur most often.

Use this deterministic rule:

1. Rank the distinct values by decreasing occurrence count.
2. Break equal counts by choosing the smaller numeric value first.
3. Return the selected values sorted in ascending numeric order.

The third step means the answer is always ascending, even though the ranking is by frequency.

## Input

- `nums`: a non-empty list of integers.
- `k`: the number of distinct values to return.

## Output

A list of exactly `k` selected values in ascending order.

## Examples

**Example 1**

```
Input: nums = [4, 4, 4, 9, 9, 2, 7, 7, 7], k = 2
Output: [4, 7]
```

`4` and `7` each occur three times, more than any other value.

**Example 2**

```
Input: nums = [-1, -1, -2, -2, -2, 3], k = 1
Output: [-2]
```

`-2` occurs three times.

**Example 3**

```
Input: nums = [5, 5, 6, 6, 7, 7], k = 2
Output: [5, 6]
```

All three values occur twice, so the two smaller values are selected.

**Example 4**

```
Input: nums = [10], k = 1
Output: [10]
```

## Constraints

- `1 <= nums.length <= 100,000`
- `-1,000,000,000 <= nums[i] <= 1,000,000,000`
- `1 <= k <= d`, where `d` is the number of distinct values in `nums`

## Follow-up

Can you avoid sorting all distinct values when `k` is much smaller than the number of distinct values?
