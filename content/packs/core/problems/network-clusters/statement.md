# Network Clusters

A network has `n` computers. The matrix `connected` describes direct links: `connected[i][j] == 1` means computer `i` is directly linked to computer `j`.

Links are undirected, and a cluster is a maximal group of computers reachable from one another through any number of links. Count the clusters. A computer with no links forms a cluster by itself.

## Input

- `connected`: an `n x n` symmetric matrix of `0` and `1` values. `connected[i][i]` is always `1`.

## Output

The number of connected clusters.

## Examples

**Example 1**

```
Input: connected = [[1, 1, 0], [1, 1, 0], [0, 0, 1]]
Output: 2
```

Computers 0 and 1 form one cluster; computer 2 is alone.

**Example 2**

```
Input: connected = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
Output: 3
```

No computer is linked to another.

**Example 3**

```
Input: connected = [[1, 1, 1], [1, 1, 1], [1, 1, 1]]
Output: 1
```

Every computer is linked to every other.

**Example 4**

```
Input: connected = [[1]]
Output: 1
```

A single computer is one cluster.

**Example 5**

```
Input: connected = [[1, 0, 1], [0, 1, 0], [1, 0, 1]]
Output: 2
```

Computers 0 and 2 are directly linked, while 1 is separate.

## Constraints

- `1 <= n <= 1,000`
- `connected[i][j]` is `0` or `1`.
- `connected[i][j] == connected[j][i]`
- `connected[i][i] == 1`

## Follow-up

How would you maintain the cluster count efficiently as new links arrive?
