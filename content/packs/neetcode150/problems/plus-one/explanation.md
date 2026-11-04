## Approach

Work from the least significant digit toward the most significant digit, simulating the carry from adding one. If the current digit is less than `9`, increasing it absorbs the carry and the result can be returned immediately. Otherwise the digit becomes `0` and the carry continues left.

If the loop finishes, every digit was `9`, so the number became all zeros and needs an extra leading `1`.

## Correctness

Adding one affects the last digit unless that digit is `9`. In that case the digit becomes `0` and exactly one unit is carried to the next position. The algorithm applies this rule repeatedly. The first non-nine digit stops the process because no further carry remains. If no such digit exists, the original number was `99...9`, whose successor is `100...0`, handled by prepending `1`. Thus the returned array is exactly the decimal representation of the original number plus one.

## Complexity

- Time: `O(n)` in the worst case, when all digits are `9`.
- Space: `O(n)` for the returned array.

## Common mistakes

- Forgetting to prepend a digit when every position is `9`.
- Incrementing only the last digit.
- Continuing the carry after a digit below `9` has absorbed it.
- Mutating the caller's array instead of returning a result.

## Related pattern

Carry propagation is also used in adding two digit arrays and in string multiplication.
