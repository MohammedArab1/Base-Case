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
Input: nums = [9, 4, 7, 1, 6, 3], k = 3
Output: 6
```

Sorted descending: `[9, 7, 6, 4, 3, 1]`.

**Example 2**

```
Input: nums = [8, 8, 5, 5, 5, 2], k = 4
Output: 5
```

Duplicate values occupy separate positions.

**Example 3**

```
Input: nums = [-4, -9, -2], k = 2
Output: -4
```

Sorted descending: `[-2, -4, -9]`.

**Example 4**

```
Input: nums = [42], k = 1
Output: 42
```

**Example 5**

```
Input: nums = [12, 15, 10, 18, 20], k = 5
Output: 10
```

## Constraints

- `1 <= k <= nums.length <= 100,000`
- `-1,000,000,000 <= nums[i] <= 1,000,000,000`

## Follow-up

How would you answer the same question when the values arrive as a stream?
