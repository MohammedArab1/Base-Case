# Explanation

## Approach

Work from the bottom of the staircase upward. Let `dp[i]` be the minimum toll paid to stand at position `i`, where position `n` is the landing just beyond the last step. Both legal starting positions cost nothing, so `dp[0] = dp[1] = 0`.

For any later position `i`, the traveler arrived from either step `i - 1` or step `i - 2`. In the first case they paid `cost[i - 1]` before moving; in the second they paid `cost[i - 2]`. Therefore

`dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2])`.

Only the previous two values are ever needed, so the implementation keeps two variables instead of a full table.

## Correctness

The claim is that each `dp[i]` equals the true minimum toll for reaching position `i`. It holds for `i = 0` and `i = 1` because those positions are free starting points.

Now assume it holds for all smaller positions. Any route to position `i` has a last move from step `i - 1` or step `i - 2`, and reaching that step already cost at least `dp[i - 1]` or `dp[i - 2]` respectively. Adding the required departure toll gives a route costing at least the corresponding recurrence term. Conversely, an optimal route to either predecessor followed by its final one- or two-step move realizes each term. The minimum of the two terms is therefore exactly `dp[i]`. By induction, the final value is the minimum toll for finishing the climb.

## Complexity

- Time: `O(n)`, with one constant-time transition per step.
- Space: `O(1)`, because only two previous states are retained.

## Common mistakes

- Charging a toll merely for starting on step `0` or step `1`.
- Stopping the calculation at the last step instead of at the landing beyond it.
- Using a greedy choice between one-step and two-step jumps; the locally cheaper jump can miss a cheaper overall route.
- Updating the rolling variables in the wrong order and losing the value for `dp[i - 2]`.

## Related pattern

Rolling dynamic programming over a line also appears in ring-robbery, adjacent-selection, and tiling problems.
