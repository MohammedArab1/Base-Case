# Histogram Area

A histogram is represented by bar heights, where each bar has width one and adjacent bars touch. Find the area of the largest rectangle that fits entirely inside the histogram.

## Input

- `heights`: non-negative bar heights.

## Output

The largest rectangle area.

## Examples

**Example 1**

```
Input: heights = [2,1,5,6,2,3]
Output: 10
```

The rectangle of height `5` spans the bars of heights `5` and `6`.

**Example 2**

```
Input: heights = [2,4]
Output: 4
```

**Example 3**

```
Input: heights = [0]
Output: 0
```

## Constraints

- `0 <= heights.length <= 100,000`
- `0 <= heights[i] <= 1,000,000`

## Follow-up

Why does keeping indices in increasing height order let each bar's widest rectangle be computed once?
