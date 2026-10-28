# Graphs, DFS, and BFS

A graph is a collection of nodes connected by edges. A tree is a special graph with no cycles and one path between any two nodes. A general graph can have loops, one-way edges, and disconnected pieces.

```text
A --- B --- C
|     |     |
D --- E     F
```

## Two common representations

**Adjacency list**: each node stores a list of neighbors.

```text
A: [B, D]
B: [A, C, E]
C: [B, F]
D: [A, E]
E: [B, D]
F: [C]
```

Space is `O(V + E)`. This is usually the right choice in an interview.

**Adjacency matrix**: a `V x V` table of booleans.

```text
    A B C D E F
A   0 1 0 1 0 0
B   1 0 1 0 1 0
...
```

Neighbor checks are `O(1)`, but the table uses `O(V²)` space, which is wasteful for sparse graphs.

## Depth-first search

DFS goes as deep as possible before backing up. Use recursion or an explicit stack.

```text
dfs(node):
    if node in visited: return
    visited.add(node)
    for neighbor in node.neighbors:
        dfs(neighbor)
```

```text
visit A -> B -> C -> F
back up to C -> B
visit E -> D
```

DFS is good for:

- connected components;
- cycle detection;
- topological sort;
- exploring every path in a maze.

## Breadth-first search

BFS visits nodes in order of distance.

```text
queue = [start]
visited = {start}

while queue:
    node = dequeue()
    for neighbor in node.neighbors:
        if neighbor not in visited:
            visited.add(neighbor)
            enqueue(neighbor)
```

```text
start A

distance 0: A
distance 1: B, D
distance 2: C, E
distance 3: F
```

BFS is the right tool for the shortest path when every edge has the same cost. Mark a node visited when it is enqueued, not when it is dequeued. Otherwise several nodes can enqueue it before it is processed.

## Grids are graphs

A grid is a graph with a node per cell. Each cell connects to its up, down, left, and right neighbors if they are inside the grid.

```text
grid:
1 1 0 0
1 0 0 1
0 0 1 1

neighbors of (1, 1):
(0, 1), (2, 1), (1, 0), (1, 2)
```

**Island Count** counts connected components of `1` cells. **Paint Fill** explores the region reachable from one cell. **Orange Rot** uses multi-source BFS: start with every rotten orange in the queue and expand one minute per level. **Nearest Zero** also starts from all zeroes at once, because each zero is a source of the same distance wave.

## Multi-source BFS

If several starting points should all expand at the same rate, put all of them in the queue at the beginning.

```text
sources: A, D

distance 0: A, D
distance 1: B, E
distance 2: C
```

This computes the distance to the nearest source, not just one source. It is the simplest way to solve problems like nearest zero and rotting fruit.

## Directed graphs

An edge can have a direction: `A -> B` does not mean `B -> A`.

```text
A -> B -> C
     |
     v
     D
```

When you build an adjacency list, add the reverse edge only when the graph is undirected. For directed graphs, keep the direction; it matters for reachability and topological order.

## The checklist

Before traversing, write down:

1. Are edges directed or undirected?
2. Can the graph have cycles?
3. Do I need any path, the shortest path, or all components?
4. Is the graph a grid?

Those answers choose between DFS, BFS, and a specialized algorithm.
