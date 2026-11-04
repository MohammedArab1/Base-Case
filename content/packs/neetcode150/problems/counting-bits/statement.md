# Bit Count Table

For every integer from `0` through `n`, count the number of `1` bits in its binary representation.

Return the counts in increasing order of the integer they describe.

## Input

- `n`: the largest integer to include in the table.

## Output

An array of length `n + 1`. Position `i` holds the number of set bits in the binary representation of `i`.

## Notes

- The ordering is canonical: index `i` corresponds to the integer `i`.

## Examples

**Example 1**

```
Input: n = 3
Output: [0, 1, 1, 2]
```

**Example 2**

```
Input: n = 6
Output: [0, 1, 1, 2, 1, 2, 2]
```

**Example 3**

```
Input: n = 0
Output: [0]
```

**Example 4**

```
Input: n = 9
Output: [0, 1, 1, 2, 1, 2, 2, 3, 1, 2]
```

## Constraints

- `0 <= n <= 50,000`

## Follow-up

Can you fill the table using the count for a smaller number plus one bit?
