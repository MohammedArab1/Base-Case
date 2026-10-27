# Path Count

A robot starts at the top-left corner of a `rows` by `columns` grid. It may move only one cell right or one cell down at a time. How many distinct paths reach the bottom-right corner?

## Input

- `rows`, `columns`: the grid dimensions.

## Output

The number of distinct paths.

## Examples

**Example 1**

```
Input: rows = 3, columns = 7
Output: 28
```

**Example 2**

```
Input: rows = 3, columns = 2
Output: 3
```

**Example 3**

```
Input: rows = 1, columns = 1
Output: 1
```

The robot is already at the destination.

## Constraints

- `1 <= rows, columns <= 20`

## Follow-up

Can you solve it with a one-dimensional table and a single left-to-right pass per row?
