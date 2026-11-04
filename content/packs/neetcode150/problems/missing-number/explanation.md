## Approach

Use XOR cancellation. The complete set of indices is `0` through `n - 1`, and the complete set of possible labels is `0` through `n`. Initialize the result with `n`, then XOR every index `i` and every label `labels[i]`.

Each value that appears once among the indices and once among the labels cancels to zero. The only value left is the missing label, which appears in the complete range but not in the labels array.

## Correctness

XOR is associative and commutative, and `x ^ x = 0` while `x ^ 0 = x`. The combined XOR contains every integer from `0` to `n` exactly once except the missing label, which appears only once. Therefore all complete pairs cancel and the missing label remains. The order of the labels does not matter.

## Complexity

- Time: `O(n)`, with one pass over the labels.
- Space: `O(1)`.

## Common mistakes

- Starting the XOR from zero without including `n`.
- Forgetting to XOR the indices as well as the labels.
- Assuming the labels are sorted.
- Using a sum that can overflow in a language with limited integer width.

## Related pattern

XOR cancellation also finds the single non-duplicated value in a collection of pairs.
