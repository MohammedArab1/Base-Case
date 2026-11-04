# Letter Blocks

A lowercase string must be cut into the largest possible number of contiguous blocks such that no letter appears in more than one block. Every character must belong to exactly one block, and blocks must cover the string from left to right without gaps.

Return the length of each block in the order the blocks appear.

## Input

- `text`: a non-empty string of lowercase English letters.

## Output

An array of block lengths. The lengths are returned from the leftmost block to the rightmost block, and their sum equals `text.length`.

## Notes

- The ordering is canonical: left to right.
- A letter may appear many times inside a block; it simply may not appear in two different blocks.

## Examples

**Example 1**

```
Input: text = "abacdcbe"
Output: [7, 1]
```

**Example 2**

```
Input: text = "ababcc"
Output: [4, 2]
```

**Example 3**

```
Input: text = "a"
Output: [1]
```

**Example 4**

```
Input: text = "abcd"
Output: [1, 1, 1, 1]
```

## Constraints

- `1 <= text.length <= 10,000`
- `text` contains only lowercase English letters.

## Follow-up

How would you partition the string if every block also had to be sorted alphabetically?
