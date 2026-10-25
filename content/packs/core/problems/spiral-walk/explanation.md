# Explanation

## Key insight

The unvisited region is always a rectangle. Four boundaries describe it, and each side is visited once before that boundary moves inward. Explicit guards prevent visiting a row or column twice when the remaining rectangle collapses.

## Algorithm

1. Return an empty array if the grid has no rows or no columns.
2. Set `top = 0`, `bottom = rows - 1`, `left = 0`, `right = columns - 1`.
3. While `top <= bottom` and `left <= right`:
   - Add the top row from left to right, then increment `top`.
   - Add the right column from top to bottom, then decrement `right`.
   - If `top <= bottom`, add the bottom row from right to left, then decrement `bottom`.
   - If `left <= right`, add the left column from bottom to top, then increment `left`.
4. Return the result.

## Correctness

Each iteration visits exactly the boundary cells of the current unvisited rectangle, in clockwise order. Afterward, each boundary moves inward, so no cell is visited twice. The guards handle degenerate rectangles with one remaining row or column, where a second pass would duplicate cells. The loop ends when the rectangle is empty, so every cell is visited exactly once.

## Complexity

- Time: `O(m * n)`, because every cell is visited once.
- Space: `O(1)` extra space apart from the output array.

## Common mistakes

- Omitting the guards and duplicating the last row or column.
- Shrinking boundaries before finishing the corresponding side.
- Mutating the matrix instead of reading it.
- Returning `[[]]` rather than `[]` for an empty grid.
