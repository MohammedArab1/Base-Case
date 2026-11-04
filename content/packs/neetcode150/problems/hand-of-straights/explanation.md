## Approach

First check that the deck size is divisible by `groupSize`; otherwise no partition is possible. Count how many copies of each value appear.

Process the distinct values in increasing order. When `value` is the smallest value with cards remaining, every remaining copy of `value` must begin its own run. Each of those runs needs the next `groupSize - 1` consecutive values, so the copies of `value` determine how many copies of each following value are consumed. If any required value has fewer than `amount` copies, the deck cannot be grouped. Otherwise subtract `amount` from every value in the run and continue.

## Correctness

The smallest remaining value cannot be placed anywhere except at the start of a run, because all smaller values have already been used. Therefore consuming exactly the required runs that start at that value is forced. If a required consecutive value is missing, no alternative arrangement can exist. If all runs are consumed, every card has been used exactly once and every group is consecutive. This shows that the greedy consumption succeeds exactly when a valid partition exists.

## Complexity

- Time: `O(n log n)` for sorting the distinct values and scanning the deck.
- Space: `O(n)` for the frequency table.

## Common mistakes

- Checking only that the deck size is divisible by `groupSize`.
- Starting a run at an arbitrary card instead of the smallest remaining value.
- Consuming one run at a time without reconsidering how many copies of the smallest value remain.
- Forgetting that `groupSize` can equal `1`.

## Related pattern

The same forced-start greedy idea applies to rebuilding sequences from frequency counts.
