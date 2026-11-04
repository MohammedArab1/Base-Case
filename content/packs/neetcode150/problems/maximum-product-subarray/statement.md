# Peak Product Stretch

A stretch is any non-empty contiguous block of a sequence. The score of a stretch is the product of the integers inside it.

Given a sequence of integers, return the largest possible score over all stretches.

## Input

- `values`: the sequence of integers.

## Output

The maximum product of a non-empty contiguous stretch.

## Examples

**Example 1**

```
Input: values = [3, -1, 4, -2]
Output: 24
```

**Example 2**

```
Input: values = [-2, -3, -4]
Output: 12
```

**Example 3**

```
Input: values = [0, -5, 0]
Output: 0
```

**Example 4**

```
Input: values = [5]
Output: 5
```

## Constraints

- `1 <= values.length <= 100,000`
- `-10 <= values[i] <= 10`
- The maximum product fits in a signed 32-bit integer.
