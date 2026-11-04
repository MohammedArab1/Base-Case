# Explanation

## Key insight

A delimiter alone cannot separate arbitrary strings because the delimiter can occur inside a word. A length prefix removes the ambiguity: the decoder does not search for the end of a word, it reads a declared number of characters. The `'#'` only separates the decimal length from the word, and it is the first `'#'` after the current position.

## Encoding

For every word:

1. Convert its length to decimal.
2. Append `'#'`.
3. Append the word.

Concatenate those pieces. An empty word list produces the empty string; a single empty word produces `"0#"`.

## Decoding

1. Start at position `0`.
2. Find the next `'#'`; parse the digits before it as `size`.
3. The word starts just after the `'#'` and has exactly `size` characters.
4. Move past those characters and repeat until the string ends.

For example, `"3#a#b0#2#12"` is parsed as `"a#b"`, `""`, and `"12"`.

## Correctness

Encoding writes the exact length of each word, so the decoder always knows where that word ends even if the word contains digits or `'#'`. Decoding consumes every character exactly once and rebuilds the words in order. Therefore `decode(encode(words)) = words`. The output format is fully determined, so two correct encoders produce identical text.

## Complexity

Let `C` be the total number of characters processed across all operations.

- Time: `O(C)` for encoding and decoding. Each character is written or read a constant number of times.
- Space: `O(C)` for the encoded strings and the returned word lists.

The intermediate `parts` list during encoding is proportional to the number of words, which is also bounded by `C`.

## Common mistakes

- Joining words with a comma, space, or `'#'` and hoping the words never contain it.
- Omitting the prefix for an empty word; `""` inside a list is not the same as an empty list.
- Treating the encoded empty string as one empty word. It represents zero words; one empty word is `"0#"`.
- Splitting on `'#'` instead of using the declared length, which breaks on words that contain `'#'`.
- Returning a string where the operation result must be a list containing that string.
