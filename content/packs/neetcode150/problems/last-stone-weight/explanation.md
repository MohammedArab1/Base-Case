# Explanation

## Approach

Use a max-heap. Remove the two largest weights, destroy both when equal, otherwise insert their difference. When fewer than two stones remain, return the remaining weight or zero.

The Python version stores negated weights in a min-heap. The TypeScript version does the same. Removing the smallest negated value is equivalent to removing the largest actual weight.

## Correctness

At every round the algorithm removes exactly the two heaviest stones, as required. If they match, both disappear; otherwise the only new stone has the required difference. These operations preserve the multiset of stone weights described by the process. The loop ends exactly when fewer than two stones remain, so the final value is the outcome of the full simulation.

## Complexity

Let `n` be the number of stones.

- Time: `O(n log n)`, because each stone is inserted at most once and each round performs a constant number of heap operations.
- Space: `O(n)` for the heap.

## Common mistakes

- Taking the two smallest stones instead of the two largest.
- Pushing a zero-weight stone when the two stones are equal.
- Re-sorting but accidentally reversing the order.
- Returning a negative number by mishandling negated heap values.
