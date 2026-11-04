# Explanation

## Key insight

Not every string with `n` of each parenthesis is valid. The balance, meaning openings minus closings, must stay non-negative at every prefix. Backtracking can build the string one character at a time while enforcing that invariant, so invalid prefixes are never explored.

## Algorithm

1. Keep a `path` of characters, a count of openings used, and a count of closings used.
2. If `len(path) == 2n`, record the joined string.
3. Otherwise:
   - If fewer than `n` openings are used, append `'('` and recurse.
   - If fewer closings than openings are used, append `')'` and recurse.
4. Undo each choice after its recursive call.
5. Sort the recorded strings lexicographically.

## Correctness

Every recorded string has exactly `n` openings (the first rule caps openings at `n`, and the length is `2n`) and therefore exactly `n` closings. The second rule only allows a closing parenthesis when an unmatched opening exists, so every prefix has at least as many openings as closings. Thus every recorded string is valid.

Conversely, take any valid string. Reading it left to right, each `'('` occurs when fewer than `n` openings have appeared (otherwise the total would exceed `n`), and each `')'` occurs when closings are still below openings (otherwise the prefix would be invalid). The recursion can therefore follow the string exactly, so the string is recorded. Sorting then gives the required order.

## Complexity

Let `C_n` be the `n`th Catalan number, the number of valid strings.

- There are `C_n` leaves.
- Each leaf copies a string of length `2n`.
- Time: `O(C_n * n)` including the final sort, which is dominated by the output size for the given limits.
- Space: `O(n)` for the recursion path and call stack, plus `O(C_n * n)` for the returned strings.

## Common mistakes

- Allowing `')'` whenever closings are below `n`, which permits invalid prefixes such as `")("`.
- Allowing openings beyond `n`.
- Forgetting to undo the last character after a recursive call, which corrupts sibling branches.
- Recording partial strings instead of waiting for length `2n`.
- Returning `[]` for `n = 0` rather than `[""]`.
- Returning recursion order without confirming it is lexicographic. The statement requires lexical order, so sorting is the safest choice.
