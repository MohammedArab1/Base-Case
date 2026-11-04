# Distance to Nearest Gate

A rectangular building floor is described by a grid of rooms. Each cell is one of:

- `-1`: a wall, which cannot be entered.
- `0`: a gate.
- `2147483647`: an empty room.

For every empty room, compute the number of orthogonal steps in the shortest path to any gate, moving only through empty rooms and gates. Rooms that cannot reach a gate keep the value `2147483647`.

Return a new grid with the distances filled in. The input grid must not be modified.

## Input

- `rooms`: a rectangular grid using the three values described above.

## Output

The grid after replacing reachable empty rooms with their shortest gate distances.

## Examples

**Example 1**

```
Input: rooms = [
  [0, -1],
  [2147483647, 2147483647]
]
Output: [
  [0, -1],
  [1, 2]
]
```

**Example 2**

```
Input: rooms = [[2147483647, 2147483647, 2147483647]]
Output: [[2147483647, 2147483647, 2147483647]]
```

There is no gate, so nothing changes.

**Example 3**

```
Input: rooms = [[0]]
Output: [[0]]
```

## Constraints

- `0 <= rooms.length <= 50`
- `0 <= rooms[0].length <= 50`
- Every cell is `-1`, `0`, or `2147483647`.
- An empty grid produces an empty grid.

## Notes

Use the exact value `2147483647` for an unreachable empty room.
