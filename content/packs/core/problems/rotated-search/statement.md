# Rotated Search

A list of distinct integers was sorted in ascending order and then rotated at an unknown pivot. For example, `[0,1,2,4,5,6,7]` might become `[4,5,6,7,0,1,2]`.

Find the index of `target` in the rotated list, or return `-1` if it is absent.

## Input

- `nums`: a rotated sorted list of distinct integers.
- `target`: the value to find.

## Output

The zero-based index of `target`, or `-1`.

## Examples

**Example 1**

```
Input: nums = [4,5,6,7,0,1,2], target = 0
Output: 4
```

**Example 2**

```
Input: nums = [4,5,6,7,0,1,2], target = 3
Output: -1
```

**Example 3**

```
Input: nums = [1], target = 1
Output: 0
```

## Constraints

- `0 <= nums.length <= 100,000`
- `-1,000,000,000 <= nums[i], target <= 1,000,000,000`
- All values in `nums` are distinct.

## Follow-up

Why can the search still discard half of the remaining range even though the whole list is not sorted?
