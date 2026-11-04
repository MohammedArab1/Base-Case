# Minimum Eating Rate

A worker must clear several piles of grain before a deadline. In each hour the worker chooses one pile and eats up to `rate` units from it. If fewer than `rate` units remain in the chosen pile, the worker finishes that pile and stays idle for the rest of the hour instead of starting another pile.

Given the pile sizes and a whole number of hours, return the smallest positive integer `rate` that lets the worker clear every pile within the deadline.

## Input

- `piles`: an `int[]` of positive pile sizes.
- `hours`: the number of whole hours available.

## Output

Return the minimum integer `rate >= 1` that clears every pile in at most `hours` hours.

## Examples

**Example 1**

```
Input: piles = [4, 9, 6], hours = 8
Output: 3
```

At rate `3`, the piles take `2 + 3 + 2 = 7` hours. Rate `2` would take `2 + 5 + 3 = 10` hours, which is too slow.

**Example 2**

```
Input: piles = [3, 3, 3], hours = 3
Output: 3
```

**Example 3**

```
Input: piles = [10], hours = 5
Output: 2
```

**Example 4**

```
Input: piles = [1, 1, 1, 1], hours = 4
Output: 1
```

## Constraints

- `1 <= piles.length <= 10,000`
- `1 <= piles[i] <= 1,000,000,000`
- `piles.length <= hours <= 1,000,000,000`
- The rate must be a positive integer.

## Follow-up

Prove that the number of hours needed is non-increasing as the rate grows. Why does that property justify binary search?
