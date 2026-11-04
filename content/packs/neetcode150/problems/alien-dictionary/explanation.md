# Explanation

## Approach

Compare each pair of adjacent words. At the first position where they differ, the character from the earlier word must precede the character from the later word. Add that directed edge to a graph whose vertices are the distinct letters. If one word is a prefix of the other, the shorter word must be the earlier one; if the longer word comes first, the input is invalid.

If the resulting graph has a cycle, no alphabet can satisfy all constraints. Otherwise, any topological order is a valid alphabet.

To get the lexicographically smallest order, run Kahn's algorithm with a min-heap: among all letters whose predecessors have already been placed, always take the smallest letter. This greedy choice is optimal because choosing a larger available letter would make the result larger at the first differing position, and the smaller letter can still be followed by any completion.

## Correctness

Every edge represents a necessary ordering constraint. A topological order respects every edge, so it is consistent with all adjacent comparisons. Conversely, any consistent alphabet must respect every edge, so it is a topological order.

If a cycle exists, the constraints require a letter to appear before itself, which is impossible. If a longer word precedes its prefix, no alphabet can make the shorter prefix come later, so returning the empty string is correct.

For minimality, suppose the greedy result and some valid order first differ at position `i`. The greedy algorithm chose the smallest letter with no remaining predecessors. The other order chose a larger available letter. Since the greedy letter can be moved to that position without violating edges, swapping it in produces a lexicographically smaller valid order, contradicting the assumed order's minimality.

## Complexity

- Let `L` be the total number of characters and `A` the number of distinct letters (`A <= 26`).
- Time: `O(L + A log A)` with a heap; the TypeScript version uses a linear scan over 26 letters and runs in `O(L + A^2)`.
- Space: `O(A + L)` for the graph and word storage.

## Common mistakes

- Checking all pairs of words instead of only adjacent pairs.
- Missing the invalid case where a longer word precedes its prefix.
- Returning a topological order that omits letters appearing only in later words.
- Producing any valid order instead of the lexicographically smallest one.
