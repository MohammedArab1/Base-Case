## Approach

Record the sign, then work with the absolute value. Repeatedly take the last decimal digit with modulo ten and append it to the reversed number by multiplying the accumulator by ten and adding the digit. Remove the last digit from the input by integer division.

After the loop, check whether the reversed magnitude fits the signed 32-bit range. Positive results may be at most `2,147,483,647`; negative results may have a magnitude up to `2,147,483,648`. If the magnitude exceeds the allowed bound, return `0`; otherwise restore the sign.

## Correctness

Each iteration moves the least significant remaining digit of the input to the least significant position of the accumulator, after shifting the previously accumulated digits left. This is exactly decimal reversal, and trailing zeros disappear naturally because they become leading zeros. The final range check implements the specified overflow rule. Therefore the returned value is the reversed integer when it fits, and `0` otherwise.

## Complexity

- Time: `O(log |value|)`, proportional to the number of decimal digits.
- Space: `O(1)`.

## Common mistakes

- Applying the positive limit to negative results, rejecting `-2,147,483,648`-magnitude values incorrectly.
- Forgetting that the minimum signed 32-bit value has a larger magnitude than the maximum.
- Using absolute value without considering overflow in fixed-width languages.
- Keeping leading zeros in the result instead of building an integer.

## Related pattern

Digit extraction and reconstruction also appear in palindrome-number and base-conversion problems.
