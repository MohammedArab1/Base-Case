# Explanation

## Approach

Use a two-dimensional DP where `dp[i][j]` is true when the first `i` characters of `s` match the first `j` characters of `p`.

Initialize `dp[0][0] = true`. For an empty string, a pattern can match only if every piece is a starred element, so for each `j >= 2` with `p[j-1] == '*'`, copy `dp[0][j-2]`.

For general `i` and `j`:

- If `p[j-1]` is `*`, the starred element may match zero characters, giving `dp[i][j-2]`. It may also match one more character when the character before the star matches `s[i-1]` (or is `.`), giving `dp[i-1][j]`.
- Otherwise, if `p[j-1]` matches `s[i-1]`, the state is `dp[i-1][j-1]`.

The answer is `dp[len(s)][len(p)]`.

## Correctness

Each DP state considers the last pattern element and the last consumed string character. For an ordinary element, matching requires the characters to agree and the remaining prefixes to match. For a starred element, there are exactly two possibilities: use zero copies of the element, or consume one string character that the element matches and continue using the same pattern position. These cases are exhaustive and disjoint, so the recurrence is correct. The empty-string initialization handles patterns made entirely of starred elements. Induction on `i + j` proves every state.

## Complexity

- Time: `O(m * n)` for string length `m` and pattern length `n`.
- Space: `O(m * n)` for the table.

## Common mistakes

- Letting `*` match the character after it instead of the character before it.
- Treating `*` as matching any character rather than a repetition of the preceding element.
- Forgetting the zero-copy case `dp[i][j-2]`.
- Matching only a prefix of `s` instead of the entire string.
