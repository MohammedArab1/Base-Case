# Explanation

## Approach

Pad the row with a 1 on each side. These sentinels never burst; they supply the outside values.

Define `dp[left][right]` as the maximum bounty from bursting every balloon strictly between boundary indices `left` and `right`. Consider the balloon `last` that bursts last in that interval. When it bursts, all other balloons between the boundaries are gone, so its neighbors are exactly `values[left]` and `values[right]`. Its burst earns `values[left] * values[last] * values[right]`. The balloons to its left and right form independent subproblems.

Therefore:

`dp[left][right] = max over last of dp[left][last] + values[left] * values[last] * values[right] + dp[last][right]`

Intervals are filled by increasing length, and the answer is `dp[0][n + 1]`.

## Correctness

Take any optimal order for the interval `(left, right)` and let `last` be the final balloon burst. Immediately before that burst, every other balloon in the interval is gone, so the neighbors are exactly the two boundaries. The bounty from the final burst is fixed. The bursts before it split into independent orders for the left and right subintervals, because balloons on one side never interact with balloons on the other once `last` remains as the separator. By induction, the DP values for those subintervals are optimal, so considering every possible `last` covers every optimal order. The maximum is therefore correct.

## Complexity

- Time: `O(n^3)` for the three nested loops over interval boundaries and the final balloon.
- Space: `O(n^2)` for the DP table.

## Common mistakes

- Forgetting the boundary sentinels of value 1.
- Choosing the first balloon instead of the last, which makes the subproblems interact.
- Using the original neighbors after earlier balloons have already burst.
- Off-by-one errors in the interval boundaries or loop ranges.
