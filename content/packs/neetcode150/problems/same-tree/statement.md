# Tree Equality Check

Two binary trees are identical when they have the same shape and every pair of corresponding nodes holds the same integer. Given two roots, return `true` if the trees are identical and `false` otherwise.

Two empty trees are identical. A non-empty tree is never identical to an empty tree.

## Input

- `p`: the root of the first binary tree, or `null`.
- `q`: the root of the second binary tree, or `null`.

## Output

Return `true` if the trees are identical, otherwise `false`.

## Examples

**Example 1**

```
Input: p = [2, 7, 9], q = [2, 7, 9]
Output: true
```

**Example 2**

```
Input: p = [2, 7], q = [2, null, 7]
Output: false
```

**Example 3**

```
Input: p = [], q = []
Output: true
```

**Example 4**

```
Input: p = [2, 7, 7], q = [2, 7]
Output: false
```

## Constraints

- `0 <= number of nodes <= 10,000` in each tree
- `-1,000,000,000 <= node value <= 1,000,000,000`

## Follow-up

Can you compare the trees without recursion? What auxiliary data structure would you need?
