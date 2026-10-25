# Explanation

## Key insight

A substring with no repeated characters can be maintained as a sliding window. When a character repeats inside the window, the left edge jumps to one position after the previous occurrence of that character.

## Why checking every substring is too slow

There are `O(n²)` substrings, and checking each one for duplicates can add another factor. With `n = 100,000`, that is far too many.

## Algorithm

1. Create a map from character to its most recent index.
2. Keep a left pointer at the start of the current window.
3. For each right index:
   - Look up the character's previous index.
   - If that index is at or after the left pointer, move the left pointer to `previous + 1`.
   - Record the current index as the character's most recent position.
   - Update the best length with `right - left + 1`.
4. Return the best length.

## Correctness

At every step, the window `text[left..right]` contains no repeated character. When a repeat would occur, moving `left` past the previous occurrence removes the only conflicting character while keeping the rest of the window valid. Any longer valid substring ending at `right` must start after that previous occurrence, so the new left pointer is the earliest valid start. Therefore the largest window seen is the longest unique substring.

## Complexity

- Time: `O(n)`, because each index is visited once and the left pointer only moves forward.
- Space: `O(k)`, where `k` is the number of distinct characters in the alphabet.

## Common mistakes

- Setting `left = previous` instead of `previous + 1`, which keeps the repeated character in the window.
- Moving `left` backwards when a repeat is outside the current window.
- Using a set and removing characters one at a time; it works, but the last-seen map is simpler and faster.
