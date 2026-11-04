# Explanation

## Approach

Process denominations one at a time. Let `ways[x]` be the number of combinations summing to `x` using only the coins considered so far. Before any coin, `ways[0] = 1` and every other entry is zero.

For a new coin of value `c`, each combination making `x - c` can be extended by one copy of `c` to make `x`. Walking totals upward lets a coin be reused any number of times, and because coins are processed in a fixed outer order, each multiset is built in exactly one order.

## Correctness

Invariant: after processing a set of denominations, `ways[x]` equals the number of multisets drawn from that set that sum to `x`.

Initially the only sum available is zero, formed by the empty multiset. When adding coin `c`, any multiset summing to `x` either uses no copies of `c` (already counted in `ways[x]`) or uses at least one. Removing one copy of `c` leaves a multiset summing to `x - c`, and the upward loop has already counted all such multisets, including those that use further copies of `c`. Thus the update adds exactly the missing multisets. Every multiset has a unique count of each denomination, so no multiset is counted twice. Induction over denominations gives the result.

## Complexity

- Time: `O(amount * c)`, where `c` is the number of denominations.
- Space: `O(amount)` for the `ways` array.

## Common mistakes

- Putting the amount loop outside the coin loop, which counts different orders separately.
- Starting the inner loop below the coin value and reading a negative index.
- Setting every entry to one or forgetting the empty combination at zero.
- Using duplicate denominations, which overcounts combinations.

## Related pattern

One-dimensional coin DP is also used for minimum coin count, bounded knapsack, and partition-counting problems.
