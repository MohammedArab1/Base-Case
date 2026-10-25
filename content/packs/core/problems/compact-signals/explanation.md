# Explanation

## Key insight

Because the input is sorted, all equal values are adjacent. A single write position can build the compacted prefix while a read position scans the original values, so no second array is needed.

## Algorithm

1. If the array is empty, return `0`.
2. Set `write = 1`; the first element is always the first distinct value.
3. For each `read` from `1` to the end:
   - Compare `signals[read]` with `signals[write - 1]`, the last value already kept.
   - If they differ, write the value at `signals[write]` and increment `write`.
4. Truncate the array to `write` elements.
5. Return `write`.

## Correctness

Before each iteration, the prefix `signals[0..write-1]` contains exactly the distinct values seen so far, in ascending order. A new value that differs from the last kept value is a value not seen before, because the array is sorted; placing it at `write` extends the distinct prefix. Equal values are skipped. After the scan, the prefix contains every distinct value exactly once, and truncation removes the stale tail.

## Complexity

- Time: `O(n)`, with one pass over the signals.
- Space: `O(1)` extra space; the compaction happens inside the input array.

## Common mistakes

- Returning the count but leaving duplicate values in the array.
- Comparing with the previous input element instead of the last kept element, which can copy duplicates.
- Allocating a set or a new array, which ignores the in-place requirement.
- Overflowing the read pointer when the array is empty.
