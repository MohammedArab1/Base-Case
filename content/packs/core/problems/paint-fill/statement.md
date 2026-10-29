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
Input: image = [[4,4,4],[4,4,1],[4,1,4]], row = 1, column = 1, color = 9
Output: [[9,9,9],[9,9,1],[9,1,4]]
```

**Example 2**

```
Input: image = [[2,2,2],[2,2,2]], row = 0, column = 0, color = 2
Output: [[2,2,2],[2,2,2]]
```

The new color equals the old color, so nothing changes.

**Example 3**

```
Input: image = [[7]], row = 0, column = 0, color = 3
Output: [[3]]
```

**Example 4**

```
Input: image = [[1,2],[3,4]], row = 0, column = 0, color = 8
Output: [[8,2],[3,4]]
```

**Example 5**

```
Input: image = [[5,5,5],[5,0,5],[5,5,5]], row = 0, column = 0, color = 6
Output: [[6,6,6],[6,0,6],[6,6,6]]
```

The center `0` is not connected to the outer ring.

## Constraints

- `1 <= image.length, image[0].length <= 500`
- `0 <= image[i][j], color <= 65,535`
- The starting cell is inside the image.

## Follow-up

How would you avoid recursion depth issues on a large region?
