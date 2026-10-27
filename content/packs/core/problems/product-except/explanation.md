# Explanation

## Key insight

For each index, the answer is the product of a prefix and a suffix. Both can be accumulated in two passes without division.

## Algorithm

1. Create a result array of ones.
2. Scan left to right, storing the product of earlier values in each slot.
3. Scan right to left with a running suffix product.
4. Multiply each slot by the current suffix, then extend the suffix.

## Correctness

After the first pass, slot `i` holds the product of `nums[0..i-1]`. During the second pass, `suffix` holds the product of `nums[i+1..n-1]`. Multiplying them gives exactly the product of every value except `nums[i]`. Zero values need no special handling.

## Complexity

- Time: `O(n)`.
- Space: `O(1)` beyond the output array.

## Common mistakes

- Dividing by each value, which breaks on zeros.
- Multiplying the current value into the prefix before storing it.
- Using an extra left and right array when the output can serve as the left array.

## Related pattern

Prefix and suffix products generalize to sums and other associative operations.
