## Approach

Allocate a digit array of length `m + n`. For each digit of the first number and each digit of the second, multiply them and add the product to the corresponding position in the result array. The rightmost digit position is shared by the current pair, while the tens part of the sum is carried to the position immediately to its left.

After all pairs are processed, the array holds the product in base ten. Skip leading zeros and join the digits.

## Correctness

This is the standard positional multiplication algorithm. Each digit `num1[i]` represents a multiple of `10^(m-1-i)`, and each `num2[j]` represents a multiple of `10^(n-1-j)`. Their product contributes to the position whose place value is the sum of those exponents, which corresponds to index `i + j + 1` in the result array. Adding all contributions and propagating carries therefore computes the exact product. Leading-zero removal does not change the value, and the special zero case produces the canonical `"0"`.

## Complexity

- Time: `O(m * n)`, because every digit pair is multiplied once.
- Space: `O(m + n)` for the result digit array.

## Common mistakes

- Reversing the carry direction.
- Forgetting to add the existing value before extracting the carry.
- Leaving leading zeros in the output.
- Returning `"00"` or an empty string for a zero product.

## Related pattern

Digit-array arithmetic is also used for adding large numbers and for converting between bases.
