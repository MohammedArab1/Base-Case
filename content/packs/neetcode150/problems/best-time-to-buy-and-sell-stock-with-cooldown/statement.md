# Trading with Rest Days

A trader watches a sequence of daily prices. They may hold at most one share at a time and may buy or sell any number of times. After selling a share, the trader must spend the following day resting and cannot buy on that day; they may buy again the day after the rest.

The trader starts with no share and no obligation to trade. Return the maximum profit achievable by the end of the final day.

## Input

- `prices`: the share price on each consecutive day.

## Output

The maximum total profit, using no more than one share at a time and respecting the rest day after every sale.

## Examples

**Example 1**

```
Input: prices = [6, 1, 3, 2, 5, 4]
Output: 4
```

**Example 2**

```
Input: prices = [7, 2, 6, 1, 4, 3, 8]
Output: 9
```

**Example 3**

```
Input: prices = [5, 4, 3, 2]
Output: 0
```

**Example 4**

```
Input: prices = [2, 9]
Output: 7
```

## Constraints

- `1 <= prices.length <= 100,000`
- `0 <= prices[i] <= 10,000`
