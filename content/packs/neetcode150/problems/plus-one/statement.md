# Increment Digits

A non-negative integer is stored as an array of decimal digits, most significant digit first. Add one to the integer and return the resulting digit array.

The input contains no leading zeros unless the number itself is `0`.

## Input

- `digits`: the decimal digits of the number, from most significant to least significant.

## Output

The digits of the incremented number, in the same most-significant-first order. If the increment creates a new leading digit, include it.

## Examples

**Example 1**

```
Input: digits = [1, 2, 9]
Output: [1, 3, 0]
```

**Example 2**

```
Input: digits = [9, 9]
Output: [1, 0, 0]
```

**Example 3**

```
Input: digits = [0]
Output: [1]
```

**Example 4**

```
Input: digits = [4, 8, 9, 9]
Output: [4, 9, 0, 0]
```

## Constraints

- `1 <= digits.length <= 500`
- `0 <= digits[i] <= 9`
- The first digit is nonzero unless the array is exactly `[0]`.

## Follow-up

How would you add an arbitrary non-negative integer represented in the same way?
