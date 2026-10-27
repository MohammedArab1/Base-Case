# Explanation

## Key insight

The three values define three regions. A single scan can grow the zero and two regions while leaving the one region between them.

## Algorithm

1. Set `low = 0`, `middle = 0`, and `high = n - 1`.
2. If the middle value is `0`, swap it to `low` and advance both pointers.
3. If it is `1`, advance `middle`.
4. If it is `2`, swap it to `high` and decrement `high`, without advancing `middle`.
5. Continue while `middle <= high`.

## Correctness

Everything before `low` is `0`, everything between `low` and `middle` is `1`, and everything after `high` is `2`. Swapping a `2` from the back brings an unexamined value to `middle`, so that position must be checked again. When the regions meet, every value is in its correct region.

## Complexity

- Time: `O(n)`.
- Space: `O(1)`.

## Common mistakes

- Advancing `middle` after swapping a `2`, which skips the incoming value.
- Using `middle < high` and leaving one element unchecked.
- Allocating a new array instead of sorting in place.

## Related pattern

This is the Dutch national flag partition used by quicksort.
