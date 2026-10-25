# Explanation

## Key insight

Once the shifts are sorted by start time, every shift that belongs to the current block must appear next. A shift either reaches into the block or begins after it ends; there can be no interleaving from an earlier start.

## Algorithm

1. Sort a copy of the shifts by start time. If starts are equal, either order works.
2. Create an empty result list.
3. For each shift:
   - If the result is empty, or the shift starts after the last block ends, append the shift as a new block.
   - Otherwise, extend the last block's end to the larger end value.
4. Return the result.

## Correctness

After sorting, consider the last block in the result. If the next shift starts after the block ends, every later shift starts at least that late, so nothing remaining can touch the block. The block is final. If the next shift starts at or before the block end, the two ranges overlap or touch, so merging them into the wider range preserves every covered time. Induction over the sorted list therefore produces exactly the connected blocks.

## Complexity

- Time: `O(n log n)` for sorting, plus `O(n)` for the scan.
- Space: `O(n)` for the sorted copy and the result.

## Common mistakes

- Comparing only with the previous original interval rather than the current merged block.
- Treating `[1, 4]` and `[4, 5]` as disjoint even though they touch.
- Mutating the input array while merging and confusing later comparisons.
- Appending the final block inside and after the loop, which duplicates it.
