# Explanation

## Key insight

A best stretch ending at position `i` either starts at `i` or extends a best stretch ending at `i - 1`. Keeping only that one value is enough.

## Algorithm

1. Set `ending` and `best` to the first value.
2. For each later value, set `ending = max(value, ending + value)`.
3. Update `best` with `ending`.
4. Return `best`.

## Correctness

By induction, `ending` is the largest sum of a stretch ending at the current position: either the current value starts a new stretch, or it extends the best previous stretch. Taking the maximum of `ending` over all positions therefore considers every possible stretch and returns the largest.

## Complexity

- Time: `O(n)`.
- Space: `O(1)`.

## Common mistakes

- Initializing the answer to `0` when all values are negative.
- Adding a negative prefix even though dropping it would be better.
- Confusing a subsequence with a contiguous stretch.

## Related pattern

This is Kadane's algorithm, a one-dimensional dynamic program.
