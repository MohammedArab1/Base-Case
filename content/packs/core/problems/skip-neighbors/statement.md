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
Input: values = [1, 2, 3, 1]
Output: 4
```

Choose indices `0` and `2`: `1 + 3 = 4`.

**Example 2**

```
Input: values = [2, 7, 9, 3, 1]
Output: 12
```

Choose indices `0`, `2`, and `4`: `2 + 9 + 1 = 12`.

**Example 3**

```
Input: values = [5]
Output: 5
```

**Example 4**

```
Input: values = [2, 1, 1, 2]
Output: 4
```

Choose indices `0` and `3`: `2 + 2 = 4`.

**Example 5**

```
Input: values = [0, 0, 0]
Output: 0
```

## Constraints

- `1 <= values.length <= 100,000`
- `0 <= values[i] <= 1,000,000`

## Follow-up

How would you reconstruct which indices were chosen, not just the sum?
