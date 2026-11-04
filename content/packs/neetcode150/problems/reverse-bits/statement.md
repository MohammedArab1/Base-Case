# Mirror the Bits

A 32-bit word is supplied as an unsigned integer pattern. Reverse the order of its 32 bits: the least significant bit becomes the most significant bit, and so on.

Return the reversed pattern as an unsigned integer. The input and output use `long` so the full unsigned 32-bit range fits without ambiguity.

## Input

- `value`: an unsigned 32-bit pattern represented as a non-negative integer.

## Output

The unsigned 32-bit pattern obtained by reversing all 32 bit positions.

## Notes

- Every input is processed as exactly 32 bits, including any leading zero bits.
- The result is an unsigned value in `[0, 4,294,967,295]`, so it is returned as `long`.

## Examples

**Example 1**

```
Input: value = 1
Output: 2147483648
```

**Example 2**

```
Input: value = 4294967295
Output: 4294967295
```

**Example 3**

```
Input: value = 0
Output: 0
```

**Example 4**

```
Input: value = 2
Output: 1073741824
```

## Constraints

- `0 <= value <= 4,294,967,295`

## Follow-up

How would you reverse the bits of many words using a lookup table?
