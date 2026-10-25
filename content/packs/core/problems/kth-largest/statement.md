# Kth Largest

Given a list of integers `nums` and an integer `k`, return the `k`-th largest value in the list.

Duplicates count as separate positions. For example, in `[7, 7, 6]`, the second largest value is `7`, not `6`.

## Input

- `nums`: a non-empty list of integers.
- `k`: an integer between `1` and `nums.length`.

## Output

The `k`-th largest value in `nums`.

## Examples

**Example 1**

```
Input: nums = [3, 2, 1, 5, 6, 4], k = 2
Output: 5
```

Sorted descending: `[6, 5, 4, 3, 2, 1]`. The second value is `5`.

**Example 2**

```
Input: nums = [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4
Output: 4
```

Sorted descending: `[6, 5, 5, 4, 3, 3, 2, 2, 1]`.

**Example 3**

```
Input: nums = [1], k = 1
Output: 1
```

**Example 4**

```
Input: nums = [-1, -2, -3], k = 2
Output: -2
```

Sorted descending: `[-1, -2, -3]`.

**Example 5**

```
Input: nums = [7, 6, 5, 4, 3, 2, 1], k = 7
Output: 1
```

## Constraints

- `1 <= k <= nums.length <= 100,000`
- `-1,000,000,000 <= nums[i] <= 1,000,000,000`

## Follow-up

How would you answer the same question when the values arrive as a stream?
