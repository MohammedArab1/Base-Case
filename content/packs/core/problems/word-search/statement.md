# Word Search

A rectangular board contains uppercase letters. Decide whether `word` can be formed by moving horizontally or vertically between adjacent cells. Each cell may be used at most once per word.

## Input

- `board`: the board rows, each a string of equal length.
- `word`: the target word.

## Output

`true` if the word can be traced on the board, otherwise `false`.

## Examples

**Example 1**

```
Input: board = ["ABCE","SFCS","ADEE"], word = "ABCCED"
Output: true
```

**Example 2**

```
Input: board = ["ABCE","SFCS","ADEE"], word = "SEE"
Output: true
```

**Example 3**

```
Input: board = ["ABCE","SFCS","ADEE"], word = "ABCB"
Output: false
```

The letter `B` would have to be reused.

## Constraints

- `1 <= board.length, board[0].length <= 6`
- All board rows have the same length.
- `1 <= word.length <= 15`
- Both the board and the word contain only uppercase English letters.

## Follow-up

How would a trie help if you needed to search many words on the same board?
