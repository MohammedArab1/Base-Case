# Lone Beacon

A sensor array reports integer signal identifiers. Every identifier appears exactly twice except for one, which appears exactly once.

Find the identifier that appears once. Your solution should use constant extra space and one pass over the signals.

## Input

- `signals`: a list of integers. Its length is odd, and every value except one appears exactly twice.

## Output

The value that appears exactly once.

## Examples

**Example 1**

```
Input: signals = [2, 2, 1]
Output: 1
```

**Example 2**

```
Input: signals = [4, 1, 2, 1, 2]
Output: 4
```

**Example 3**

```
Input: signals = [7]
Output: 7
```

A single signal is trivially the lone one.

**Example 4**

```
Input: signals = [1, 0, 1]
Output: 0
```

The answer may be zero.

## Constraints

- `1 <= signals.length <= 100,000`
- `signals.length` is odd.
- `-1,000,000,000 <= signals[i] <= 1,000,000,000`
- Every value appears exactly twice except one value, which appears once.

## Follow-up

How would you find the two values that appear once when exactly two values are unique and every other value appears twice?
