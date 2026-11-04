# Target Sums from a Multiset

You are given a list of positive integers, possibly with repeated values, and a target sum. Build combinations that add to the target. Each position in the input may be used at most once in one combination, so a value appearing twice may appear at most twice.

Two combinations are the same when they contain the same multiset of values. Return each distinct combination once.

Use this canonical representation:

1. Sort the values inside each combination in nondecreasing order.
2. Sort the list of combinations lexicographically. If one list is a prefix of another, the shorter list comes first.

## Input

- `candidates`: a list of positive integers, possibly with duplicates.
- `target`: the required sum.

## Output

All distinct combinations that sum to `target`, in the canonical order.

## Examples

**Example 1**

```
Input: candidates = [9, 2, 2, 4, 6], target = 8
Output: [[2, 2, 4], [2, 6]]
```

**Example 2**

```
Input: candidates = [6, 2, 3, 3, 1], target = 6
Output: [[1, 2, 3], [3, 3], [6]]
```

**Example 3**

```
Input: candidates = [3, 4, 5], target = 2
Output: []
```

## Constraints

- `0 <= candidates.length <= 15`
- `1 <= candidates[i] <= 30`
- `1 <= target <= 30`

## Notes

If no combination reaches the target, return an empty list.
