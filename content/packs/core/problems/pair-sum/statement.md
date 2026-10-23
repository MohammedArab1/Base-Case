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
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
```

`nums[0] + nums[1] = 2 + 7 = 9`.

**Example 2**

```
Input: nums = [3, 2, 4], target = 6
Output: [1, 2]
```

The value `3` appears once, so it cannot be paired with itself.

**Example 3**

```
Input: nums = [3, 3], target = 6
Output: [0, 1]
```

These are two distinct elements, so they may form a pair.

**Example 4**

```
Input: nums = [-1, 0, 1], target = 0
Output: [0, 2]
```

Negative numbers are allowed.

## Constraints

- `2 <= nums.length <= 100,000`
- `-1,000,000,000 <= nums[i], target <= 1,000,000,000`
- Exactly one pair of distinct indices satisfies the condition.

## Follow-up

Can you do this in a single pass over the list?
