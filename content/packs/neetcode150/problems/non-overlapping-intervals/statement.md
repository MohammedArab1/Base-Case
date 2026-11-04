# Interval Cleanup

A calendar holds closed intervals `[start, end]`. Two intervals conflict when they share more than a single endpoint, so `[1, 3]` and `[3, 5]` can both remain.

Remove the fewest intervals so that no two remaining intervals conflict. Return the minimum number of intervals that must be removed.

## Input

- `intervals`: each entry is `[start, end]` with `start <= end`.

## Output

The minimum number of intervals to delete so the remaining intervals are pairwise non-conflicting.

## Notes

- Touching only at an endpoint is allowed: `[1, 3]` and `[3, 5]` do not conflict.
- The input may be empty, in which case no removal is needed.

## Examples

**Example 1**

```
Input: intervals = [[2, 5], [1, 3], [3, 6], [7, 9]]
Output: 1
```

**Example 2**

```
Input: intervals = [[1, 10], [2, 3], [4, 5], [6, 7]]
Output: 1
```

**Example 3**

```
Input: intervals = [[5, 6], [1, 2], [3, 4]]
Output: 0
```

**Example 4**

```
Input: intervals = []
Output: 0
```

## Constraints

- `0 <= intervals.length <= 100,000`
- `-1,000,000,000 <= start <= end <= 1,000,000,000`

## Follow-up

What if intervals are half-open and touching at an endpoint should count as a conflict?
