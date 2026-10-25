# Explanation

## Key insight

The network is an undirected graph, and each cluster is a connected component. Counting components means finding every computer that has not been reached by an earlier traversal.

## Algorithm

1. Create a `visited` array of length `n`, all false.
2. Set `clusters = 0`.
3. For each computer from `0` to `n - 1`:
   - If it is already visited, skip it.
   - Otherwise increment `clusters`, mark it visited, and run a stack-based traversal.
   - From each explored computer, push every unvisited column with a direct link, marking it visited when pushed.
4. Return `clusters`.

## Correctness

Each traversal starts at a computer no earlier traversal could reach, so it begins a new component. The traversal follows every direct link recursively, so it reaches exactly the computers in that component; links cannot cross between components by definition. Every computer is eventually considered, and exactly one traversal runs per component. Therefore the count equals the number of clusters.

## Complexity

- Time: `O(n^2)`, because every traversal may scan an entire matrix row, and the matrix has `n^2` entries.
- Space: `O(n)` for the visited array and the stack.

## Common mistakes

- Counting `1` cells instead of components.
- Stopping after direct neighbors and missing transitive links.
- Marking neighbors only when popping them, which can push the same computer many times.
- Forgetting that an isolated computer is still a cluster.
