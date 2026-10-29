# Trees and Traversals

A tree is a set of nodes connected by edges, with one root and no cycles.

```text
        A
       / \
      B   C
     / \   \
    D   E   F
```

- `A` is the **root**.
- `D`, `E`, and `F` are **leaves**.
- The **depth** of `D` is 2. The **height** of the tree is 2 (the longest path from root to leaf).
- `B` is the parent of `D` and `E`.

Each node can be visited in a different order. The order changes which questions are easy.

## Three depth-first orders

```text
        A
       / \
      B   C
     / \   \
    D   E   F
```

**Preorder**: visit the node before its children.

```text
A, B, D, E, C, F
```

Use it to copy a tree or write a prefix expression.

**Inorder**: visit the left subtree, then the node, then the right subtree.

```text
D, B, E, A, C, F
```

On a binary search tree, inorder gives sorted order.

**Postorder**: visit the children before the node.

```text
D, E, B, F, C, A
```

Use it when a parent depends on the results from its children, such as computing heights or freeing memory.

All three are `O(n)` time. The recursion stack uses `O(h)` space, where `h` is the height.

## Level order

Level order visits one row at a time:

```text
A
B, C
D, E, F
```

Use a queue:

```text
queue = [root]

while queue is not empty:
    node = dequeue()
    visit node
    enqueue left child if present
    enqueue right child if present
```

To know where one level ends, capture the queue length before processing that level. **Level Lines** uses exactly this.

## A recursive template

Most tree problems fit this shape:

```text
solve(node):
    if node is null:
        return base value

    left = solve(node.left)
    right = solve(node.right)

    answer at this node = combine(node.value, left, right)
    return answer
```

The interesting part is what `combine` does.

- **Tree Depth**: return `1 + max(left, right)`.
- **Flip Tree**: swap the children, then recurse.
- **Symmetric Branches**: compare the left subtree with the mirror of the right subtree.
- **Height Balance**: return the height, but signal failure if the two sides differ by more than one.

## Paths that do not go through the root

**Tree Diameter** asks for the longest path between any two nodes. The path may pass through a node without using both of its children in the value returned to the parent.

At each node:

```text
best through this node = left_height + right_height
return value to parent = 1 + max(left_height, right_height)
```

Keep the best `left + right` seen anywhere in a variable outside the recursion. The returned value describes a single branch; the global value describes the complete path.

## Reading a tree from a list

A level-order list uses `null` for a missing child:

```text
[4, 2, 7, 1, 3, 6, 9]

        4
       / \
      2   7
     / \ / \
    1  3 6  9
```

To reconstruct a tree from traversals, read the root from preorder, split the inorder list into left and right subtrees, and recurse. **Tree Rebuild** is the exercise for that. A level-order list is only the judge's input encoding; it is not the traversal used for reconstruction.

## The first question to ask

> "Is this a binary tree, a binary search tree, or a general tree?"

A binary tree limits each node to two children. A binary search tree adds an ordering rule. A general tree can have any number of children. The ordering rule is the difference between an `O(n)` search and an `O(log n)` one.
