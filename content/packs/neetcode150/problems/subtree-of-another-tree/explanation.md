# Explanation

## Key insight

An embedded subtree must align exactly with a subtree rooted at some node of the larger tree. Therefore we can try every node as a candidate root and test structural equality.

## Algorithm

1. If `subRoot` is empty, return `true`.
2. If `root` is empty, return `false`.
3. Push the root onto a stack of candidate nodes.
4. Pop a candidate. If its subtree is identical to `subRoot`, return `true`. Otherwise push both children.
5. The equality helper uses a stack of node pairs and checks both null, one null, values, and both children.
6. If no candidate matched, return `false`.

## Correctness

The candidate stack eventually visits every node of `root`, so every possible subtree root is tested. For each candidate, the equality helper returns `true` exactly when the two trees have the same shape and values. Thus the overall function returns `true` exactly when at least one subtree of `root` is identical to `subRoot`. The empty cases follow directly from the definition.

## Complexity

- Time: `O(n * m)` in the worst case, where `n` is the size of `root` and `m` is the size of `subRoot`, because equality can be checked at every node.
- Space: `O(h)` for the traversal stacks, where `h` is the height of `root`.

## Common mistakes

- Checking only values along one traversal rather than exact subtree shape.
- Forgetting the empty-`subRoot` case.
- Matching a subtree that has extra descendants below it.
- Returning after the first node with a matching root value without checking the whole subtree.
- Using the wrong null convention for an empty input.
