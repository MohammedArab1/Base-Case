# Meeting Overlap

A person has a list of meeting intervals. Each interval is `[start, end)`, so one meeting may end exactly when another begins.

Return whether the person can attend every meeting without overlaps.

## Input

- `intervals`: meeting intervals, not necessarily sorted.

## Output

`true` if no two meetings overlap, otherwise `false`.

## Examples

**Example 1**

```
Input: intervals = [[2,5],[7,9],[10,12]]
Output: true
```

**Example 2**

```
Input: intervals = [[1,6],[5,8]]
Output: false
```

**Example 3**

```
Input: intervals = [[0,1],[1,2],[2,3]]
Output: true
```

Touching meetings do not overlap.

**Example 4**

```
Input: intervals = []
Output: true
```

No meetings means no conflicts.

**Example 5**

```
Input: intervals = [[8,10],[2,4],[4,6]]
Output: true
```

The input is unsorted, but the intervals can still be ordered without conflicts.

## Constraints

- `0 <= intervals.length <= 100,000`
- `-1,000,000,000 <= start < end <= 1,000,000,000`

## Follow-up

How would you count the maximum number of simultaneous meetings instead?
