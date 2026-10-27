# Sum Combinations

Given distinct positive candidates and a target, return every unique combination of candidates that sums to the target. Each candidate may be used an unlimited number of times.

A combination is a multiset, so order does not create a new combination. List each combination in nondecreasing order, and sort the list of combinations lexicographically.

## Input

- `candidates`: distinct positive integers.
- `target`: the desired sum.

## Output

All unique combinations in the required order.

## Examples

**Example 1**

```
Input: candidates = [2,3,6,7], target = 7
Output: [[2,2,3],[7]]
```

**Example 2**

```
Input: candidates = [2,3,5], target = 8
Output: [[2,2,2,2],[2,3,3],[3,5]]
```

**Example 3**

```
Input: candidates = [2], target = 1
Output: []
```

## Constraints

- `1 <= candidates.length <= 30`
- `1 <= candidates[i] <= 40`
- `1 <= target <= 40`
- All candidates are distinct.

## Follow-up

How does starting each recursive call at the current candidate prevent duplicate combinations?
