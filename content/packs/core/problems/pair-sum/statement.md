# Pair Sum

You are given a list of integers `nums` and an integer `target`. Return the indices of two **distinct** elements whose values add up to `target`.

Exactly one valid pair exists. Return the two indices in ascending order.

## Input

- `nums`: a list of integers.
- `target`: the required sum.

## Output

A list of two indices `[i, j]` with `i < j` and `nums[i] + nums[j] == target`.

## Examples

**Example 1**

```
Input: nums = [13, 4, 21, 9, 6], target = 15
Output: [3, 4]
```

Only `9 + 6` reaches `15`.

**Example 2**

```
Input: nums = [-8, 12, 5, 3, -2], target = -5
Output: [0, 3]
```

Negative values are allowed.

**Example 3**

```
Input: nums = [7, 7, 2, 11], target = 14
Output: [0, 1]
```

The two `7`s are different positions.

**Example 4**

```
Input: nums = [100, 250, 40, 210], target = 250
Output: [2, 3]
```

`40 + 210 = 250`.

**Example 5**

```
Input: nums = [8, 1], target = 9
Output: [0, 1]
```

## Constraints

- `2 <= nums.length <= 100,000`
- `-1,000,000,000 <= nums[i], target <= 1,000,000,000`
- Exactly one pair of distinct indices satisfies the condition.

## Follow-up

Can you do this in a single pass over the list?
