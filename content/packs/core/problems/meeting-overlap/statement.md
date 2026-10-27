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
Input: intervals = [[0,30],[5,10],[15,20]]
Output: false
```

The first meeting overlaps the other two.

**Example 2**

```
Input: intervals = [[7,10],[2,4]]
Output: true
```

**Example 3**

```
Input: intervals = []
Output: true
```

No meetings means no conflicts.

## Constraints

- `0 <= intervals.length <= 100,000`
- `-1,000,000,000 <= start < end <= 1,000,000,000`

## Follow-up

How would you count the maximum number of simultaneous meetings instead?
