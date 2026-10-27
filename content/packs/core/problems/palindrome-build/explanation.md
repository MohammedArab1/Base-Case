# Explanation

## Key insight

Every pair contributes two matching characters, one on each side. At most one unpaired character can occupy the center.

## Algorithm

1. Count each letter.
2. Add `count // 2` pairs for every letter.
3. Double the pair count.
4. Add one if any count is odd and a leftover character exists.

## Correctness

The mirrored structure of a palindrome requires characters to be consumed in pairs, so no more than `2 * pairs` characters can be placed off-center. Using all available pairs achieves that bound. An odd leftover can always be placed at the center without breaking symmetry. Thus the resulting length is maximal.

## Complexity

- Time: `O(n)`.
- Space: `O(1)` for 26 letter counts.

## Common mistakes

- Adding one for every odd count instead of at most one.
- Forgetting that an odd count still contributes its pairs.
- Returning zero for an empty string incorrectly when the problem allows it.

## Related pattern

Frequency counting also drives anagram and ransom-note problems.
