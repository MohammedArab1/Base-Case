# Queues and Deques

A queue is a line at a coffee shop. The first person in line is served first. That is **FIFO**: first in, first out.

```text
front                 back
  ↓                     ↓
[a] -> [b] -> [c] -> [d]

enqueue e:  a b c d e
dequeue:    b c d e     (a leaves)
```

Enqueue at the back and dequeue from the front. Both are `O(1)` in a proper queue.

## Queues make BFS fair

Breadth-first search visits a graph in rings of distance:

```text
start -> its neighbors -> their neighbors -> ...

level 0:        A
level 1:      B   C
level 2:    D   E   F
```

A queue processes `A`, then `B` and `C`, then `D`, `E`, and `F`. A stack would dive down one branch first, which is DFS instead.

```text
queue = [start]
visited = {start}

while queue is not empty:
    node = dequeue()
    for neighbor in node.neighbors:
        if neighbor not in visited:
            visited.add(neighbor)
            enqueue(neighbor)
```

Mark a node as visited when you enqueue it, not when you dequeue it. Otherwise several nodes can enqueue the same neighbor before it is processed.

## Level-by-level processing

To process one tree level at a time, capture the queue size before the inner loop:

```text
while queue:
    level_size = len(queue)
    level = []
    repeat level_size times:
        node = dequeue()
        level.append(node)
        enqueue node's children
    record level
```

**Level Lines** and **Right View** use exactly this pattern. The captured size is the boundary between the current level and the next one.

## Deques: both ends are open

A deque (pronounced "deck") is a double-ended queue. You can push and pop at either end.

```text
push_front(1)   1
push_back(3)    1 3
push_front(0)   0 1 3
pop_back()      0 1
pop_front()     1
```

This is useful when some items expire from the front while newer items are still arriving at the back. A monotonic deque is the classic example: indices stay in order, values stay decreasing, and stale indices leave from the front.

```text
window max candidates for k = 3

value 1 -> [1]
value 3 -> [3]        (1 is smaller and older)
value -1 -> [3, -1]
value -3 -> [3, -1, -3]
value 5 -> [5]        (everything smaller leaves the back)
```

When the window moves, remove the front if its index is no longer inside the window. The front is always the maximum. **Window Max** is the full exercise.

## Circular buffers

In a fixed-size queue, you can reuse memory with two indices that wrap around. This is how many network and audio buffers work: a write index adds, a read index removes, and the indices wrap modulo the buffer size.

You rarely need to implement one in an interview, but recognizing the idea helps when a problem mentions a fixed-capacity stream.

## Queues in system design

Queues are not only for graph traversal. A message queue between services smooths bursts, retries failed work, and decouples producers from consumers. The same FIFO idea becomes a reliability tool. You will see it again in the system design lessons.
