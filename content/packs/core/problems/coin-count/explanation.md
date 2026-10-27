# Explanation

## Key insight

Every optimal solution for an amount ends with some coin. Removing that coin leaves an optimal solution for a smaller amount.

## Algorithm

1. Create `dp` of length `amount + 1`, filled with a value larger than any possible answer.
2. Set `dp[0] = 0`.
3. For each amount from `1` to `amount`, try every coin that fits.
4. Set `dp[value] = min(dp[value], dp[value - coin] + 1)`.
5. Return `dp[amount]`, or `-1` if it was never updated.

## Correctness

By induction on the amount, `dp[value - coin]` is the minimum number of coins for the smaller total. Adding the chosen coin gives a valid way to form `value`. Conversely, removing the last coin from any optimal solution produces a solution considered by the transition. Taking the minimum therefore gives the true optimum.

## Complexity

- Time: `O(amount * number of coins)`.
- Space: `O(amount)`.

## Common mistakes

- Using a greedy largest-coin-first strategy, which can fail.
- Forgetting the `-1` case.
- Treating `dp[0]` as impossible instead of zero.

## Related pattern

The same unbounded-knapsack transition counts combinations when the loop order is reversed.
