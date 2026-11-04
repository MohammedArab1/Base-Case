# Alien Alphabet Order

A field team recovered a list of words written in an unknown language. The words are claimed to be sorted from smallest to largest according to that language's alphabet, which uses a subset of the lowercase English letters.

Derive an ordering of every distinct letter that appears. If more than one ordering is consistent with the list, return the lexicographically smallest one. If the list cannot be sorted under any ordering, return an empty string.

A pair of adjacent words is consistent only if the first position where they differ has letters in the correct order. When one word is a prefix of the other, the shorter word must come first.

## Input

- `words`: a nonempty list of words, each made of lowercase English letters.

## Output

Return a string containing each distinct letter exactly once, in the lexicographically smallest order consistent with the list, or `""` if no such order exists.

## Examples

**Example 1**

```
Input: words = ["ba", "bc", "ac"]
Output: "bac"
```

The first two words force `a < c`, and the last two force `b < a`, so the only consistent order is `bac`.

**Example 2**

```
Input: words = ["abc", "abd", "acd"]
Output: "abcd"
```

The comparisons force `c < d` and `b < c`; putting `a` first gives the smallest valid order.

**Example 3**

```
Input: words = ["zebra", "zebra"]
Output: "aberz"
```

Equal words impose no constraint, so the letters may be arranged in ordinary sorted order.

**Example 4**

```
Input: words = ["mango", "man"]
Output: ""
```

The longer word `mango` appears before its prefix `man`, which is impossible in a sorted list.

## Constraints

- `1 <= words.length <= 100`
- `1 <= words[i].length <= 20`
- Every character is a lowercase English letter.
- The list may be inconsistent, including when a longer word appears immediately before its own prefix.

## Follow-up

How would you determine whether the derived ordering is unique without enumerating every topological order?
