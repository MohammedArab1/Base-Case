# Explanation

## Key insight

A deep copy needs a correspondence between every original node and its new node. Once that correspondence exists, both `next` and back-reference links can be translated from the original structure to the copied structure.

## Algorithm

1. If the input is empty, return an empty list.
2. Create one new node for each label, in chain order, and link them with `next`.
3. Build a map from each original node to its corresponding copy.
4. For each original node, set the copy's back-reference to the map value of the original's back-reference target, if it has one.
5. Walk the copied chain and record each node's label and the position of its back-reference target, or `-1`.
6. Return the pairs.

## Correctness

Every original node has exactly one copy because one copy is created per position. The `next` links reproduce the original order. For each back-reference, the map translates the original target to the unique corresponding copy, so the copy's reference points to the same relative position as the original's. Since all links use copied nodes, the result is independent of the original chain. The output pairs list exactly those copied nodes in order.

## Complexity

- Time: `O(n)`, with a constant amount of work per node.
- Space: `O(n)` for the copied nodes and the mapping.

## Common mistakes

- Reusing original nodes instead of creating fresh ones.
- Setting a back-reference before the target copy exists.
- Forgetting that a back-reference may be `null` (`-1`).
- Losing the tail of the copied chain while linking.
- Mapping a back-reference to the original node instead of its copy.
