# Unique Subsets from a Multiset

Given a list of integers that may contain repeated values, return every distinct subset of the list. Two subsets are identical when they contain the same multiset of values, regardless of which equal positions were chosen.

Use this canonical representation so the answer is unambiguous:

1. Sort the values inside each subset in nondecreasing order.
2. Sort the list of subsets lexicographically. Compare lists element by element; if one list is a prefix of another, the shorter list comes first.

## Input

- `nums`: a list of integers, possibly with duplicates.

## Output

All distinct subsets in the canonical order.

## Examples

**Example 1**

```
Input: nums = [1, 2]
Output: [[], [1], [1, 2], [2]]
```

**Example 2**

```
Input: nums = [1, 1]
Output: [[], [1], [1, 1]]
```

**Example 3**

```
Input: nums = [0]
Output: [[], [0]]
```

## Constraints

- `0 <= nums.length <= 12`
- `-10 <= nums[i] <= 10`

## Notes

The empty subset is always included, even when `nums` is empty.
