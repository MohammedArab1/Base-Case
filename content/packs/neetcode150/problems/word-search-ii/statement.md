# Board Word Harvest

You are given a rectangular board of lowercase letters and a list of distinct candidate words. A candidate can be harvested when its letters can be traced through cells that move only up, down, left, or right. A single candidate may not use the same cell twice, but different candidates may reuse cells freely.

Return every harvestable candidate in lexicographic order, with each word appearing once.

## Input

- `board`: a rectangular list of rows, where each cell is a lowercase letter.
- `words`: a list of distinct candidate words.

## Output

The harvestable words in lexicographic order.

## Examples

**Example 1**

```
Input: board = [
  ["c", "a", "t"],
  ["o", "a", "t"],
  ["d", "o", "g"]
], words = ["cat", "dog", "coat", "goat", "act"]
Output: ["cat", "coat", "dog", "goat"]
```

`"coat"` can follow `c-o-a-t` along the left side and through the middle. `"act"` would need a diagonal move or a reused cell.

**Example 2**

```
Input: board = [["a", "b", "c"]],
       words = ["abc", "ab", "bc", "abcd", "cba"]
Output: ["ab", "abc", "bc", "cba"]
```

**Example 3**

```
Input: board = [["a"]], words = ["a", "aa", "b"]
Output: ["a"]
```

## Constraints

- `1 <= board.length <= 8`
- `1 <= board[0].length <= 8`
- Every cell is a lowercase English letter.
- `0 <= words.length <= 12`
- Each candidate has length from 1 to 10 and contains lowercase English letters.
- Candidates are distinct.
