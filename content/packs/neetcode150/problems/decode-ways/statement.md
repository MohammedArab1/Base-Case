# Cipher Chunk Count

A coded message is a string of decimal digits. Each letter is represented by a number from `1` through `26`. To recover the message, split the digit string into one- or two-digit chunks, translate each chunk independently, and concatenate the resulting letters.

A chunk may not begin with `0`, so a one-digit chunk is valid only from `1` to `9`, and a two-digit chunk must be between `10` and `26`. Return the number of distinct valid ways to split the string.

## Input

- `digits`: the decimal digit string to split into cipher chunks.

## Output

The number of valid chunkings. Return `0` when no chunking is possible.

## Examples

**Example 1**

```
Input: digits = "231"
Output: 2
```

**Example 2**

```
Input: digits = "110"
Output: 1
```

**Example 3**

```
Input: digits = "101"
Output: 1
```

**Example 4**

```
Input: digits = "306"
Output: 0
```

## Constraints

- `1 <= digits.length <= 45`
- `digits` consists only of decimal digits.
- The answer fits in a signed 32-bit integer.
