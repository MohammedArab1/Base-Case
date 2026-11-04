# Explanation

## Approach

Model the trader with three states after each day:

- `resting`: no share is held and a purchase is allowed.
- `holding`: one share is held.
- `cooling`: a share was sold today, so tomorrow must be a rest day.

Initially the trader is `resting` with profit `0`; the other states are impossible.

For each price, compute the next states from the previous ones:

- Buy today: stay in `holding` with the old holding profit, or move from `resting` and pay the price.
- Sell today: move from the old `holding` state and add the price, landing in `cooling`.
- Do nothing while free: stay in `resting`, or finish a cooling day and become `resting` again.

The answer after all days is the better of `resting` and `cooling`, since ending with a share is never better than selling it without a later purchase.

## Correctness

Every legal trading plan corresponds to a path through these three states, with the transitions above. Conversely, every transition sequence describes a legal plan: buying requires being free, selling requires holding a share, and a sale necessarily enters `cooling`, which prevents a purchase on the next day. The DP keeps the maximum profit for each state after each prefix of days. Because the transitions consider exactly the legal actions for the next day, induction on the day index proves the stored values are optimal for their states. Taking the best terminal non-holding state therefore gives the maximum legal profit.

## Complexity

- Time: `O(n)`, with a constant number of transitions per day.
- Space: `O(1)`, because only three state values are retained.

## Common mistakes

- Allowing a purchase on the day immediately after a sale.
- Computing a sale from the already-updated holding value, which permits a same-day round trip.
- Forgetting that a rest day simply carries profit forward.
- Assuming alternating local minima and maxima is always optimal; the rest day can make skipping a small trade worthwhile.

## Related pattern

State-machine dynamic programming also handles transaction fees, limited transactions, and multi-day cooldowns.
