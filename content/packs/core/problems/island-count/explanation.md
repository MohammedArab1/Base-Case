# Explanation

## Key insight

Each island is a connected component of land cells in a grid graph. Once you visit one cell of an island, you can flood the entire component and mark it as visited so the outer scan never counts it again.

## Algorithm

1. If the grid is empty, return `0`.
2. Scan every cell.
3. When a cell contains `1`:
   - Increment the island count.
   - Push the cell onto a stack.
   - While the stack is not empty, pop a cell. Skip it if it is outside the grid or no longer `1`. Otherwise set it to `0` and push its four orthogonal neighbors.
4. Return the count.

## Correctness

The outer scan finds exactly one cell per island: the first unvisited land cell it encounters. The flood fill then visits every cell connected to that cell through orthogonal moves, because the stack explores all four directions and marks each visited cell so it is never processed twice. Cells from different islands are never reachable from each other, so they are counted separately.

## Complexity

- Time: `O(rows * cols)`, because each cell is visited at most a constant number of times.
- Space: `O(rows * cols)` in the worst case for the stack.

## Common mistakes

- Treating diagonal cells as connected.
- Forgetting to mark visited cells, which can loop forever.
- Using recursion on a 300×300 all-land grid and hitting the recursion limit.
