# Explanation

## Approach

Let `possible[i][j]` be true when the first `i` characters of `first` and the first `j` characters of `second` can be woven into the first `i + j` characters of `woven`. The answer is `possible[m][n]`, provided the lengths match.

Initialize `possible[0][0] = true`. The first row and column are built by consuming only one thread. For `i, j >= 1`, the last character of the candidate prefix comes from one of the two threads:

- If it equals `first[i - 1]` and `possible[i - 1][j]` is true, the prefix is feasible.
- If it equals `second[j - 1]` and `possible[i][j - 1]` is true, the prefix is feasible.

The implementation stores only the previous row and the current row, since each state depends on the cell above and the cell to its left.

## Correctness

Every interleaving of the two prefixes ends with either the last character of `first[:i]` or the last character of `second[:j]`, because the final character appended came from one of those threads. If it came from `first`, the remaining characters must interleave `first[:i-1]` and `second[:j]`, which is exactly `possible[i - 1][j]`; the symmetric argument applies to `second`. Conversely, appending a matching final character to a feasible shorter interleaving produces a feasible longer one. Therefore the recurrence is both necessary and sufficient. The base cases cover empty prefixes, and induction over `i + j` proves every table entry. Since length equality is checked first, `possible[m][n]` answers the original question.

## Complexity

- Time: `O(m * n)`, where `m` and `n` are the lengths of the two threads.
- Space: `O(n)` using rolling rows for the shorter inner dimension.

## Common mistakes

- Forgetting to reject candidates whose length differs from the sum of the thread lengths.
- Using a greedy two-pointer choice when both next characters match; the wrong choice can lead to a dead end even though another choice succeeds.
- Mishandling the empty-thread row or column.
- Using the wrong character index because the table is one-based while the strings are zero-based.

## Related pattern

Prefix-pair feasibility DP also appears in edit distance, wildcard matching, and shortest common supersequence problems.
