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
Input: nums = [2, 5, 8, 12, 17, 21], target = 17
Output: 4
```

**Example 2**

```
Input: nums = [2, 5, 8, 12, 17, 21], target = 6
Output: -1
```

**Example 3**

```
Input: nums = [4], target = 4
Output: 0
```

**Example 4**

```
Input: nums = [1, 3, 5, 7], target = 1
Output: 0
```

**Example 5**

```
Input: nums = [2, 4, 6, 8, 10], target = 10
Output: 4
```

## Constraints

- `0 <= nums.length <= 100,000`
- `-1,000,000,000 <= nums[i], target <= 1,000,000,000`
- All values in `nums` are distinct and sorted ascending.

## Follow-up

How would you find the first index where a value could be inserted while keeping the list sorted?
