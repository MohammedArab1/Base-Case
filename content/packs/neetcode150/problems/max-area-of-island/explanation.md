# Explanation

## Approach

Scan the grid. When an unvisited land cell is found, start a flood fill using an explicit stack. Mark the starting cell, then repeatedly pop a cell, count it, and push unvisited orthogonal land neighbors. After the region is exhausted, update the maximum area.

## Correctness

The flood fill marks a cell when it enters the stack, so every land cell is counted at most once. From a starting cell it follows every orthogonal land connection, so it visits the entire connected component and no cell from another component. Therefore each region's area is measured exactly. Taking the maximum over all starting cells gives the largest area, and a grid with no land leaves the maximum at zero.

## Complexity

Let `R` and `C` be the grid dimensions.

- Time: `O(R * C)`, because each cell is processed a constant number of times.
- Space: `O(R * C)` in the worst case for the stack and visited marks.

## Common mistakes

- Counting diagonal neighbors as connected.
- Marking cells only when they are popped, which can push duplicates and overcount.
- Forgetting to handle an empty grid.
- Returning the number of regions instead of the largest area.
