# Explanation

## Key insight

An anagram of `pattern` must have the same length, so the problem reduces to checking every fixed-size window in one pass.

## Algorithm

1. Return `[]` when the pattern is longer than the source.
2. Count the pattern letters and the first window.
3. Compare the tables and record index zero if they match.
4. Slide the window one position at a time, adding the new letter and removing the old one.
5. Record each matching start index.

## Correctness

At every step, the window table represents exactly the substring of length `pattern.length` starting at the recorded index. Comparing tables checks the anagram condition. Every possible window is examined once, so the output contains exactly all valid starting indices.

## Complexity

- Time: `O(n)`.
- Space: `O(1)` for 26-letter tables.

## Common mistakes

- Using a window of the wrong length.
- Forgetting to remove the leaving character.
- Returning indices in the wrong order.
- Re-sorting every window.

## Related pattern

The same fixed-size window finds permutations and substring matches.
