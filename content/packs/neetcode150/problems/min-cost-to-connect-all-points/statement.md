# Road Network Budget

A regional planner needs to connect every settlement with roads. Settlement `i` is at coordinates `points[i] = [x, y]`. A road between two settlements costs the Manhattan distance between them:

`|x1 - x2| + |y1 - y2|`

Roads can cross and there is no restriction on how many roads meet at a settlement. Return the minimum total road cost that makes the whole network connected.

## Input

- `points`: a list of coordinate pairs. Different settlements may share the same coordinates.

## Output

Return the minimum total Manhattan cost needed to connect all settlements into one component.

## Examples

**Example 1**

```
Input: points = [[0, 0], [3, 4], [6, 0]]
Output: 13
```

Join the first and third settlements for 6, then the first and second for 7, for a total of 13.

**Example 2**

```
Input: points = [[0, 0]]
Output: 0
```

A single settlement is already connected.

**Example 3**

```
Input: points = [[0, 0], [1, 0], [2, 0], [3, 0]]
Output: 3
```

Joining consecutive settlements costs 1 + 1 + 1 = 3.

**Example 4**

```
Input: points = [[1, 1], [1, 1], [4, 5]]
Output: 7
```

The two settlements at the same coordinates are joined for free; the third costs 7.

## Constraints

- `1 <= points.length <= 1,000`
- `-1,000,000 <= x, y <= 1,000,000`
- The minimum total cost fits in a signed 32-bit integer.

## Follow-up

Could you maintain the minimum spanning tree while settlements are inserted one at a time?
