# Bitwise Addition

Compute the sum of two signed 32-bit integers without using the `+` or `-` operators. The result is guaranteed to fit in a signed 32-bit integer.

## Input

- `a`: the first signed 32-bit integer.
- `b`: the second signed 32-bit integer.

## Output

The signed 32-bit sum `a + b`, computed without the addition or subtraction operators.

## Notes

- Negative values use two's complement representation.
- The result is guaranteed to be within `[-2,147,483,648, 2,147,483,647]`.

## Examples

**Example 1**

```
Input: a = 3, b = 5
Output: 8
```

**Example 2**

```
Input: a = -4, b = 7
Output: 3
```

**Example 3**

```
Input: a = -6, b = -7
Output: -13
```

**Example 4**

```
Input: a = 0, b = 0
Output: 0
```

## Constraints

- `-2,147,483,648 <= a, b <= 2,147,483,647`
- The mathematical sum fits in a signed 32-bit integer.

## Follow-up

How would you subtract using the same carry-propagation idea?
