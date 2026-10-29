# Job Schedule

You are given jobs with start times, end times, and profits. A job occupies its half-open interval `[start, end)`, so one job may begin exactly when another ends.

Choose a set of non-overlapping jobs that maximizes total profit. Return the maximum profit.

## Input

- `starts`, `ends`: the time bounds of each job.
- `profits`: the profit earned by each job.

## Output

The largest possible total profit.

## Examples

**Example 1**

```
Input: starts = [2,4,6], ends = [5,7,9], profits = [15,20,12]
Output: 27
```

Choose `[2,5)` and `[6,9)` for `15 + 12`.

**Example 2**

```
Input: starts = [1,3,2], ends = [4,6,5], profits = [30,10,25]
Output: 30
```

Choose the single job `[1,4)`.

**Example 3**

```
Input: starts = [1,2,3], ends = [2,3,4], profits = [5,6,7]
Output: 18
```

All three jobs touch but do not overlap.

**Example 4**

```
Input: starts = [1,1,2], ends = [3,4,4], profits = [10,15,7]
Output: 15
```

**Example 5**

```
Input: starts = [5,1,3], ends = [7,4,6], profits = [8,9,7]
Output: 17
```

Choose `[1,4)` and `[5,7)` for `9 + 8`.

## Constraints

- `1 <= starts.length == ends.length == profits.length <= 50,000`
- `1 <= starts[i] < ends[i] <= 1,000,000,000`
- `1 <= profits[i] <= 10,000`
- The input arrays are not sorted.

## Follow-up

How does binary search over sorted end times avoid an `O(n^2)` transition?
