# Explanation

## Approach

Build a trie containing all candidates, then launch a depth-first search from each board cell. A search follows only edges that exist in the trie. Whenever the current trie node terminates a candidate, add that candidate to a set.

To prevent one trace from reusing a cell, replace the current cell with a temporary marker before exploring neighbors and restore it afterward. After all starting cells have been tried, sort the set of found words.

## Correctness

Any depth-first path follows trie edges and orthogonal board moves, and the temporary marker prevents repeated cells. Therefore every path corresponds to a valid board trace and spells a prefix of some candidate. Conversely, every valid trace follows a sequence of trie edges, so the search reaches the terminal node of that candidate. The set records precisely the candidates with at least one valid trace. Sorting yields the required lexicographic output.

## Complexity

Let `R` and `C` be the board dimensions, `W` the total length of all candidates, and `L` the longest candidate.

- Building the trie takes `O(W)` time and space.
- The search takes `O(R * C * 4^L)` time in the worst case, with trie pruning usually much faster.
- Recursion uses `O(L)` additional space, and the board is marked in place.

## Common mistakes

- Allowing diagonal moves.
- Reusing a cell in the same word.
- Stopping when a word is found and missing a longer word with the same prefix.
- Adding duplicate copies when a word has several traces.
- Forgetting to restore a cell after backtracking.
