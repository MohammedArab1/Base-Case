# Two Pointers

A nested loop says: "try every pair." Two pointers say: "move one of two markers and rule out a whole region."

The trick only works when the data has an order that makes discarding safe. Sorted arrays are the classic case.

## Pointers at opposite ends

```text
target = 11

[1, 2, 4, 7, 9]
 ↑           ↑
 left       right     sum = 10  -> too small, move left

[1, 2, 4, 7, 9]
    ↑        ↑
   left     right     sum = 11  -> found
```

Why is it safe to move `left` when the sum is too small? Because every pair starting at that same `left` uses a value at or to the left of `right`. Those sums are all too small or smaller. No valid pair can use this `left` with any remaining right value. The pointer can move on.

Each pointer crosses the array once, so the scan is `O(n)`.

## Fast and slow

On a linked list, the "positions" are nodes rather than indices.

```text
slow: 1 step
fast: 2 steps

head -> [a] -> [b] -> [c] -> [d] -> [e]
          ↑
        slow, fast

head -> [a] -> [b] -> [c] -> [d] -> [e]
                  ↑      ↑
                slow    fast
```

When the fast pointer reaches the end, the slow pointer is at the middle. If the list has a cycle, the fast pointer eventually meets the slow pointer inside the loop. Both ideas use `O(1)` extra space and `O(n)` time.

## Three-sum

For **Triplet Sum**, sort the array first. Fix one value, then use two pointers on the remaining suffix to find two values that complete the target.

```text
sorted: [-4, -1, -1, 0, 1, 2]
          ^
        fixed

remaining: [-1, -1, 0, 1, 2]
            ↑           ↑
           left       right
```

The outer loop is `O(n)` and the inner scan is `O(n)`, so the total is `O(n²)`. That is much better than trying every triple in `O(n³)`.

## When not to use it

Two pointers are not a magic wand. If the data is unsorted and order does not help, moving a pointer does not rule anything out. A hash map may be the better tool. If you need every pair, not just one satisfying pair, the output itself may be `O(n²)`, so no scan can beat that.

## A useful habit

Before you write the loop, finish this sentence:

> "When I move this pointer, I know that ______ can never be part of the answer."

If you cannot fill in the blank, the pointer movement is probably a guess. In an interview, say the invariant out loud. It makes the code easier to trust and easier to review.
