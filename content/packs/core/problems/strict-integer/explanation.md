# Explanation

## Key insight

The parser is a small state machine: leading spaces, an optional sign, then a maximal run of digits. Values beyond the 32-bit range saturate rather than wrap.

## Algorithm

1. Skip leading spaces.
2. Consume an optional sign.
3. For each digit, check whether adding it would exceed the limit for the sign.
4. If so, return the clamped limit.
5. Otherwise accumulate and continue.
6. Apply the sign.

## Correctness

The scan consumes exactly the prefix allowed by the rules and stops at the first invalid character. The overflow check uses the same arithmetic as the accumulation, so it triggers precisely when the next digit would push the value beyond the 32-bit limit. Clamping then returns the required saturated value.

## Complexity

- Time: `O(n)`.
- Space: `O(1)`.

## Common mistakes

- Accepting digits after a decimal point or exponent.
- Parsing a number that appears later in the string.
- Overflowing before checking the limit.
- Treating `-2147483648` as overflow.

## Related pattern

The same staged parsing appears in tokenizers and expression evaluators.
