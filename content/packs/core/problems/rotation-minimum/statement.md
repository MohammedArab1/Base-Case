# Rotation Minimum

A list of distinct integers was sorted in ascending order, then rotated some number of positions. For example, `[1, 3, 5, 7]` rotated three positions becomes `[3, 5, 7, 1]`.

Given the rotated list, return its minimum value. The list may also be rotated zero positions, in which case it is still sorted.

## Input

- `nums`: a non-empty list of distinct integers, sorted and then rotated.

## Output

The minimum value in `nums`.

## Examples

**Example 1**

```
Input: nums = [3, 4, 5, 1, 2]
Output: 1
```

**Example 2**

```
Input: nums = [4, 5, 6, 7, 0, 1, 2]
Output: 0
```

**Example 3**

```
Input: nums = [11, 13, 15, 17]
Output: 11
```

The list was not rotated.

**Example 4**

```
Input: nums = [2, 1]
Output: 1
```

**Example 5**

```
Input: nums = [1]
Output: 1
```

## Constraints

- `1 <= nums.length <= 100,000`
- `-1,000,000,000 <= nums[i] <= 1,000,000,000`
- All values in `nums` are distinct.
- `nums` is sorted ascending and then rotated between `0` and `nums.length - 1` times.

## Follow-up

What changes if the list can contain duplicate values?
