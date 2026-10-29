# Rotation Minimum

A list of distinct integers was sorted in ascending order, then rotated some number of positions. For example, `[11, 14, 17, 20]` rotated two positions becomes `[17, 20, 11, 14]`.

Given the rotated list, return its minimum value. The list may also be rotated zero positions, in which case it is still sorted.

## Input

- `nums`: a non-empty list of distinct integers, sorted and then rotated.

## Output

The minimum value in `nums`.

## Examples

**Example 1**

```
Input: nums = [8, 10, 13, 2, 5]
Output: 2
```

**Example 2**

```
Input: nums = [21, 24, 27, 30]
Output: 21
```

The list was not rotated.

**Example 3**

```
Input: nums = [14, 18, 1, 4, 9]
Output: 1
```

**Example 4**

```
Input: nums = [6, 9, 12, 3]
Output: 3
```

**Example 5**

```
Input: nums = [17]
Output: 17
```

## Constraints

- `1 <= nums.length <= 100,000`
- `-1,000,000,000 <= nums[i] <= 1,000,000,000`
- All values in `nums` are distinct.
- `nums` is sorted ascending and then rotated between `0` and `nums.length - 1` times.

## Follow-up

What changes if the list can contain duplicate values?
