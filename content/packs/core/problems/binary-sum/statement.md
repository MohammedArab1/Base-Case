# Binary Sum

Add two non-negative binary numbers represented as strings and return the sum as a binary string. Neither input has leading zeros unless the value is exactly `"0"`.

## Input

- `first`, `second`: binary strings.

## Output

Their sum as a binary string without leading zeros.

## Examples

**Example 1**

```
Input: first = "11", second = "1"
Output: "100"
```

**Example 2**

```
Input: first = "1010", second = "1011"
Output: "10101"
```

**Example 3**

```
Input: first = "0", second = "0"
Output: "0"
```

## Constraints

- `1 <= first.length, second.length <= 10,000`
- Both strings contain only `0` and `1`.
- Neither string has leading zeros unless it is `"0"`.

## Follow-up

How would you add many binary strings efficiently?
