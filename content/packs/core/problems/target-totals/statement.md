# Target Totals

A monitoring service records a sequence of integer changes, called `weights`. A **matching range** is any non-empty contiguous run of changes whose weights add up to exactly `target`.

Return the number of matching ranges. Ranges may overlap, and a range may contain only one change.

## Input

- `weights`: the changes in the order they were recorded.
- `target`: the required total for a matching range.

## Output

The number of non-empty contiguous ranges whose values sum to `target`.

## Examples

**Example 1**

```
Input: weights = [1, 1, 1], target = 2
Output: 2
```

The ranges `[1, 1]` at indices 0–1 and 1–2 both reach the target.

**Example 2**

```
Input: weights = [1, 2, 3], target = 3
Output: 2
```

The single change `3` and the range `[1, 2]` both count.

**Example 3**

```
Input: weights = [-1, -1, 1], target = 0
Output: 1
```

The range `[-1, 1]` at indices 1–2 sums to zero.

**Example 4**

```
Input: weights = [1, -1, 1, -1], target = 0
Output: 4
```

Negative values allow several overlapping zero-sum ranges.

## Constraints

- `1 <= weights.length <= 100,000`
- `-1,000,000,000 <= weights[i], target <= 1,000,000,000`
- The answer fits in a signed 64-bit integer.

## Follow-up

Can you count the ranges in a single pass without storing every prefix total separately?
