# Explanation

## Key insight

For any selling day, the best buying day is the cheapest day before it. Scan once while maintaining that cheapest price and the largest profit seen.

## Algorithm

1. Set `cheapest` to the first price (or infinity for an empty list) and `best` to `0`.
2. For each price:
   - Update `best` with `price - cheapest` when that is larger.
   - Update `cheapest` with the current price when it is smaller.
3. Return `best`.

## Correctness

At the start of each day, `cheapest` is the minimum price among all earlier days. The best trade ending on the current day is therefore `price - cheapest`, and taking the maximum over all days considers every valid buy/sell pair. The initial `0` covers the option of not trading, so a falling sequence returns `0`.

## Complexity

- Time: `O(n)`, one pass.
- Space: `O(1)`.

## Common mistakes

- Using a profit that buys after selling.
- Updating the cheapest price before evaluating today's profit, which can allow same-day trading.
- Forgetting to return `0` when prices only fall.
