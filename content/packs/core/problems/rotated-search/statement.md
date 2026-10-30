# Rotated Search

A list of distinct integers was sorted in ascending order and then possibly rotated at an unknown pivot. A rotation of zero is allowed, so the list may still be fully sorted. For example, `[0,1,3,5,8]` might become `[5,8,0,1,3]`.

Find the index of `target` in the list, or return `-1` if it is absent.

## Input

- `nums`: a rotated sorted list of distinct integers.
- `target`: the value to find.

## Output

The zero-based index of `target`, or `-1`.

## Examples

**Example 1**

```
Input: nums = [7,9,12,2,4,5], target = 12
Output: 2
```

**Example 2**

```
Input: nums = [7,9,12,2,4,5], target = 3
Output: -1
```

**Example 3**

```
Input: nums = [10,20,30,40], target = 40
Output: 3
```

The rotation is zero, so the list is already fully sorted.

**Example 4**

```
Input: nums = [5,1,3], target = 1
Output: 1
```

**Example 5**

```
Input: nums = [2], target = 2
Output: 0
```

## Constraints

- `0 <= nums.length <= 100,000`
- `-1,000,000,000 <= nums[i], target <= 1,000,000,000`
- All values in `nums` are distinct.

## Follow-up

Why can the search still discard half of the remaining range even though the whole list is not sorted?
