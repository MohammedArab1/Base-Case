# Heaps and Priority Queues

A heap is a tree-shaped container that always keeps the most important item at the top. A **min-heap** puts the smallest item at the root. A **max-heap** puts the largest item there.

It does not keep everything sorted. It only guarantees the root is the best item, and it keeps that promise cheaply.

## A tree stored in an array

A heap is a complete binary tree, so it fits in an array with no pointers.

```text
values: [1, 3, 5, 7, 9, 8]

           1
         /   \
        3     5
       / \   /
      7   9 8

index:   0  1  2  3  4  5
value:   1  3  5  7  9  8
```

For a node at index `i`:

```text
left child  = 2 * i + 1
right child = 2 * i + 2
parent      = (i - 1) // 2
```

That arithmetic is why heaps are compact and fast.

## Push and pop

When you push a value, put it at the end and bubble it up while it is smaller than its parent.

```text
push 2:

[1, 3, 5, 7, 9, 8, 2]
                    ↑
compare with parent 5 -> swap

[1, 3, 2, 7, 9, 8, 5]
      ↑
compare with parent 1 -> stop
```

When you pop the root, move the last item to the root and bubble it down.

```text
pop 1:

move the last value 8 to the root:
[8, 3, 5, 7, 9]
 ↑
compare with children 3 and 5 -> swap with 3

[3, 8, 5, 7, 9]
   ↑
compare with children 7 and 9 -> 8 is larger than 7, swap with 7

[3, 7, 5, 8, 9]
      ↑
8 is now a leaf, so stop
```

Each step moves one level, so push and pop are `O(log n)`. Peeking at the root is `O(1)`.

## Top k without sorting everything

Suppose you need the k largest values from a million numbers. Sorting costs `O(n log n)`. A size-k min-heap costs `O(n log k)`.

```text
keep a min-heap of size k

for each value:
    if heap has fewer than k values:
        push value
    else if value > heap.peek():
        pop the smallest
        push value
```

The heap holds the best k values seen so far. The smallest of those is at the root, so it is the one to replace when a larger value arrives.

This is **Kth Largest** and **Nearest Points**. For the kth largest, you can also use quickselect in average `O(n)` time, but the heap works well on streams and is easier to reason about.

## Merging sorted lists

Put the first item from each list into a min-heap, tagged with the list it came from.

```text
lists: [1, 4, 7], [2, 5, 8], [3, 6, 9]

heap heads: 1, 2, 3 -> pop 1 -> push 4
heap heads: 2, 3, 4 -> pop 2 -> push 5
heap heads: 3, 4, 5 -> pop 3 -> push 6
...
```

Every value enters and leaves once, and each heap operation is `O(log k)`. The total is `O(n log k)`.

## Scheduling and greedy choices

**Task Intervals** is a cooldown-scheduling problem, not a machine-counting problem. Count task frequencies, find the maximum frequency and how many tasks tie it, then apply the frame formula `(maximum - 1) * (cooldown + 1) + tied`. The answer is the larger of that frame and the task count; no heap is needed.

**Join Sticks** repeatedly joins the two shortest sticks. A min-heap gives the two shortest at each step, and the total cost is minimized by always combining the smallest pair.

## When not to use a heap

If you need the full sorted order, sort. If you need arbitrary lookups by key, use a hash map. If you need range queries, a balanced tree or sorted array may be better. A heap answers one question extremely well: **what is the current extreme?**
