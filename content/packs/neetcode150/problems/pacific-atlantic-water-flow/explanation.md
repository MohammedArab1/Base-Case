# Explanation

## Approach

Run a reverse flow search from each ocean. The Pacific search starts at every cell in the top row or left column. The Atlantic search starts at every cell in the bottom row or right column. A reverse search may step to a neighbor whose height is greater than or equal to the current height, because water could have flowed from that higher neighbor into the current cell.

Each search marks its reachable cells. A cell drains to both oceans exactly when it is marked by both searches. Iterating cells in row-major order gives the required sorted output.

## Correctness

If a reverse search reaches a cell, there is a path from that cell to the ocean where every step goes to an equal or lower height, which is precisely a valid downhill drainage path. Conversely, any valid drainage path can be followed backward by the reverse search from the border, so every draining cell is marked. Applying this argument to both oceans shows that the intersection contains exactly the cells that drain to both. Row-major scanning produces the specified order.

## Complexity

Let `R` and `C` be the grid dimensions.

- Time: `O(R * C)`, because each ocean search visits each cell at most once.
- Space: `O(R * C)` for the two visited grids and the stacks.

## Common mistakes

- Reversing the height comparison and allowing flow uphill.
- Starting a search from every cell instead of from the oceans.
- Forgetting that the top and left borders both belong to the Pacific, and the bottom and right borders to the Atlantic.
- Returning cells in discovery order instead of row-major order.
