# Explanation

## Key insight

Checking only a node against its children is not enough. A value deep in a left subtree must be smaller than every ancestor for which that subtree is on the left, not just smaller than its parent. Carrying an allowed open interval down the recursion captures all of those constraints at once.

## Algorithm

1. Start with the interval `(-infinity, +infinity)`.
2. For each node, reject it if its value is less than or equal to the lower bound, or greater than or equal to the upper bound.
3. Recurse left with the same lower bound and the node's value as the new upper bound.
4. Recurse right with the node's value as the new lower bound and the same upper bound.
5. An empty subtree is valid.

## Correctness

The interval at a node is exactly the set of values that would satisfy every ancestor relationship on the path to that node. A value outside the interval violates at least one ancestor's ordering rule. A value inside it satisfies all of them. Recursing with narrowed bounds therefore checks every node against every applicable constraint, and the tree is valid exactly when no node is rejected.

## Complexity

- Time: `O(n)`, because each node is visited once.
- Space: `O(h)` for the recursion stack, where `h` is the tree height; `O(n)` in the worst case.

## Common mistakes

- Comparing only with the immediate parent.
- Using `<=` and `>=` in a way that accepts duplicates.
- Using a fixed integer for infinity and colliding with a real node value.
- Treating an empty tree as invalid.
