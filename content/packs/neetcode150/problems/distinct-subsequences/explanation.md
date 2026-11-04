# Explanation

## Approach

Let `dp[i][j]` be the number of ways to form the first `j` characters of `t` from the first `i` characters of `s`.

For the last source character `s[i-1]` there are two possibilities:

- Delete it. The number of ways is `dp[i-1][j]`.
- Keep it as the final matched character, but only if it equals `t[j-1]`. Then the remaining work is `dp[i-1][j-1]`.

Thus `dp[i][j] = dp[i-1][j] + (s[i-1] == t[j-1] ? dp[i-1][j-1] : 0)`. The empty target has exactly one construction, so `dp[i][0] = 1` for every `i`.

Only the previous row is needed. The implementation copies the row or processes it so that each source character contributes at most once.

## Correctness

Every way to form `t` from the first `i` source characters either deletes the last source character or uses it. These cases are disjoint and exhaustive. If the last character is deleted, the count is the number of ways using the first `i - 1` characters. If it is used, it must equal the last target character, and the rest is a way to form the target prefix from the first `i - 1` characters. The recurrence counts both exactly, and the base cases match the empty target. Induction proves the table.

## Complexity

- Time: `O(|s| * |t|)`.
- Space: `O(|t|)` with a rolling row.

## Common mistakes

- Counting unique resulting strings instead of distinct deletion choices.
- Forgetting the empty-target base case of 1.
- Adding the match transition even when the characters differ.
- Using the updated current row's diagonal instead of the previous row's diagonal.
