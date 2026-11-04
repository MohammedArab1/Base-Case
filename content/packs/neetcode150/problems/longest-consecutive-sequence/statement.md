# Longest Consecutive Run

Given a list of integers, find the length of the longest run of consecutive integer values that all appear in the list. The values in a run do not have to be adjacent in the input, and duplicates do not create longer runs.

Return `0` for an empty list.

## Input

- `nums`: a list of integers. It may be empty.

## Output

The length of the longest consecutive run.

## Examples

**Example 1**

```
Input: nums = [7, 3, 1, 2, 8, 9, 10, 4]
Output: 4
```

The values `1, 2, 3, 4` form a run of length four, and `7, 8, 9, 10` also form a run of length four.

**Example 2**

```
Input: nums = [5, 5, 5]
Output: 1
```

All occurrences are the same value, so the longest run contains one distinct value.

**Example 3**

```
Input: nums = []
Output: 0
```

**Example 4**

```
Input: nums = [-3, -1, -2, 0, 1, 2]
Output: 6
```

Negative values participate like any other integers.

## Constraints

- `0 <= nums.length <= 100,000`
- `-1,000,000,000 <= nums[i] <= 1,000,000,000`

## Follow-up

Can you return the values of the longest run, not just its length, without making the algorithm slower?
