# Binary Search Trees

A binary search tree (BST) is a binary tree with one extra rule:

> For every node, all values in the left subtree are smaller, and all values in the right subtree are larger.

```mermaid
flowchart TD
    N8["8"] --> N3["3"]
    N8 --> N10["10"]
    N3 --> N1["1"]
    N3 --> N6["6"]
    N10 --> N14["14"]
    N6 --> N4["4"]
    N6 --> N7["7"]
    N14 --> N13["13"]
```

This rule turns a search into a series of choices.

## Searching

```mermaid
flowchart TD
    F["find 7"] --> N8["8"]
    N8 -->|"7 < 8, go left"| N3["3"]
    N3 -->|"7 > 3, go right"| N6["6"]
    N6 -->|"7 > 6, go right"| N7["7 (found)"]
```

At each node you discard one entire subtree. If the tree is balanced, the height is about `log n`, so the search is `O(log n)`. If the tree is skewed, the height is `n`, and the search is `O(n)`.

```mermaid
flowchart TD
    subgraph BAL["balanced"]
        B4["4"] --> B2["2"]
        B4 --> B6["6"]
        B2 --> B1["1"]
        B2 --> B3["3"]
        B6 --> B5["5"]
        B6 --> B7["7"]
    end

    subgraph SKEW["skewed"]
        S1["1"] --> S2["2"]
        S2 --> S3["3"]
        S3 --> S4["4"]
    end
```

A BST is not automatically balanced. The insertion order decides the shape.

## Inorder is sorted

An inorder traversal visits left subtree, node, right subtree.

```text
1, 3, 4, 6, 7, 8, 10, 13, 14
```

For a valid BST, this sequence is sorted. That gives two useful facts:

- To collect values in order, use inorder.
- To check order, you can compare each visited value with the previous one.

## Validating a BST

The tempting check is "left child is smaller and right child is larger." That is not enough.

```mermaid
flowchart TD
    N10["10"] --> N5["5"]
    N10 --> N15["15"]
    N5 --> N3["3"]
    N5 --> N12["12"]
```

`12` is smaller than `15` and larger than `5`, but it is in the left subtree of `10`. It violates the rule.

Carry a range down the recursion:

```text
validate(node, low, high):
    if node is null: return true
    if node.value <= low or node.value >= high: return false
    return validate(node.left, low, node.value)
        and validate(node.right, node.value, high)
```

Every node must fit inside the range allowed by all of its ancestors. This is `O(n)` time and `O(h)` space.

## Finding the kth smallest

Inorder traversal visits values in ascending order. Count as you go and stop at `k`.

```text
inorder: 1, 3, 4, 6, ...
k = 3 -> answer 4
```

If the tree supports subtree sizes, you can skip whole subtrees:

```text
if left_size + 1 == k: return node.value
if k <= left_size: go left
else: k -= left_size + 1; go right
```

That is `O(h)` rather than `O(n)`.

## Deletion

Three cases:

1. **Leaf**: remove it.
2. **One child**: replace the node with that child.
3. **Two children**: find the smallest value in the right subtree (the successor), copy it into the node, then delete the successor from the right subtree.

The successor is the next value in sorted order, so replacing with it preserves the BST rule.

## The practical warning

A BST is useful when you need ordered operations and the tree stays reasonably balanced. In production, self-balancing variants such as AVL or red-black trees maintain `O(log n)` height. In an interview, say "assuming the tree is balanced" when you quote `O(log n)`, or state the height-based bound `O(h)`.
