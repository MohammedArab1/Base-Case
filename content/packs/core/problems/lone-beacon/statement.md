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
Input: signals = [6, 4, 6]
Output: 4
```

**Example 2**

```
Input: signals = [9, 9, -2, -2, 5]
Output: 5
```

**Example 3**

```
Input: signals = [-7]
Output: -7
```

A single signal is trivially the lone one.

**Example 4**

```
Input: signals = [0, 3, 3]
Output: 0
```

The answer may be zero.

**Example 5**

```
Input: signals = [12, 1, 12, 5, 1]
Output: 5
```

## Constraints

- `1 <= signals.length <= 100,000`
- `signals.length` is odd.
- `-1,000,000,000 <= signals[i] <= 1,000,000,000`
- Every value appears exactly twice except one value, which appears once.

## Follow-up

How would you find the two values that appear once when exactly two values are unique and every other value appears twice?
