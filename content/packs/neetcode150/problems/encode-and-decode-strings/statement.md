# Reversible String Codec

Design a codec for lists of strings. Instead of exposing two separate methods, the judge sends a log of encode and decode operations to a single function.

The encoding format is fixed so that every correct implementation produces the same text:

- Encode each word as its length in decimal, then `'#'`, then the word itself.
- Concatenate the pieces in order.
- Add no other separators.

For example:

```
[]                  -> ""
["a"]               -> "1#a"
["", "xy"]          -> "0#2#xy"
["a#b", "12"]       -> "3#a#b2#12"
```

The length prefix makes the format reversible even when a word contains `'#'`, digits, or spaces: the decoder knows exactly how many characters to read after each prefix.

## Function

`runCodec(operations: string[], arguments: string[][]): string[][]`

- `operations[i]` is either `"encode"` or `"decode"`.
- For `"encode"`, `arguments[i]` is the list of words. The operation's result is a one-element list containing the encoded string.
- For `"decode"`, `arguments[i]` contains exactly one valid encoded string. The operation's result is the list of decoded words.
- Return the per-operation results in the same order as `operations`.

## Examples

**Example 1**

```
Input:
operations = ["encode", "decode"]
arguments = [["a#b", "", "12"], ["3#a#b0#2#12"]]
Output: [["3#a#b0#2#12"], ["a#b", "", "12"]]
```

The first operation encodes the three words; the second decodes that exact text.

**Example 2**

```
Input:
operations = ["encode"]
arguments = [["hello world", "x"]]
Output: [["11#hello world1#x"]]
```

**Example 3**

```
Input:
operations = ["decode"]
arguments = [["1#a2#bc"]]
Output: [["a", "bc"]]
```

The decoder reads `1`, then one character, then `2`, then two characters.

**Example 4**

```
Input:
operations = ["encode", "decode", "encode"]
arguments = [[], [""], ["a", "b"]]
Output: [[""], [], ["1#a1#b"]]
```

The empty word list encodes to the empty string, and the empty string decodes to the empty word list.

## Constraints

- `1 <= operations.length <= 200`
- Every operation is `"encode"` or `"decode"`.
- An encode payload contains between 0 and 100 words.
- A decode payload contains exactly one well-formed encoded string.
- Every word and encoded string contains only printable ASCII characters (codes 32 through 126).
- The total number of characters across all payload strings is at most `20,000`.

## Follow-up

Can you decode a stream that arrives one small chunk at a time?
