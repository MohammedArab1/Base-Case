# Explanation

## Key insight

A prefix is segmentable if it can be split into a segmentable shorter prefix followed by one dictionary word. This gives a one-dimensional dynamic program.

## Algorithm

1. Create a boolean array of length `n + 1`; mark position zero reachable.
2. For each end position, try every possible start.
3. If the earlier prefix is reachable and the slice is a word, mark the end reachable.
4. Return whether the full length is reachable.

## Correctness

By induction, each marked position has a valid segmentation: the earlier prefix is valid by the induction hypothesis and the final slice is a dictionary word. Conversely, any valid segmentation ends with some word, so the position before that word is reachable and the transition marks the end. Thus the final position is marked exactly when the text is segmentable.

## Complexity

- Time: `O(n^2 * L)` in the worst case for slicing and hashing, or `O(n^2)` with bounded word lengths.
- Space: `O(n)`.

## Common mistakes

- Requiring each word to be used at most once.
- Forgetting to mark position zero.
- Using a greedy longest-prefix choice, which can fail.

## Related pattern

A trie or rolling hash can speed up the dictionary lookup.
