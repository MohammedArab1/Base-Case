# Skip Neighbors

You are given a list of non-negative integers `values`. Choose a subset of indices so that no two chosen indices are adjacent. Return the largest possible sum of the chosen values.

You may choose no values, which gives a sum of `0`.

## Input

- `values`: a non-empty list of non-negative integers.

## Output

The maximum sum of a subset with no two adjacent indices.

## Examples

**Example 1**

```
Input: values = [4, 9, 2, 8, 3]
Output: 17
```

Choose indices `1` and `3`: `9 + 8 = 17`.

**Example 2**

```
Input: values = [6, 1, 7, 2, 9, 3]
Output: 22
```

Choose indices `0`, `2`, and `4`: `6 + 7 + 9 = 22`.

**Example 3**

```
Input: values = [5, 5, 5]
Output: 10
```

Choose the first and last values.

**Example 4**

```
Input: values = [0, 4, 0, 4]
Output: 8
```

Choose both `4`s.

**Example 5**

```
Input: values = [3]
Output: 3
```

## Constraints

- `1 <= values.length <= 100,000`
- `0 <= values[i] <= 1,000,000`

## Follow-up

How would you reconstruct which indices were chosen, not just the sum?
