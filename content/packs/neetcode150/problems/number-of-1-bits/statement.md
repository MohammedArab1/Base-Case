# Set Bit Tally

Count how many bits are set to `1` in the binary representation of a non-negative 32-bit integer.

## Input

- `value`: a non-negative integer that fits in a signed 32-bit integer.

## Output

The number of `1` bits in the value's binary representation.

## Examples

**Example 1**

```
Input: value = 13
Output: 3
```

**Example 2**

```
Input: value = 64
Output: 1
```

**Example 3**

```
Input: value = 0
Output: 0
```

**Example 4**

```
Input: value = 1023
Output: 10
```

## Constraints

- `0 <= value <= 2,147,483,647`

## Follow-up

Can you make the loop run once per set bit rather than once per bit position?
