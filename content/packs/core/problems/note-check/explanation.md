# Explanation

## Key insight

Composing a note is a multiset matching problem. The note can repeat a letter only as often as the source provides it.

## Algorithm

1. Return `false` if the note is longer than the source.
2. Count each letter in the source.
3. For each letter in the note, decrement its count; fail if it was already zero.
4. Return `true` after the whole note is consumed.

## Correctness

The counts begin as the multiset available in the source. Each note character consumes one matching unit. If any character cannot be consumed, the source lacks enough of that letter. If all characters are consumed, we have exhibited a valid matching, so the note can be composed.

## Complexity

- Time: `O(n + m)`, where `n` and `m` are the string lengths.
- Space: `O(1)` for the fixed 26-letter alphabet.

## Common mistakes

- Reusing one source letter for multiple note letters.
- Comparing lengths but not counts.

## Related pattern

This is the same frequency-table technique used for anagram matching.
