# Explanation

## Key insight

The ancestors of a node form the path from that node to the root. The lowest common ancestor is the first node on the second path that also lies on the first path.

## Algorithm

1. Traverse the tree and record each node's parent by value.
2. Walk from `first` to the root, collecting values.
3. Walk from `second` upward until reaching a collected value.
4. Return that value.

## Correctness

The traversal records the true parent of every node, so the upward walks follow the actual paths to the root. The first shared value encountered from `second` is the deepest common ancestor, because any deeper shared node would have been reached earlier. Both values exist, so the walks always meet.

## Complexity

- Time: `O(n)`.
- Space: `O(n)` for the parent table and ancestor set.

## Common mistakes

- Assuming binary-search-tree ordering.
- Returning the root without checking for a deeper common ancestor.
- Forgetting that one value may be the ancestor of the other.

## Related pattern

Binary lifting extends parent links to answer many ancestor queries quickly.
