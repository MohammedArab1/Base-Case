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
Input: intervals = [[2,4],[7,9],[12,14]], incoming = [3,8]
Output: [[2,9],[12,14]]
```

**Example 2**

```
Input: intervals = [[1,2],[5,6]], incoming = [3,4]
Output: [[1,2],[3,4],[5,6]]
```

**Example 3**

```
Input: intervals = [], incoming = [6,8]
Output: [[6,8]]
```

**Example 4**

```
Input: intervals = [[0,1],[10,12]], incoming = [1,10]
Output: [[0,12]]
```

The incoming interval touches both neighbors.

**Example 5**

```
Input: intervals = [[5,5],[8,8]], incoming = [6,7]
Output: [[5,5],[6,7],[8,8]]
```

## Constraints

- `0 <= intervals.length <= 100,000`
- `incoming.length == 2`
- For each interval, `0 <= start <= end <= 1,000,000,000`.
- `intervals` is sorted by start and has no overlaps.

## Follow-up

Can you do it in one pass without copying unchanged intervals more than once?
