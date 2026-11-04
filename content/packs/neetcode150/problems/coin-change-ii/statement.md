# Coin Combination Ledger

A cash drawer contains an unlimited supply of each coin denomination in `coins`. A combination is a multiset of coins whose values add up to `amount`. Two combinations are the same when they use the same number of each denomination; the order in which coins are listed does not matter.

Return the number of distinct combinations that sum to `amount`.

## Input

- `amount`: the target total.
- `coins`: the available denominations, all distinct and positive.

## Output

The number of unordered combinations of coins that sum exactly to `amount`. An amount of `0` has one empty combination.

## Examples

**Example 1**

```
Input: amount = 9, coins = [1, 3, 4]
Output: 7
```

**Example 2**

```
Input: amount = 0, coins = [2, 5]
Output: 1
```

**Example 3**

```
Input: amount = 7, coins = [2, 3]
Output: 1
```

**Example 4**

```
Input: amount = 8, coins = [2, 4]
Output: 3
```

## Constraints

- `0 <= amount <= 1,000`
- `1 <= coins.length <= 20`
- `1 <= coins[i] <= 200`
- All coin values are distinct.
- The answer fits in a signed 32-bit integer.
