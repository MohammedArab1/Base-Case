# Absent Label

Crates are labeled with distinct integers taken from the range `0` through `n`, where `n` is the number of crates. Exactly one label in that range is missing.

Find the missing label.

## Input

- `labels`: the labels that are present, in arbitrary order.

## Output

The single integer in `0..n` that does not appear in `labels`.

## Examples

**Example 1**

```
Input: labels = [4, 1, 0, 2]
Output: 3
```

**Example 2**

```
Input: labels = [0, 1, 2, 4, 5]
Output: 3
```

**Example 3**

```
Input: labels = [1, 2, 3]
Output: 0
```

**Example 4**

```
Input: labels = [0]
Output: 1
```

## Constraints

- `1 <= labels.length <= 100,000`
- The labels are distinct.
- `0 <= labels[i] <= labels.length`

## Follow-up

How would you find the missing labels if two were missing instead of one?
