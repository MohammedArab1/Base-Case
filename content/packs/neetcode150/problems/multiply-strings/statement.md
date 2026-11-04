# Long Multiplication

Two non-negative integers are given as decimal strings. Return their product as a canonical decimal string.

The numbers may be longer than machine integers, so perform the multiplication digit by digit. The result must have no leading zeros, except that the product zero is written as `"0"`.

## Input

- `num1`: a non-negative decimal string.
- `num2`: a non-negative decimal string.

## Output

The product as a decimal string with no unnecessary leading zeros.

## Notes

- The inputs themselves have no leading zeros unless the value is exactly `"0"`.
- The output order is simply the canonical decimal representation.

## Examples

**Example 1**

```
Input: num1 = "47", num2 = "83"
Output: "3901"
```

**Example 2**

```
Input: num1 = "0", num2 = "999"
Output: "0"
```

**Example 3**

```
Input: num1 = "99", num2 = "99"
Output: "9801"
```

**Example 4**

```
Input: num1 = "120", num2 = "0"
Output: "0"
```

## Constraints

- `1 <= num1.length, num2.length <= 250`
- Both strings contain only decimal digits.
- Neither input has a leading zero unless it is exactly `"0"`.

## Follow-up

How would you extend the same digit-array technique to signed decimal strings?
