# Paint Fill

A rectangular image is represented by integer color values. Starting from `(row, column)`, repaint the connected region of cells that share the starting cell's original color. Connected means sharing an edge: up, down, left, or right.

Return the resulting image.

## Input

- `image`: a rectangular grid of color values.
- `row`, `column`: the starting cell.
- `color`: the new color.

## Output

The image after the connected region is repainted.

## Examples

**Example 1**

```
Input: image = [[1,1,1],[1,1,0],[1,0,1]], row = 1, column = 1, color = 2
Output: [[2,2,2],[2,2,0],[2,0,1]]
```

**Example 2**

```
Input: image = [[0,0,0],[0,0,0]], row = 0, column = 0, color = 0
Output: [[0,0,0],[0,0,0]]
```

The new color equals the old color, so nothing changes.

**Example 3**

```
Input: image = [[1]], row = 0, column = 0, color = 2
Output: [[2]]
```

## Constraints

- `1 <= image.length, image[0].length <= 500`
- `0 <= image[i][j], color <= 65,535`
- The starting cell is inside the image.

## Follow-up

How would you avoid recursion depth issues on a large region?
