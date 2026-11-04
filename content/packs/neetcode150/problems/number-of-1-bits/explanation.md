## Approach

Use the identity `n & (n - 1)`. Subtracting one flips the lowest set bit to zero and flips all lower zero bits to one; combining that with the original value clears the lowest set bit while leaving all higher bits unchanged. Repeat this operation, counting iterations, until the value becomes zero.

## Correctness

Each iteration clears exactly one set bit and does not affect any higher set bits. Therefore the number of iterations equals the number of set bits originally present. The process terminates because the value strictly decreases on every iteration. When the value reaches zero, no set bits remain, so the count is exact.

## Complexity

- Time: `O(1)` for a fixed 32-bit word, or `O(k)` where `k` is the number of set bits.
- Space: `O(1)`.

## Common mistakes

- Shifting by one bit position but forgetting to examine the current bit.
- Continuing while the value is nonzero without clearing a bit, causing an infinite loop.
- Using signed shifting on negative values, which cannot occur under the constraints.
- Returning the number of zero bits instead of one bits.

## Related pattern

Clearing the lowest set bit is also used in subset enumeration and power-of-two checks.
