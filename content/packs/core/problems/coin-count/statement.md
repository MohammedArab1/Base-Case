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
Input: coins = [2,4,7], amount = 13
Output: 3
```

`7 + 4 + 2 = 13`.

**Example 2**

```
Input: coins = [3,5], amount = 11
Output: 3
```

`5 + 3 + 3 = 11`.

**Example 3**

```
Input: coins = [4,6], amount = 9
Output: -1
```

Every combination of `4` and `6` misses `9`.

**Example 4**

```
Input: coins = [7], amount = 0
Output: 0
```

No coins are needed for zero.

**Example 5**

```
Input: coins = [1,3,4], amount = 6
Output: 2
```

`3 + 3 = 6` uses fewer coins than `4 + 1 + 1`.

## Constraints

- `1 <= coins.length <= 12`
- `1 <= coins[i] <= 10,000`
- `0 <= amount <= 10,000`
- All coin values are distinct.

## Follow-up

How does the order of the loops change if you want to count combinations instead of minimizing coins?
