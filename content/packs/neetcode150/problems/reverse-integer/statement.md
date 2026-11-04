# Digit Reversal

Reverse the decimal digits of a signed 32-bit integer. The sign is preserved, and zeros that move to the front after reversal are dropped.

If the reversed value falls outside the signed 32-bit range `[-2,147,483,648, 2,147,483,647]`, return `0` instead.

## Input

- `value`: a signed 32-bit integer.

## Output

The reversed integer if it fits in a signed 32-bit integer; otherwise `0`.

## Notes

- Leading zeros in the reversed representation are not written; for example, reversing `1200` gives `21`.
- The overflow rule is part of the result: overflow is reported as `0`, not as a wrapped value.

## Examples

**Example 1**

```
Input: value = 246
Output: 642
```

**Example 2**

```
Input: value = -450
Output: -54
```

**Example 3**

```
Input: value = 1200
Output: 21
```

**Example 4**

```
Input: value = 0
Output: 0
```

## Constraints

- `-2,147,483,648 <= value <= 2,147,483,647`

## Follow-up

How would you reverse the digits of a number given as a decimal string, without converting it to an integer?
