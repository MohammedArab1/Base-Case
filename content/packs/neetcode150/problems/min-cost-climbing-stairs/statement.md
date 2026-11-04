# The Toll Staircase

A hillside inn has a staircase whose steps are numbered from `0` to `n - 1`. Leaving step `i` costs `cost[i]` coins, and from that step a traveler may advance either one or two steps. A traveler may begin on step `0` or step `1` without paying to arrive there, and the climb ends as soon as they move beyond step `n - 1`.

Return the smallest number of coins needed to finish the climb. The toll for the final step is paid when leaving it, just like every other step.

## Input

- `cost`: the toll charged when leaving each step, from bottom to top.

## Output

The minimum total toll required to move beyond the final step.

## Examples

**Example 1**

```
Input: cost = [7, 3, 8, 4]
Output: 7
```

**Example 2**

```
Input: cost = [5, 1]
Output: 1
```

**Example 3**

```
Input: cost = [2, 5, 1, 6, 2]
Output: 5
```

**Example 4**

```
Input: cost = [0, 0, 0]
Output: 0
```

## Constraints

- `2 <= cost.length <= 100,000`
- `0 <= cost[i] <= 10,000`
