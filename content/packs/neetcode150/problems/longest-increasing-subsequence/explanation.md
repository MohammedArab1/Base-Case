# Explanation

## Approach

Maintain an array `tails` in which `tails[k]` is the smallest possible last value of a strictly increasing subsequence of length `k + 1` using elements seen so far. The array is always strictly increasing.

For each new value, find the first position `p` whose tail is greater than or equal to the value. Replacing `tails[p]` with the value keeps the chain length `p + 1` but gives it a smaller ending, which can only help future extensions. If no tail is at least the value, the value can extend every existing chain, so append it. The final length of `tails` is the length of the longest increasing subsequence.

## Correctness

Invariant: after processing a prefix, `tails[k]` is the minimum possible final element of a strictly increasing subsequence of length `k + 1`, and `tails` is strictly increasing.

For a new value `v`, consider the first tail `tails[p] >= v`. Replacing it with `v` is valid because `p == 0` or `tails[p - 1] < v` (by the choice of the first such position), so a chain of length `p + 1` ending at `v` exists through the chain represented by `tails[p - 1]`. It is minimal for that length because any smaller final value would have appeared earlier in `tails`. No longer chain can end at `v`, since a chain of length `p + 2` would require the previous tail to be below `v`, which fails at position `p`. If `v` is larger than every tail, it extends the longest chain, and appending is the only option. Thus the invariant is preserved. The length of the longest chain is exactly the number of tail positions.

## Complexity

- Time: `O(n log n)`, because each value performs one binary search in `tails`.
- Space: `O(n)` for the `tails` array.

## Common mistakes

- Using `<=` when searching, which turns the problem into non-decreasing subsequence.
- Sorting the input before searching for a subsequence.
- Reporting the contents of `tails` as an actual longest subsequence; `tails` is only bookkeeping.
- Forgetting that duplicates do not extend a strictly increasing chain.

## Related pattern

Patience-style tail arrays also solve scheduling, interval-chain, and longest-chain variants.
