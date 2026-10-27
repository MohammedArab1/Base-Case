# Coin Count

You have an unlimited supply of each coin denomination in `coins`. Return the fewest coins needed to total exactly `amount`, or `-1` when the amount cannot be formed.

## Input

- `coins`: distinct positive coin values.
- `amount`: the target total.

## Output

The minimum number of coins, or `-1`.

## Examples

**Example 1**

```
Input: coins = [1,2,5], amount = 11
Output: 3
```

`5 + 5 + 1 = 11`.

**Example 2**

```
Input: coins = [2], amount = 3
Output: -1
```

**Example 3**

```
Input: coins = [1], amount = 0
Output: 0
```

No coins are needed for zero.

## Constraints

- `1 <= coins.length <= 12`
- `1 <= coins[i] <= 10,000`
- `0 <= amount <= 10,000`
- All coin values are distinct.

## Follow-up

How does the order of the loops change if you want to count combinations instead of minimizing coins?
