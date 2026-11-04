# Explanation

## Approach

Scan the sequence while maintaining the largest and smallest products of any contiguous stretch that ends at the current position. Both extremes are necessary because multiplying by a negative value reverses their order.

For a new value `v`, a stretch ending at the current position must either begin at the current position, extend the previous maximum product, or extend the previous minimum product. Its candidates are therefore `v`, `highest * v`, and `lowest * v`. Their maximum and minimum become the new ending extremes. The answer is the largest `highest` seen anywhere.

## Correctness

Let `H[i]` and `L[i]` be the maximum and minimum products of stretches ending at index `i`. Any such stretch is either the singleton `[i]` or a stretch ending at `i - 1` followed by `values[i]`. By the induction hypothesis, the best and worst products of the earlier part are `H[i - 1]` and `L[i - 1]`, so the three candidates above cover every possibility for a stretch ending at `i`. Taking their maximum and minimum establishes the invariant. Since every non-empty stretch ends at some index, taking the maximum `H[i]` over all indices returns the global maximum.

## Complexity

- Time: `O(n)`, with constant work per element.
- Space: `O(1)`, because only two ending products and one global best are stored.

## Common mistakes

- Tracking only the maximum product and losing the large positive product created by two negatives.
- Forgetting that a single element is a valid stretch.
- Updating the maximum before using the old minimum, which corrupts the candidates.
- Assuming every zero should terminate the answer; zero products may be the maximum when all values are negative and separated by zeros.

## Related pattern

Maintaining paired extrema under sign changes also appears in maximum-product path and difference-array problems.
