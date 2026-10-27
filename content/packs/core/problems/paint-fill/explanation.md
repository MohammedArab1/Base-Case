# Explanation

## Key insight

The region is exactly the connected component of the starting cell in the graph induced by equal colors. A depth-first or breadth-first traversal visits it once.

## Algorithm

1. Record the starting color. If it equals the new color, return the image unchanged.
2. Put the starting cell on a stack and paint it.
3. Pop a cell and inspect its four edge-neighbors.
4. Paint and push each neighbor that still has the old color.
5. When the stack is empty, return the image.

## Correctness

The traversal starts at the required cell and only enters cells with the old color, so every painted cell belongs to the connected region. Every cell in that region is reachable through a chain of edge-neighbors with the old color, so the traversal eventually visits all of them. Painting a cell when it is pushed prevents duplicates from being explored.

## Complexity

- Time: `O(m * n)` in the worst case.
- Space: `O(m * n)` for the explicit stack.

## Common mistakes

- Forgetting the old-color-equals-new-color guard, causing an endless loop.
- Visiting diagonals.
- Reading outside the grid.
- Painting a cell only after exploring it, which allows repeated visits.
