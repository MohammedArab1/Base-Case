# Explanation

## Key insight

Because the input is already sorted, the new interval can only affect a contiguous block. Copy the unaffected prefix, absorb the affected block while expanding the merged range, then append the unaffected suffix.

## Algorithm

1. Copy every interval that ends before the incoming start.
2. Start a merged interval at `incoming`.
3. While the next interval starts at or before the merged end, expand the merged range and continue.
4. Append the merged interval, then append the remaining intervals.

## Correctness

The copied prefix cannot overlap the incoming interval, and the suffix starts after the merged range ends, so it cannot overlap either. Every interval skipped by the absorption loop touches or overlaps the growing merged range and is therefore represented by it. The result is sorted and non-overlapping.

## Complexity

- Time: `O(n)`.
- Space: `O(n)` for the output.

## Common mistakes

- Using a strict `<` comparison when touching intervals should merge.
- Forgetting to update the merged start when absorbing a wider interval.
- Re-sorting even though the input is already sorted.

## Related pattern

This is the insertion step of the merge-intervals pattern.
