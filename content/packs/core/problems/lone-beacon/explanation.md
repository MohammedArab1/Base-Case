# Explanation

## Key insight

Bitwise XOR cancels equal values: `x ^ x == 0`, and `x ^ 0 == x`. Because XOR is associative and commutative, pairing the duplicates in any order removes them and leaves only the unique value.

## Why a hash map is unnecessary

A frequency map also finds the answer in one pass, but it uses `O(n)` extra space. The problem asks for constant extra space, and XOR provides it without needing to store any signal.

## Algorithm

1. Start `result` at zero.
2. XOR every signal into `result`.
3. Return `result`.

## Correctness

Each distinct value appears twice except one. XORing the same value twice yields zero, and XORing zero into the accumulator changes nothing. Therefore every paired value contributes zero. The unique value is XORed exactly once, so the final accumulator equals it.

## Complexity

- Time: `O(n)`, with one pass.
- Space: `O(1)`.

## Common mistakes

- Using a set or map, which violates the constant-space requirement.
- Initializing `result` to the first signal and then processing that signal again, which removes the unique value.
- Assuming the unique value must be positive; zero and negative values work the same way under XOR.
