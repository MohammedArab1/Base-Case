# Explanation

## Key insight

Both lists are already sorted, so the next node of the merged list is always the smaller of the two current heads. A dummy head removes the special case for choosing the first node.

## Why copying is unnecessary

The nodes already exist and are already in sorted order. Reusing them keeps the merge `O(1)` in extra space and avoids allocating new nodes.

## Algorithm

1. Create a dummy node and set `tail` to it.
2. While both `first` and `second` are non-empty:
   - Compare their values.
   - Attach the smaller node to `tail.next`.
   - Advance the list that supplied the node.
   - Move `tail` to the attached node.
3. Attach the remaining non-empty list to `tail.next`.
4. Return `dummy.next`.

## Correctness

At every step, the merged list contains the smallest nodes seen so far in sorted order. The chosen node is no larger than either current head, and all earlier nodes are already placed. When one list is exhausted, the other list is sorted and every remaining value is at least as large as the last placed value, so attaching it preserves the order. Therefore the result is sorted and contains every input node exactly once.

## Complexity

- Time: `O(n + m)`, because each node is visited once.
- Space: `O(1)` extra space, apart from the dummy node.

## Common mistakes

- Returning `tail` instead of `dummy.next`.
- Forgetting to attach the leftover list after one side is exhausted.
- Creating new nodes instead of reusing the input nodes.
