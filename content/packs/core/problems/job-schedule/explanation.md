# Explanation

## Key insight

After sorting by end time, the jobs compatible with a given job form a prefix. Binary search finds that prefix, enabling a linear number of constant-time transitions.

## Algorithm

1. Pair each start, end, and profit; sort by end time.
2. Build a list of end times in sorted order.
3. For each job in order, binary search for the last job ending at or before its start.
4. Set `dp[i] = max(dp[i - 1], profit + dp[compatible])`.
5. Return the final DP value.

## Correctness

For the first `i` jobs, an optimal schedule either excludes job `i`, giving `dp[i - 1]`, or includes it. If it includes job `i`, every other job must end no later than job `i`'s start; sorting makes those jobs exactly a prefix of size `j`, whose best value is `dp[j]`. Taking the maximum covers both cases, so the recurrence is correct.

## Complexity

- Time: `O(n log n)` for sorting and binary searches.
- Space: `O(n)`.

## Common Mistakes

- Treating touching intervals as overlapping.
- Binary-searching on start times instead of end times.
- Forgetting that the input arrays are unsorted.
- Using the current job in its own compatibility search.

## Related pattern

Weighted interval scheduling is the classic form of this DP.
