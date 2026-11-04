# Signal Propagation Time

A broadcast starts at node `k` in a directed network of `n` nodes, numbered `1` through `n`. Each link `times[i] = [u, v, w]` lets a signal travel from `u` to `v` and arrive `w` time units later.

A node can forward the signal as soon as it receives it, and any node may be used by several routes. Return the earliest time at which every node has received the signal. If some node can never be reached, return `-1`.

## Input

- `n`: the number of nodes.
- `times`: directed links in the form `[from, to, travelTime]`.
- `k`: the node where the broadcast begins.

## Output

Return the minimum time needed for all `n` nodes to receive the broadcast, or `-1` if at least one node remains unreachable.

## Examples

**Example 1**

```
Input: n = 4, times = [[2, 1, 1], [2, 3, 1], [3, 4, 2]], k = 2
Output: 3
```

Nodes 1 and 3 receive the signal at time 1, and node 4 receives it at time 3.

**Example 2**

```
Input: n = 3, times = [[1, 2, 5], [2, 3, 5]], k = 1
Output: 10
```

The signal travels 1 -> 2 in 5 units and 2 -> 3 in another 5.

**Example 3**

```
Input: n = 2, times = [], k = 1
Output: -1
```

Node 2 can never receive a signal from node 1.

**Example 4**

```
Input: n = 1, times = [], k = 1
Output: 0
```

The only node is already reached at time 0.

## Constraints

- `1 <= n <= 100`
- `0 <= times.length <= 6,000`
- `1 <= u, v, k <= n`
- `0 <= travelTime <= 1,000`
- Parallel links are allowed; the fastest one matters.

## Follow-up

How would you recover the actual route taken by the signal to each node?
