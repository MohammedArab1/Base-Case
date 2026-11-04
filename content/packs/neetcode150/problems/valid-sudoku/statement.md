# Sudoku Grid Check

A partially filled 9x9 grid contains the characters `'1'` through `'9'` and the character `'.'` for an empty cell. Decide whether the entries currently on the grid obey the usual Sudoku rules:

- A digit appears at most once in each row.
- A digit appears at most once in each column.
- A digit appears at most once in each of the nine 3x3 boxes.

Only the filled cells matter. The grid does not have to be complete, and it does not have to be solvable. Return `true` when no rule is broken.

## Input

- `board`: exactly 9 strings, each of length 9.

## Output

`true` if the current entries are consistent, otherwise `false`.

## Examples

**Example 1**

```
Input: board =
["1...5...9",
 ".5...9...",
 "...1...5.",
 "..3...7..",
 "....6....",
 "..8...2..",
 ".7...3...",
 "...2...6.",
 "9...4...1"]
Output: true
```

Every filled digit is alone in its row, column, and box.

**Example 2**

```
Input: board =
["1...1....",
 ".........",
 ".........",
 ".........",
 ".........",
 ".........",
 ".........",
 ".........",
 "........."]
Output: false
```

The first row contains two `1`s.

**Example 3**

```
Input: board =
["1........",
 ".........",
 ".........",
 ".........",
 "1........",
 ".........",
 ".........",
 ".........",
 "........."]
Output: false
```

The first column contains two `1`s.

**Example 4**

```
Input: board =
["1........",
 ".........",
 "..1......",
 ".........",
 ".........",
 ".........",
 ".........",
 ".........",
 "........."]
Output: false
```

The two `1`s share the top-left 3x3 box.

## Constraints

- `board.length == 9`
- `board[i].length == 9` for every row.
- Each character is a digit from `'1'` to `'9'` or `'.'`.

## Follow-up

Can you express the three checks with 27 bitmasks?
