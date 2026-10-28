# Matrix Traversal

A matrix is a grid stored as rows.

```text
grid = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
]

grid[row][column]

grid[1][2] = 6
```

Rows come first. Writing `grid[column][row]` works on a square matrix and then silently breaks on a rectangle. Keep the order consistent.

## Bounds checks

Before moving to a neighbor, confirm it is inside the grid.

```text
next_row = row + dr
next_col = col + dc

inside =
    0 <= next_row < rows and
    0 <= next_col < cols
```

A direction array keeps the movement clean:

```text
directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]

for dr, dc in directions:
    nr = row + dr
    nc = col + dc
    if inside(nr, nc):
        visit(nr, nc)
```

## Spiral order

Spiral traversal peels the matrix like an onion.

```text
1 2 3
4 5 6
7 8 9

top row:    1 2 3
right col:  6 9
bottom row: 8 7
left col:   4
inner:      5

result: 1 2 3 6 9 8 7 4 5
```

Keep four boundaries:

```text
top = 0
bottom = rows - 1
left = 0
right = cols - 1
```

After walking the top row, increment `top`. After the right column, decrement `right`, and so on. Stop when `top > bottom` or `left > right`. Test single-row and single-column grids; that is where boundary code usually breaks.

## Grid BFS

For shortest distances or spreading processes, treat each cell as a node and use a queue.

```text
queue = [start]
visited = {start}

while queue:
    row, col = dequeue()
    for each neighbor:
        if inside and not visited and passable:
            visited.add(neighbor)
            enqueue(neighbor)
```

**Orange Rot** starts with every rotten orange in the queue at once. Each BFS level is one minute. **Nearest Zero** starts with every zero, because each zero is a source of the same distance wave. **Paint Fill** uses DFS or BFS to recolor a connected region.

## Grid dynamic programming

Some grid problems ask for the number of paths from the top-left to the bottom-right.

```text
1 1 1
1 2 3
1 3 6
```

Each cell's count is the sum of the cell above and the cell to the left. The first row and first column are all 1 because there is only one path along an edge. **Path Count** is this pattern.

If you only need the previous row, keep one array and update it in place. That reduces space from `O(rows * cols)` to `O(cols)`.

## Word search

**Word Search** combines grid traversal with backtracking. From each cell, try to match the first character, then explore the four neighbors for the next character. Mark the current cell as used so the path cannot reuse it, and unmark it when you backtrack.

The board is the graph; the word is the path constraint.

## The matrix checklist

1. Is it square or rectangular?
2. Are moves four-directional or eight-directional?
3. May I modify the grid in place, or do I need a visited set?
4. Is this BFS for distance, DFS for regions, or DP for counts?

Answer those before writing the nested loops.
