# Explanation

## Approach

Build an adjacency list from the directed links and run Dijkstra's algorithm from node `k`. Distances start at infinity except `dist[k] = 0`.

On each round, choose the unvisited node with the smallest tentative distance, mark it settled, and relax every outgoing link. Because all travel times are nonnegative, once a node is settled its distance is final.

After the search, the broadcast reaches every node only if no distance is infinite. The required time is the maximum shortest distance, because all nodes receive the signal in parallel and the last one determines the completion time.

## Correctness

Dijkstra's algorithm maintains the invariant that every settled node has its true shortest distance. When the smallest tentative node is chosen, any alternative path to it would have to leave the unsettled set and already cost at least the tentative value, so no smaller path exists. Relaxing outgoing links therefore discovers every shortest route.

At termination, `dist[v]` is the earliest arrival time at `v`. The maximum over all nodes is exactly the first moment at which every node has received the signal, and an infinite value means the broadcast never reaches all nodes.

## Complexity

- Time: `O((V + E) log V)` with a binary heap. The TypeScript version uses a linear scan to find the minimum and runs in `O(V^2 + E)`.
- Space: `O(V + E)` for the distance array and adjacency list.

## Common mistakes

- Treating links as undirected.
- Counting the starting node as unreachable when `n = 1`.
- Returning the distance to one node instead of the maximum distance.
- Letting a stale heap entry overwrite a better distance.
