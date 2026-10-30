# Explanation

## Key insight

Sorting by start time puts meetings in the order they begin. If any meeting overlaps, it must overlap with the meeting immediately before it in this order.

## Algorithm

1. Sort intervals by start time.
2. For each adjacent pair, compare the later start with the earlier end.
3. Return `false` if the later start is strictly smaller.
4. Return `true` if no conflict is found.

## Correctness

Suppose a meeting overlaps an earlier one. The earliest-ending among those earlier meetings must overlap some immediate predecessor; otherwise the meetings could be arranged without conflict. Thus checking adjacent pairs is sufficient. Strict comparison correctly allows one meeting to begin exactly when another ends.

## Complexity

- Time: `O(n log n)`.
- Space: `O(n)` for the sorted copy of the intervals.

## Common mistakes

- Treating touching intervals as overlapping.
- Checking all pairs, which is quadratic.
- Forgetting that the input is unsorted.

## Related pattern

Sweep-line counting extends this check to simultaneous meetings.
