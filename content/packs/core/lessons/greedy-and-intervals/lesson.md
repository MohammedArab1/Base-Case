# Greedy Algorithms and Intervals

A greedy algorithm makes the choice that looks best right now and never goes back. Sometimes that is enough to be optimal. Sometimes it is a trap.

The difference is **proof**.

## The exchange argument

To justify a greedy choice, show that any optimal solution can be changed to include your choice without becoming worse.

For the meeting scheduling problem:

1. Sort meetings by end time.
2. Pick the first meeting.
3. Skip every meeting that overlaps it.
4. Repeat.

Why is picking the earliest-ending meeting safe? Suppose an optimal schedule starts with a different meeting. The greedy meeting ends no later, so replacing the first meeting cannot create a new overlap with the rest of the schedule. The optimal schedule still has the same size. Repeating the exchange shows the greedy schedule is optimal.

If you cannot make that argument, do not assume greedy works.

## Merging intervals

**Merge Window** gives intervals like `[1, 4]`, `[2, 3]`, `[6, 8]`. Sort by start:

```text
[1, 4], [2, 3], [6, 8]
```

Then scan:

```text
current = [1, 4]
next [2, 3]: 2 <= 4, merge -> [1, max(4, 3)] = [1, 4]
next [6, 8]: 6 > 4, emit [1, 4], current = [6, 8]
emit [6, 8]
```

The sort costs `O(n log n)` and the merge is `O(n)`.

## Scheduling the most meetings

**Meeting Overlap** asks for the maximum number of non-overlapping meetings. Sort by end time, then greedily keep a meeting if it starts at or after the last chosen end.

```text
[1, 4], [2, 3], [3, 5], [6, 8]
sorted by end: [2, 3], [1, 4], [3, 5], [6, 8]

choose [2, 3]
[1, 4] starts before 3 -> skip
[3, 5] starts at 3 -> choose (if touching is allowed)
[6, 8] starts after 5 -> choose

answer: 3
```

Changing the endpoint rule changes the answer. Read the statement carefully.

## Minimum rooms

**Task Intervals** asks how many resources are needed at once. One approach:

1. Sort starts and ends separately.
2. Sweep both lists. When a start is before the next end, a new room is needed; otherwise a room is freed.

```text
starts: 1, 2, 3, 6
ends:   3, 4, 5, 8

start 1 -> rooms 1
start 2 -> rooms 2
end 3   -> rooms 1
start 3 -> rooms 2
...
```

A min-heap of end times is an alternative: reuse the earliest-ending room whenever possible, otherwise add one.

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
