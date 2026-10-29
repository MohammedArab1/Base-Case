# Path Count

A robot starts at the top-left corner of a `rows` by `columns` grid. It may move only one cell right or one cell down at a time. How many distinct paths reach the bottom-right corner?

## Input

- `rows`, `columns`: the grid dimensions.

## Output

The number of distinct paths. The result fits in a signed 64-bit integer.

## Examples

**Example 1**

```
Input: rows = 4, columns = 3
Output: 10
```

**Example 2**

```
Input: rows = 2, columns = 5
Output: 5
```

**Example 3**

```
Input: rows = 1, columns = 4
Output: 1
```

**Example 4**

```
Input: rows = 5, columns = 5
Output: 70
```

**Example 5**

```
Input: rows = 3, columns = 3
Output: 6
```

## Constraints

- `1 <= rows, columns <= 20`

## Follow-up

Can you solve it with a one-dimensional table and a single left-to-right pass per row?
