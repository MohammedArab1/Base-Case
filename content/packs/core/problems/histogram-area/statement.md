# Histogram Area

A histogram is represented by bar heights, where each bar has width one and adjacent bars touch. Find the area of the largest rectangle that fits entirely inside the histogram.

## Input

- `heights`: non-negative bar heights.

## Output

The largest rectangle area.

## Examples

**Example 1**

```
Input: heights = [3,1,4,2,5]
Output: 6
```

The rectangle of height `2` spans the bars `4`, `2`, and `5`.

**Example 2**

```
Input: heights = [2,3,2]
Output: 6
```

**Example 3**

```
Input: heights = [6,2,5,4,5]
Output: 12
```

The rectangle of height `4` spans the bars `5`, `4`, and `5`.

**Example 4**

```
Input: heights = [0,7,0]
Output: 7
```

**Example 5**

```
Input: heights = []
Output: 0
```

## Constraints

- `0 <= heights.length <= 100,000`
- `0 <= heights[i] <= 1,000,000`

## Follow-up

Why does keeping indices in increasing height order let each bar's widest rectangle be computed once?
