# Explanation

## Approach

Work on a copy of the board. First mark every `"O"` that can reach the border. Seed a stack with all border cells containing `"O"`, then flood fill through orthogonal `"O"` neighbors, recording them as safe.

After the search, scan the board again. An `"O"` that is not safe cannot reach the border, so it belongs to an enclosed region and is changed to `"X"`. Safe cells and all `"X"` cells remain untouched.

## Correctness

The flood fill starts from every border `"O"` and follows every orthogonal `"O"` connection, so it marks exactly the union of regions that touch the border. Any unmarked `"O"` is therefore in a region with no border cell, which is exactly an enclosed region that must be captured. Flipping only those cells produces the required board and leaves every surviving region intact.

## Complexity

Let `R` and `C` be the board dimensions.

- Time: `O(R * C)`, since each cell is visited a constant number of times.
- Space: `O(R * C)` for the copied board, the safe markers, and the stack.

## Common mistakes

- Flipping a border-connected region because only its interior was checked.
- Treating diagonal connections as connected.
- Modifying the caller's board instead of returning a new one.
- Starting the flood fill from only one border side.
- Flipping `X` cells back to `O`.
