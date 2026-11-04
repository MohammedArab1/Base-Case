# Explanation

## Approach

Let `ways[i]` be the number of valid chunkings of the first `i` digits. There is one empty chunking, so `ways[0] = 1`. For a non-empty prefix of length `i`, the last chunk is either:

- the single digit at index `i - 1`, allowed when that digit is not `0`; this contributes `ways[i - 1]`, or
- the pair ending at index `i - 1`, allowed when it represents a value from `10` to `26`; this contributes `ways[i - 2]`.

The implementation rolls the last two values forward, so it does not store the whole array. The first value is initialized to `1` when the first digit is non-zero and to `0` otherwise.

## Correctness

Every valid chunking has a unique final chunk, either one digit or two digits, so it is counted in exactly one of the two recurrence terms. A single digit is included precisely when it is not `0`, and a pair is included precisely when its first digit is `1`, or its first digit is `2` and its second is at most `6`; those are exactly the pairs from `10` through `26`. Each earlier chunking counted by the chosen term can be extended with that final chunk to form a distinct valid chunking. Thus the recurrence counts every valid split once, and the base case covers the empty prefix. Induction on the prefix length proves the final answer.

## Complexity

- Time: `O(n)`, with one constant-time step per digit.
- Space: `O(1)`, because only the two previous counts are retained.

## Common mistakes

- Treating `0` as a valid one-digit chunk.
- Accepting pairs such as `30`, `40`, or `27`.
- Forgetting that a `0` can still be decoded when it is the second digit of `10` or `20`.
- Reusing the updated value for both transitions and accidentally counting a chunk twice.

## Related pattern

Prefix dynamic programming with a fixed-size lookback also appears in tiling, stair-climbing, and string segmentation problems.
