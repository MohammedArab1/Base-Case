# Explanation

## Key insight

The search-tree ordering turns the problem into finding the first node whose value lies between the two targets, inclusive. Below that node both targets cannot remain on the same side.

## Algorithm

1. Start at the root.
2. If both targets are smaller than the current value, descend left.
3. If both are larger, descend right.
4. Otherwise return the current value.

## Correctness

While both targets are smaller, every searched node is larger than both, so the ancestor must be in the left subtree. The symmetric argument holds on the right. When the targets are not on the same side, one is in each subtree or the current node is one of the targets; in all of those cases the current node is the lowest common ancestor.

## Complexity

- Time: `O(h)`, where `h` is the tree height.
- Space: `O(1)`.

## Common mistakes

- Continuing to descend after the targets split.
- Handling only the case where both values are smaller.
- Forgetting that a target can equal the current node.

## Related pattern

The general binary-tree version needs a post-order search instead of the ordering.
