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
Input: board = ["STAR","PONE","LIGH"], word = "STAR"
Output: true
```

**Example 2**

```
Input: board = ["STAR","PONE","LIGH"], word = "STONE"
Output: true
```

The path is `S -> T -> O -> N -> E`.

**Example 3**

```
Input: board = ["STAR","PONE","LIGH"], word = "PONG"
Output: true
```

**Example 4**

```
Input: board = ["STAR","PONE","LIGH"], word = "RATS"
Output: true
```

The word can run right-to-left along the top row.

**Example 5**

```
Input: board = ["STAR","PONE","LIGH"], word = "STONED"
Output: false
```

The board has no `D`.

## Constraints

- `1 <= board.length, board[0].length <= 6`
- All board rows have the same length.
- `1 <= word.length <= 15`
- Both the board and the word contain only uppercase English letters.

## Follow-up

How would a trie help if you needed to search many words on the same board?
