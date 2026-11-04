# Sorted Pair Search

You are given `numbers`, a list of integers sorted in non-decreasing order, and a `target` integer. Exactly one pair of distinct indices has values that add up to `target`.

Return the two **0-based** indices in ascending order. Aim for `O(1)` extra space beyond the returned list.

## Input

- `numbers`: a sorted, non-decreasing list of integers with at least two elements.
- `target`: the required sum.

## Output

A list `[i, j]` with `i < j` and `numbers[i] + numbers[j] == target`.

## Examples

**Example 1**

```
Input: numbers = [2, 3, 4, 7, 11], target = 9
Output: [0, 3]
```

`2 + 7 = 9`.

**Example 2**

```
Input: numbers = [-5, -2, 0, 4, 9], target = 2
Output: [1, 3]
```

`-2 + 4 = 2`.

**Example 3**

```
Input: numbers = [1, 1, 2], target = 2
Output: [0, 1]
```

Equal values at different indices form a valid pair.

**Example 4**

```
Input: numbers = [2, 3], target = 5
Output: [0, 1]
```

## Constraints

- `2 <= numbers.length <= 100,000`
- `-1,000,000,000 <= numbers[i], target <= 1,000,000,000`
- `numbers` is sorted in non-decreasing order.
- Exactly one pair of distinct indices satisfies the condition.

## Follow-up

Can you explain why moving the left pointer right when the sum is too small never skips the unique answer?
