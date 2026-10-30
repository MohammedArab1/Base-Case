# Greedy Algorithms and Intervals

A greedy algorithm makes the choice that looks best right now and never goes back. Sometimes that is enough to be optimal. Sometimes it is a trap.

The difference is **proof**.

## The exchange argument

To justify a greedy choice, show that any optimal solution can be changed to include your choice without becoming worse.

For **Stock Peaks**:

1. Scan prices from left to right.
2. Keep the cheapest price seen so far.
3. Treat each later price as a possible selling price.

Why is keeping the minimum safe? Any optimal sale buys before it sells. Replacing that buy with the cheapest earlier price cannot reduce the profit, so one scan considers an optimal buy-sell pair.

If you cannot make that argument, do not assume greedy works.

## Inserting into a sorted interval list

**Merge Window** starts with a sorted, non-overlapping list and inserts one incoming interval. Scan until the incoming interval stops overlapping:

```text
intervals: [2, 4], [7, 9], [12, 14]
incoming:  [3, 8]

[2, 4] overlaps -> extend to [2, 8]
[7, 9] overlaps -> extend to [2, 9]
[12, 14] does not overlap -> emit [2, 9], keep [12, 14]
```

The list is already sorted, so no sort is needed. The scan is `O(n)` and the required output uses `O(n)` space.

## Checking meeting conflicts

**Meeting Overlap** is a boolean question: can every meeting be attended? Sort by start time, then compare each start with the previous end.

```text
[1, 4], [3, 5], [6, 8]
sorted by start: [1, 4], [3, 5], [6, 8]

3 < 4 -> overlap, return false
```

Use a strict comparison. A meeting that starts exactly when the previous one ends is allowed. The sort costs `O(n log n)` and the sorted copy uses `O(n)` space.

## Cooldown scheduling

**Task Intervals** is not a room-counting problem. Identical tasks need a cooldown gap. Count frequencies, find the maximum frequency `m` and the number of tasks tied at `m`:

```text
tasks: A A B, cooldown = 2
counts: A = 2, B = 1
m = 2, tied = 1
frame = (2 - 1) * (2 + 1) + 1 = 4
schedule: A B _ A
```

The answer is the larger of that frame and `tasks.length`. Counting takes `O(n)` time and `O(1)` space for 26 labels.

## Greedy choices that work

- **Stock Peaks**: keep the cheapest earlier price; the best sale ending today uses that minimum, and scanning once considers every buy-before-sell pair.
- **Majority Value**: Boyer-Moore cancels pairs of different values. The majority survives because it cannot be fully cancelled.
- **Fuel Circuit**: if the total fuel is sufficient, starting after the last point where the running fuel went negative works.
- **Join Sticks**: always join the two shortest sticks; the smallest costs are paid the most times.

## Greedy choices that need care

- Coin change with arbitrary denominations: taking the largest coin can fail.
- 0/1 knapsack: the best value-to-weight ratio can block a better combination.
- Shortest path with negative weights: a locally cheap edge can lead to a very expensive route.

In those cases use dynamic programming or a graph algorithm.

## The interview sentence

> "I sort by ______, then greedily take ______. This is safe because ______."

If the last blank is hard to fill, you have found the real problem: the greedy choice is a guess.
