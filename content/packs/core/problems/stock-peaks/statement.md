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
Input: prices = [9, 2, 11, 4, 8, 1, 10]
Output: 9
```

Buy at `2` and sell at `11`.

**Example 2**

```
Input: prices = [6, 5, 4, 3, 2]
Output: 0
```

Prices only fall, so the best choice is not to trade.

**Example 3**

```
Input: prices = [3, 8]
Output: 5
```

**Example 4**

```
Input: prices = [5, 3, 7, 1, 6]
Output: 5
```

Buy at `1` and sell at `6`.

**Example 5**

```
Input: prices = [4, 4, 4]
Output: 0
```

No trade can produce a positive profit.

## Constraints

- `0 <= prices.length <= 100,000`
- `0 <= prices[i] <= 1,000,000,000`

## Follow-up

Can you compute the answer in one pass while remembering only the cheapest price seen so far?
