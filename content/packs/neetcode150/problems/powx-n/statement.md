# Fast Power

Compute `base` raised to an integer `exponent` without multiplying `base` by itself `exponent` times.

A negative exponent means the reciprocal of the corresponding positive power. Define `0^0` as `1`; when the base is zero, the exponent is non-negative.

Return a floating-point result. Small numerical error is tolerated.

## Input

- `base`: a floating-point number.
- `exponent`: a signed integer power.

## Output

The value of `base` raised to `exponent`, as a floating-point number.

## Notes

- The exponent spans the full signed 32-bit range, including `-2,147,483,648`.
- The checker allows a small absolute and relative numerical error.

## Examples

**Example 1**

```
Input: base = 3.0, exponent = 4
Output: 81.0
```

**Example 2**

```
Input: base = 2.0, exponent = -3
Output: 0.125
```

**Example 3**

```
Input: base = -3.0, exponent = 3
Output: -27.0
```

**Example 4**

```
Input: base = 0.5, exponent = 4
Output: 0.0625
```

## Constraints

- `-100 <= base <= 100`
- `-2,147,483,648 <= exponent <= 2,147,483,647`
- `0^0` is defined as `1`.
- When `base == 0`, `exponent >= 0`.

## Follow-up

How would you compute a modular power where the result is taken modulo a prime?
