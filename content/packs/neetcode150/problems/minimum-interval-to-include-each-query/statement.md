# Smallest Covering Span

A delivery service has closed intervals `[start, end]`. A query point `x` is covered by an interval when `start <= x <= end`.

For each query, report the length of the shortest interval covering it, where the length of `[start, end]` is `end - start + 1`. If no interval covers the query, report `-1` instead.

## Input

- `intervals`: available closed intervals.
- `queries`: the points to cover.

## Output

An array with one answer per query, in the same order as `queries`. Each answer is the smallest covering interval length, or `-1` when no interval covers that point.

## Notes

- The output order is canonical and follows the original query order, not sorted order.
- Interval length counts both endpoints, so `[3, 3]` has length `1`.

## Examples

**Example 1**

```
Input: intervals = [[1, 4], [2, 3], [5, 8]], queries = [2, 3, 6, 9]
Output: [2, 2, 4, -1]
```

**Example 2**

```
Input: intervals = [[3, 3], [1, 10]], queries = [3, 10, 0]
Output: [1, 10, -1]
```

**Example 3**

```
Input: intervals = [], queries = [1, 5]
Output: [-1, -1]
```

**Example 4**

```
Input: intervals = [[1, 2], [2, 3], [3, 4]], queries = [1, 2, 3, 4]
Output: [2, 2, 2, 2]
```

## Constraints

- `0 <= intervals.length <= 100,000`
- `1 <= queries.length <= 100,000`
- `-1,000,000,000 <= start <= end <= 1,000,000,000`
- `-1,000,000,000 <= queries[i] <= 1,000,000,000`

## Follow-up

How would you answer queries online if they arrive one at a time and cannot be reordered?
