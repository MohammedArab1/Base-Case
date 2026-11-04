## Approach

Sort the intervals by their ending point. Then scan them in that order while maintaining the end of the most recently kept interval.

An interval can be kept if its start is at least the last kept end; touching endpoints are allowed. Otherwise it conflicts with a kept interval and must be removed. Counting the kept intervals and subtracting from the total gives the minimum number of removals.

## Correctness

Sorting by end time supports an exchange argument: among all intervals that could be kept next, the one finishing earliest leaves at least as much room for every later interval as any other choice. Replacing a kept interval with an earlier-finishing one cannot create a new conflict. Therefore the greedy scan keeps the maximum possible number of mutually compatible intervals. Since the total is fixed, minimizing removals is equivalent to maximizing kept intervals, and the algorithm achieves that maximum.

## Complexity

- Time: `O(n log n)` for sorting, followed by an `O(n)` scan.
- Space: `O(n)` for the sorted copy.

## Common mistakes

- Sorting by start time and removing whichever interval appears later.
- Treating intervals that only touch at an endpoint as conflicting.
- Counting removed intervals directly without a consistent conflict rule.
- Forgetting to update the last kept end after keeping an interval.

## Related pattern

The earliest-finish-first rule also solves maximum meeting scheduling and interval coloring.
