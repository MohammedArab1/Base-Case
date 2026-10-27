# Merge Window

You are given a list of non-overlapping intervals sorted by start time. A new interval should be inserted, merging any intervals that overlap or touch it.

Intervals are inclusive, represented as `[start, end]`. Two intervals that share an endpoint overlap for this problem.

Return the resulting list of non-overlapping intervals, sorted by start time.

## Input

- `intervals`: sorted, non-overlapping intervals.
- `incoming`: a single interval to insert.

## Output

The merged, sorted intervals.

## Examples

**Example 1**

```
Input: intervals = [[1,3],[6,9]], incoming = [2,5]
Output: [[1,5],[6,9]]
```

**Example 2**

```
Input: intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], incoming = [4,8]
Output: [[1,2],[3,10],[12,16]]
```

**Example 3**

```
Input: intervals = [], incoming = [5,7]
Output: [[5,7]]
```

## Constraints

- `0 <= intervals.length <= 100,000`
- `incoming.length == 2`
- For each interval, `0 <= start <= end <= 1,000,000,000`.
- `intervals` is sorted by start and has no overlaps.

## Follow-up

Can you do it in one pass without copying unchanged intervals more than once?
