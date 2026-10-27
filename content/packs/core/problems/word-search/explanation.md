# Explanation

## Key insight

A word matches a path in the grid graph. Depth-first search with backtracking explores every possible path while preventing a cell from being reused.

## Algorithm

1. Convert the board to mutable rows.
2. Try each cell as the start of the word.
3. At each step, check bounds and the expected letter.
4. Mark the cell, recurse to four neighbors, then restore it.
5. Return true as soon as the whole word is matched.

## Correctness

The recursion maintains the invariant that the current path matches the prefix ending at the current cell, and every cell on the path is marked. Trying all neighbors covers every possible continuation. Restoring the cell keeps sibling branches independent. Thus the search finds a valid path exactly when one exists.

## Complexity

- Time: `O(m * n * 4^L)` in the worst case.
- Space: `O(L)` for the recursion path.

## Common mistakes

- Allowing diagonal moves.
- Forgetting to restore a cell after backtracking.
- Starting only from the top-left cell.
- Reusing a cell within one path.

## Related pattern

The same grid backtracking solves maze and island-counting variants.
