# Strict Integer

Parse the first signed integer found at the beginning of `text`.

Rules:

- Skip leading spaces.
- Read an optional `+` or `-` sign.
- Read consecutive decimal digits.
- Stop at the first non-digit.
- If no digits follow the optional sign, return `0`.
- Clamp the result to the signed 32-bit range `[-2147483648, 2147483647]`.

## Input

- `text`: an ASCII string.

## Output

The parsed and clamped integer.

## Examples

**Example 1**

```
Input: text = "   +37"
Output: 37
```

**Example 2**

```
Input: text = "  -0042"
Output: -42
```

**Example 3**

```
Input: text = "9009abc"
Output: 9009
```

Parsing stops at the first non-digit.

**Example 4**

```
Input: text = "abc9009"
Output: 0
```

The text does not begin with a number.

**Example 5**

```
Input: text = "2147483648"
Output: 2147483647
```

The value is clamped to the signed 32-bit maximum.

## Constraints

- `0 <= text.length <= 200`
- `text` contains printable ASCII characters.

## Follow-up

How do you detect overflow before multiplying the accumulator by ten?
