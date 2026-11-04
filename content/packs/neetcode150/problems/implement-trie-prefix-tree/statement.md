# Prefix Tree Operations

A prefix tree stores a collection of words by sharing the characters of common prefixes. Each step down the tree consumes one character, and a marker records where a complete word ends.

You are given two arrays of equal length. `operations[i]` is one of `"insert"`, `"search"`, or `"startsWith"`, and `words[i]` is the word or prefix used by that operation.

- `"insert"` adds `words[i]` to the collection. Inserting the same word twice has no extra effect.
- `"search"` reports whether the exact word `words[i]` is stored.
- `"startsWith"` reports whether at least one stored word begins with `words[i]`.

Return one boolean for every operation, in order. An `"insert"` operation produces `true`.

## Input

- `operations`: a list of operation names.
- `words`: a list of lowercase words, with one entry per operation.

## Output

A list of booleans, one per operation.

## Examples

**Example 1**

```
Input: operations = ["insert", "search", "startsWith", "search"],
       words = ["harbor", "harbor", "har", "harbors"]
Output: [true, true, true, false]
```

`"harbor"` is stored and `"har"` is a prefix of it, but `"harbors"` is a longer word that was never inserted.

**Example 2**

```
Input: operations = ["insert", "insert", "search", "startsWith"],
       words = ["cascade", "cas", "cascade", "cask"]
Output: [true, true, true, false]
```

Both words are stored; `"cask"` would require an edge that does not exist.

**Example 3**

```
Input: operations = ["insert", "startsWith", "search", "insert"],
       words = ["bat", "ba", "bat", "bat"]
Output: [true, true, true, true]
```

The second insertion of `"bat"` is allowed and still reports `true`.

## Constraints

- `1 <= operations.length == words.length <= 1000`
- Every operation is one of the three names above.
- Every word and prefix contains only lowercase English letters and has length between 1 and 30.
