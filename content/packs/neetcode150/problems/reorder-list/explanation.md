# Explanation

## Key insight

The target order is an interleaving of the original first half and the reverse of the original second half. Splitting, reversing, and merging avoids random access and uses only pointer changes.

## Algorithm

1. If the chain has zero or one node, return it unchanged.
2. Move a slow pointer one step and a fast pointer two steps until the fast pointer cannot advance. The slow pointer ends at the last node of the first half.
3. Cut the chain after the slow pointer. Reverse the detached second half.
4. Merge the first half and the reversed second half by taking one node from each in turn. Stop when the reversed half is exhausted.
5. Return the original head.

## Correctness

The slow/fast traversal places the cut so that the first half contains `ceil(n / 2)` nodes and the second half contains `floor(n / 2)` nodes. Reversing the second half puts its nodes in reverse original order. The merge then emits first-half node 1, second-half last node, first-half node 2, second-half second-to-last node, and so on. When the second half is exhausted, the remaining first-half node (for odd `n`) is already linked at the end. This is exactly the required order, and no nodes are allocated.

## Complexity

- Time: `O(n)`, with one pass to find the midpoint, one to reverse, and one to merge.
- Space: `O(1)` extra space, because only pointers are rearranged.

## Common mistakes

- Cutting the chain at the wrong place for an even-length list.
- Forgetting to set the first half's tail to `null` before reversing.
- Losing the second half's next pointer while reversing.
- Continuing the merge after the second half is exhausted and creating a cycle.
- Returning the wrong head.
