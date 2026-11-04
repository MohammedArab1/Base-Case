# Best Route Through a Tree

A route in a binary tree is any simple path: a sequence of distinct nodes in which consecutive nodes share an edge. A route may start and end anywhere and does not have to pass through the root.

The score of a route is the sum of its node values. Given a non-empty tree, return the highest possible score. Values may be negative, and a route may consist of a single node.

## Input

- `root`: the root of a non-empty binary tree.

## Output

Return the maximum route score as an `int`.

## Examples

**Example 1**

```
Input: root = [1, 2, 3]
Output: 6
```

The best route is `2 -> 1 -> 3`.

**Example 2**

```
Input: root = [8, 4, 12, 2, 6, 10, 14]
Output: 44
```

The best route is `6 -> 4 -> 8 -> 12 -> 14`.

**Example 3**

```
Input: root = [-3]
Output: -3
```

**Example 4**

```
Input: root = [2, -1]
Output: 2
```

## Constraints

- `1 <= number of nodes <= 30,000`
- `-1,000 <= node value <= 1,000`

## Follow-up

Can you also return the nodes on the best route? What extra bookkeeping would that require?
