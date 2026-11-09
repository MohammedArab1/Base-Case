# Linked Lists

An array is a row of boxes. A linked list is a treasure hunt: each clue tells you where the next clue is.

```mermaid
flowchart LR
    Head["head"] --> N1["1"] --> N2["2"] --> N3["3"] --> N4["4"] --> Null["null"]
```

Each node holds a value and a `next` pointer. There is no index arithmetic, so getting to position 3 means following three pointers.

## Reversing a list

The classic exercise asks you to reverse the arrows.

```mermaid
flowchart TB
    subgraph Before["before"]
        direction LR
        B1["1"] --> B2["2"] --> B3["3"] --> BN["null"]
    end
    subgraph After["after"]
        direction LR
        A3["3"] --> A2["2"] --> A1["1"] --> AN["null"]
    end
    BN ~~~ AN
```

You need three pointers because once you change `current.next`, you lose the rest of the list unless you saved it.

```text
previous = null
current = head

while current is not null:
    next = current.next   # save the rest
    current.next = previous
    previous = current
    current = next

return previous
```

Step by step:

```text
p=null  c=1 -> 2 -> 3

save next=2
1.next = null
p=1, c=2

save next=3
2.next = 1
p=2, c=3

save next=null
3.next = 2
p=3, c=null

return 3 -> 2 -> 1 -> null
```

This is `O(n)` time and `O(1)` extra space.

## The dummy node

Suppose you need to remove all nodes with a certain value. If the head matches, you have to change the head. If it does not, you change a middle pointer. Two cases invite bugs.

A dummy node gives every real node a predecessor:

```mermaid
flowchart LR
    D["dummy<br/>always safe to update"] --> N1["1"] --> N2["2"] --> N3["1"] --> N4["3"]
```

Build the result after `dummy`, then return `dummy.next`. The same trick helps when merging lists or building a new list from parts.

## Fast and slow pointers

Two walkers start at the head. One moves one node at a time; the other moves two.

```mermaid
flowchart TB
    subgraph S0["start: s = slow, f = fast"]
        direction LR
        A0["1 (s, f)"] --> B0["2"] --> C0["3"] --> D0["4"] --> E0["5"]
    end
    subgraph S1["after one move"]
        direction LR
        A1["1"] --> B1["2 (s)"] --> C1["3 (f)"] --> D1["4"] --> E1["5"]
    end
    subgraph S2["after two moves: slow is at 3, the middle"]
        direction LR
        A2["1"] --> B2["2"] --> C2["3 (s)"] --> D2["4"] --> E2["5 (f)"]
    end
    E0 ~~~ E1
    E1 ~~~ E2
```

If the list has a cycle, the fast pointer eventually laps the slow pointer and they meet. If it does not, the fast pointer reaches null. This is Floyd's cycle detection and needs no visited set.

## Merging two sorted lists

Keep a `tail` pointer at the end of the merged result. Compare the two heads, attach the smaller one, and advance that list. When one list runs out, attach the rest of the other.

```mermaid
flowchart TB
    subgraph Left["left"]
        direction LR
        L1["1"] --> L4["4"] --> L7["7"]
    end
    subgraph Right["right"]
        direction LR
        R2["2"] --> R3["3"] --> R9["9"]
    end
    subgraph Result["result"]
        direction LR
        M1["1"] --> M2["2"] --> M3["3"] --> M4["4"] --> M7["7"] --> M9["9"]
    end
    L7 ~~~ R2
    R9 ~~~ M1
```

The merge is `O(n + m)` time and `O(1)` extra space because it relinks existing nodes. This is the same merge step used by merge sort.

## Pointer hygiene

Before you change a pointer, answer two questions:

1. Which nodes do I still need later?
2. Have I saved a reference to them?

If the answer to the first is "the rest of the list" and the second is "no," save `current.next` first. Most linked-list bugs are lost references, not complicated logic.
