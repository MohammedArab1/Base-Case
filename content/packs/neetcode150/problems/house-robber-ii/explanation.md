# Explanation

## Approach

The only difference from a straight row of rooms is the extra adjacency between the first and last rooms. Any valid selection must leave out at least one of those two rooms. Therefore the answer is the larger of:

1. the best selection from rooms `0` through `n - 2`, and
2. the best selection from rooms `1` through `n - 1`.

For a straight range, scan from left to right with two totals. `take` is the best total for the processed prefix when the current room is opened, and `skip` is the best total when it is not. For the next value `v`, opening it adds `v` to the previous `skip`; skipping it keeps the better of the previous `take` and `skip`. A single-room ring is handled separately because slicing would otherwise produce two empty ranges and lose the room's value.

## Correctness

Consider any valid selection around the ring. It cannot contain both the first and last room, so it omits the first room or the last room. Hence it is a valid selection for one of the two linear ranges above, and the maximum of those two range answers is at least the ring optimum. Conversely, every selection in either linear range is valid around the ring, so that maximum cannot exceed the ring optimum. The two values are equal.

For a linear range, the scan maintains the invariant that `take` and `skip` are the best totals for the processed prefix ending with the current room taken or skipped. The transition follows directly from the adjacency rule, so induction gives the best linear total.

## Complexity

- Time: `O(n)`, since the two linear scans together examine each room a constant number of times.
- Space: `O(1)`, aside from the input.

## Common mistakes

- Treating the ring as a straight row and allowing both end rooms.
- Forgetting the special case of a single room.
- Slicing with an off-by-one endpoint and dropping a room that should be considered.
- Building a quadratic table when two rolling totals are sufficient.

## Related pattern

The same "exclude one end of a cycle" trick appears in circular scheduling and circular path problems.
