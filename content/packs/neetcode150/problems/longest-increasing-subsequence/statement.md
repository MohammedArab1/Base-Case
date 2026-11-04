# Uphill Relay

A rising chain is a subsequence of a sequence whose values increase strictly from one chosen element to the next. The chosen elements keep their original relative order, but they do not need to be adjacent.

Given a sequence of integers, return the length of its longest rising chain. A chain of one element is always allowed.

## Input

- `values`: the sequence from which a strictly increasing subsequence is chosen.

## Output

The maximum possible length of a strictly increasing subsequence.

## Examples

**Example 1**

```
Input: values = [8, 1, 3, 2, 6, 4, 7]
Output: 4
```

**Example 2**

```
Input: values = [5, 4, 3, 2, 1]
Output: 1
```

**Example 3**

```
Input: values = [1, 2, 3, 4]
Output: 4
```

**Example 4**

```
Input: values = [4, 2, 7, 1, 9, 3]
Output: 3
```

## Constraints

- `1 <= values.length <= 2,500`
- `-10,000 <= values[i] <= 10,000`
