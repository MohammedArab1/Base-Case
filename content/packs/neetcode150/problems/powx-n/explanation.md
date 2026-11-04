## Approach

Use exponentiation by squaring. While the remaining exponent is positive, if it is odd, multiply the accumulated result by the current base. Then square the base and halve the exponent. Squaring handles two factors at once, so the exponent shrinks logarithmically.

For a negative exponent, replace `base` with its reciprocal and make the exponent positive first. The special case `0^0` falls out naturally as `1`.

## Correctness

At every iteration, the invariant `result * base^power` equals the original power to compute. If `power` is odd, moving one factor of `base` into `result` preserves the invariant; in all cases, squaring `base` and halving `power` also preserves it. The exponent strictly decreases, so the loop terminates with `power == 0`, leaving `result` equal to the desired value. Inverting the base correctly handles a negative exponent because `base^(-k) = (1/base)^k`.

## Complexity

- Time: `O(log |exponent|)`, because the exponent is halved each iteration.
- Space: `O(1)`.

## Common mistakes

- Forgetting to invert the base for a negative exponent.
- Using bitwise exponent operations on a value that may exceed the signed 32-bit range in some languages.
- Multiplying the base into the result on even iterations.
- Dividing `base` by the exponent instead of inverting it.

## Related pattern

Exponentiation by squaring also underlies fast matrix powers and modular arithmetic.
