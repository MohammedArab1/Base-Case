# Explanation

Recomputing the maximum of each window takes `O(k)` time, so doing it for every window costs `O(n * k)`. The fix is to keep only the values that could still become a maximum.

A monotonic deque stores indices in increasing position order, with their values decreasing from the front to the back. The front of the deque is therefore the largest value in the current window. When a new value arrives, any smaller value at the back can never be the maximum again: the new value is larger and stays in the window at least as long. Remove those indices. Then drop the front if its index has moved out of the window.

Each index enters the deque once and leaves at most once, so the total work is `O(n)`.

## Algorithm

1. Scan `nums` with an index `i`.
2. While the deque is non-empty and the value at its back is less than or equal to `nums[i]`, pop the back.
3. Append `i` to the deque.
4. If the front index is no longer inside the window ending at `i`, remove it from the front.
5. Once `i` reaches `k - 1`, append the value at the front index.

## Complexity

- Time: `O(n)`, because every index is pushed and popped at most once.
- Space: `O(k)`, because the deque holds at most one index per window position. The TypeScript implementation keeps a compact index array and advances a head pointer instead of repeatedly shifting.

## Correctness sketch

After processing index `i`, the deque contains indices from the current window in increasing order, and their values are strictly decreasing. The front is the largest value in the window because any value that was removed from the back was smaller than a later value that is still present. Indices that left the window are removed from the front. Therefore the front at each step is exactly the window maximum.

## Common mistakes

- Scanning each window from scratch, which gives `O(n * k)` time.
- Removing only the current maximum and losing the next-best candidate.
- Comparing array values instead of indices when deciding whether an element has left the window.

## Related idea

A monotonic stack is the same idea without removing from the front. Use it when you need the next larger or smaller element rather than a moving window.
