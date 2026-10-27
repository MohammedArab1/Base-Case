# Explanation

## Key insight

Level order is breadth-first order. Processing one complete level at a time keeps the output grouped correctly.

## Algorithm

1. Start with the root in a current-level list, or return `[]` when the tree is empty.
2. For each level, record node values in left-to-right order.
3. Collect existing children into the next-level list.
4. Append the value list to the result and continue.

## Correctness

At the start of each iteration, `current` contains exactly the nodes at one depth, in left-to-right order. Recording their values and collecting left then right children produces the next depth in the same order. By induction, every level is complete and correctly ordered.

## Complexity

- Time: `O(n)`.
- Space: `O(n)` for the widest level and the output.

## Common mistakes

- Mixing nodes from different depths in one list.
- Appending children in right-to-left order.
- Returning `[[]]` for an empty tree instead of `[]`.

## Related pattern

The same level-by-level loop supports right-side views and zigzag traversal.
