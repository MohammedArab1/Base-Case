# Explanation

## Key insight

For a fixed rate, the time needed is `sum(ceil(pile / rate))`. Raising the rate can never increase this sum, so the set of feasible rates is an upward-closed interval. The problem is to find its left endpoint.

## Algorithm

1. Set `low = 1` and `high = max(piles)`. The maximum pile size is always feasible because one pile can be finished in one hour, and there are at least as many hours as piles.
2. While `low < high`, test the midpoint rate.
3. Compute the total hours by summing `ceil(pile / rate)` for every pile.
4. If the total is within the deadline, the answer is at most the midpoint, so move `high` down. Otherwise move `low` up.
5. Return `low`.

## Correctness

The total-hours function is non-increasing in `rate`: increasing the rate cannot increase any ceiling term. Therefore, if a rate is feasible, every larger rate is feasible, and if a rate is infeasible, every smaller rate is infeasible. Binary search maintains the invariant that `low` is not known to be too small and `high` is feasible or equal to `low`. When the bounds meet, the first feasible rate has been found.

## Complexity

- Time: `O(n log M)`, where `n` is the number of piles and `M` is the largest pile.
- Space: `O(1)` extra space.

## Common mistakes

- Using floor division instead of ceiling division when counting hours.
- Starting `low` at `0`, which is not a valid positive rate.
- Setting `high` to the sum of the piles instead of the maximum pile.
- Forgetting that a worker who finishes a pile early does not start another pile in the same hour.
- Using floating-point division and hitting precision problems for large pile sizes.
