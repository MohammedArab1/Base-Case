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
Input: starts = [1,2,3,3], ends = [3,4,5,6], profits = [50,10,40,70]
Output: 120
```

Choose the jobs `[1,3)` and `[3,6)` for `50 + 70`.

**Example 2**

```
Input: starts = [1,2,3,4,6], ends = [3,5,10,6,9], profits = [20,20,100,70,60]
Output: 150
```

Choose `[1,3)`, `[4,6)`, and `[6,9)` for `20 + 70 + 60`.

**Example 3**

```
Input: starts = [1,1,1], ends = [2,3,4], profits = [5,6,4]
Output: 6
```

## Constraints

- `1 <= starts.length == ends.length == profits.length <= 50,000`
- `1 <= starts[i] < ends[i] <= 1,000,000,000`
- `1 <= profits[i] <= 10,000`
- The input arrays are not sorted.

## Follow-up

How does binary search over sorted end times avoid an `O(n^2)` transition?
