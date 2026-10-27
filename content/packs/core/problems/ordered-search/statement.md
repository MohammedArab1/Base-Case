# Ordered Search

A list of distinct integers is sorted in ascending order. Find the index of `target`, or return `-1` when it is absent.

## Input

- `nums`: a strictly increasing list of integers.
- `target`: the value to locate.

## Output

The zero-based index of `target`, or `-1`.

## Examples

**Example 1**

```
Input: nums = [-1, 0, 3, 5, 9, 12], target = 9
Output: 4
```

**Example 2**

```
Input: nums = [-1, 0, 3, 5, 9, 12], target = 2
Output: -1
```

**Example 3**

```
Input: nums = [5], target = 5
Output: 0
```

## Constraints

- `0 <= nums.length <= 100,000`
- `-1,000,000,000 <= nums[i], target <= 1,000,000,000`
- All values in `nums` are distinct and sorted ascending.

## Follow-up

How would you find the first index where a value could be inserted while keeping the list sorted?
