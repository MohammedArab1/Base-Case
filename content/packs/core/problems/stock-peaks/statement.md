# Stock Peaks

You are given a list of daily prices for one stock. You may buy once and sell once; you must buy before you sell, and you may skip trading entirely.

Return the maximum profit possible. If no profitable trade exists, return `0`.

## Input

- `prices`: the price on each consecutive day.

## Output

The largest difference `prices[sell] - prices[buy]` with `buy < sell`, or `0`.

## Examples

**Example 1**

```
Input: prices = [7, 1, 5, 3, 6, 4]
Output: 5
```

Buy at `1` and sell at `6`.

**Example 2**

```
Input: prices = [7, 6, 4, 3, 1]
Output: 0
```

Prices only fall, so the best choice is not to trade.

**Example 3**

```
Input: prices = [1, 2]
Output: 1
```

## Constraints

- `0 <= prices.length <= 100,000`
- `0 <= prices[i] <= 1,000,000,000`

## Follow-up

Can you compute the answer in one pass while remembering only the cheapest price seen so far?
