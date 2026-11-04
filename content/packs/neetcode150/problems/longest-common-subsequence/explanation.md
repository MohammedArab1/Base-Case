# Explanation

## Approach

Let `common[i][j]` be the length of the longest common subsequence of `first[:i]` and `second[:j]`. The first row and column are zero because an empty string shares no characters.

For the remaining cells, compare the last characters:

- If they match, they can be placed at the end of a shared thread for the two shorter prefixes, so `common[i][j] = common[i - 1][j - 1] + 1`.
- If they differ, at least one of those last characters cannot be used at the end. The best answer is `max(common[i - 1][j], common[i][j - 1])`.

Only the previous row is needed, so the code keeps one array and fills a new row for each character of the first string. The shorter string is used for the row length to reduce memory.

## Correctness

For a matching pair of final characters, there is always an optimal common subsequence ending with that pair: if an optimal answer uses only one of them, swapping in the matching other character at the end preserves order and does not shorten it. Thus the diagonal transition is safe. When the characters differ, no common subsequence can use both as its final character, so it must omit the final character of at least one string, giving the two maximum terms. The base cases are correct because no characters can be shared with an empty prefix. Induction over the table dimensions proves every entry equals the true optimum.

## Complexity

- Time: `O(m * n)`, where `m` and `n` are the string lengths.
- Space: `O(min(m, n))` using a rolling row on the shorter string.

## Common mistakes

- Solving longest common substring instead of subsequence and requiring contiguity.
- Forgetting the zero row or column for empty prefixes.
- Using the diagonal value without adding one on a match.
- Updating an array in place so that values from the current row are confused with the previous row.

## Related pattern

Prefix-pair dynamic programming also appears in edit distance, wildcard matching, and interleaving problems.
