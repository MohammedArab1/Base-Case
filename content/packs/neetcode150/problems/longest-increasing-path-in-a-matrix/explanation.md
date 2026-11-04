# Explanation

## Approach

The cells form a directed acyclic graph: an edge goes from a cell to an adjacent cell with a strictly larger value. The answer is the longest path in this DAG.

Sort all cells by elevation. Process them from smallest to largest. When a cell is processed, every strictly smaller neighbor has already been processed and has its final best path length. Therefore:

`best[r][c] = max(1, best[neighbor] + 1 for every neighbor with a smaller value)`

The maximum value over all cells is the answer. Equal-valued neighbors are skipped because the path must be strictly increasing.

## Correctness

Every increasing path has a strictly increasing sequence of elevations, so its cells appear in the sorted processing order. When a cell is handled, the best path starting at each smaller neighbor is already known. Any increasing path starting at the cell must begin with one of those neighbors, so taking the maximum over all smaller neighbors finds the best path through the cell. Induction over the sorted order proves every `best` value is correct.

Conversely, each update extends a valid increasing path by one adjacent cell with a larger value, so no invalid path is created. The global maximum is therefore the longest increasing path.

## Complexity

- Time: `O(m * n log(m * n))` for sorting the cells, plus `O(m * n)` for the four-direction updates.
- Space: `O(m * n)` for the cell list, best table, and sorting storage.

## Common mistakes

- Allowing equal-valued neighbors in an increasing path.
- Reusing a cell in the same path; the strict elevation increase prevents cycles but the algorithm must still follow directed edges.
- Forgetting to consider all four directions.
- Using recursion without noticing that a long snake can exceed the call-stack limit.
