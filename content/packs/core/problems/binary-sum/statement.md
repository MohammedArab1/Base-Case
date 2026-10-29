# Binary Sum

Add two non-negative binary numbers represented as strings and return the sum as a binary string. Neither input has leading zeros unless the value is exactly `"0"`.

## Input

- `first`, `second`: binary strings.

## Output

Their sum as a binary string without leading zeros.

## Examples

**Example 1**

```
Input: first = "110", second = "11"
Output: "1001"
```

`6 + 3 = 9`.

**Example 2**

```
Input: first = "1011", second = "101"
Output: "10000"
```

`11 + 5 = 16`.

**Example 3**

```
Input: first = "0", second = "0"
Output: "0"
```

**Example 4**

```
Input: first = "1", second = "0"
Output: "1"
```

**Example 5**

```
Input: first = "111", second = "1"
Output: "1000"
```

Adding one to three ones carries through every column.

## Constraints

- `1 <= first.length, second.length <= 10,000`
- Both strings contain only `0` and `1`.
- Neither string has leading zeros unless it is `"0"`.

## Follow-up

How would you add many binary strings efficiently?
