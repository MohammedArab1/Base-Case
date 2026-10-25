# Explanation

## Key insight

The `k`-th largest value is the smallest value among the `k` largest values. A min-heap of size `k` keeps exactly that set, so its root is the answer after one scan.

## Why sorting is not ideal

Sorting the whole list takes `O(n log n)` time and stores the full sorted result. A heap of size `k` takes `O(n log k)` time and `O(k)` space, which is better when `k` is much smaller than `n`.

## Algorithm

1. Create an empty min-heap.
2. For each value in `nums`:
   - Push the value.
   - If the heap has more than `k` values, pop the smallest.
3. Return the smallest value in the heap.

## Correctness

After processing any prefix of the list, the heap contains the `k` largest values in that prefix. When a new value arrives, pushing it and removing the smallest preserves that invariant: if the new value is smaller than all kept values, it is removed immediately; otherwise it replaces the previous smallest. At the end, the root is the smallest of the `k` largest values, which is exactly the `k`-th largest.

## Complexity

- Time: `O(n log k)`, because each heap operation costs `O(log k)` and there are `n` values.
- Space: `O(k)`, for the heap.

## Common mistakes

- Returning the `k`-th distinct value instead of the `k`-th value by sorted position.
- Sorting ascending and using index `k` instead of `nums.length - k`.
- Using a max-heap of all `n` values, which is correct but slower and uses more memory.
