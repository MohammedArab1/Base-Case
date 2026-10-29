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
Input: weights = [4, 1, 3, 2, 2], target = 4
Output: 3
```

The ranges are `[4]`, `[1, 3]`, and `[2, 2]`.

**Example 2**

```
Input: weights = [2, -1, 3, -2, 1], target = 1
Output: 4
```

The ranges are `[2, -1]`, `[3, -2]`, `[1]`, and `[-1, 3, -2, 1]`.

**Example 3**

```
Input: weights = [5, -3, 2, 1, 1], target = 2
Output: 3
```

The ranges are `[5, -3]`, `[2]`, and `[1, 1]`.

**Example 4**

```
Input: weights = [0, 0, 7, -7], target = 0
Output: 6
```

There are three zero-sum ranges made only from the zeros, plus three that include the `7, -7` pair.

**Example 5**

```
Input: weights = [9], target = 4
Output: 0
```

## Constraints

- `1 <= weights.length <= 100,000`
- `-1,000,000,000 <= weights[i], target <= 1,000,000,000`
- The answer fits in a signed 64-bit integer.

## Follow-up

Can you count the ranges in a single pass without storing every prefix total separately?
