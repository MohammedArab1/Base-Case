# Explanation

## Key insight

The last characters of the two strings determine the final operation. If they match, they can be left alone. If not, the last character of `source` must be deleted, the last character of `target` must be inserted, or the two must be replaced. Each choice leaves a smaller prefix problem of the same shape.

## Algorithm

Let `distance[i][j]` be the minimum edits to turn the first `i` characters of `source` into the first `j` characters of `target`.

1. `distance[0][j] = j`, because an empty source needs `j` insertions.
2. `distance[i][0] = i`, because a target of length zero needs `i` deletions.
3. For `i` from 1 to the source length and `j` from 1 to the target length:
   - If `source[i-1] == target[j-1]`, then `distance[i][j] = distance[i-1][j-1]`.
   - Otherwise, `distance[i][j] = 1 + min(distance[i-1][j], distance[i][j-1], distance[i-1][j-1])`.
4. Return `distance[source.length][target.length]`.

Only the previous row is needed, so the implementation keeps two one-dimensional arrays.

## Correctness

Every edit sequence ends by either deleting the last source character, inserting the last target character, or aligning the two last characters. If they are equal, replacing them is never better than leaving them alone, because a common last character can always be matched for free. Each recurrence branch corresponds to a valid first step of some optimal sequence on the remaining prefixes. By induction on the prefix lengths, the table value equals the true minimum.

## Complexity

- Time: `O(m * n)` for source length `m` and target length `n`.
- Space: `O(n)` with rolling rows.

## Common mistakes

- Forgetting the base cases for empty strings.
- Charging a replacement when the characters are equal.
- Mixing up insertion and deletion indices.
- Returning the bottom-right cell of the wrong row after overwriting it.
