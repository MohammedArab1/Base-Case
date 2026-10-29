# Compact Signals

A receiver stores a sorted list of signal identifiers. Duplicate identifiers take up space and slow down later scans.

Remove the duplicates **in place** so that each distinct value appears once in its original order. Return the number of distinct values, and leave the mutated `signals` array containing exactly those values.

## Input

- `signals`: a sorted list of integers, possibly with duplicates.

## Output

The number of distinct values. The mutated `signals` array must be shortened to contain only the distinct values, in ascending order.

## Examples

**Example 1**

```
Input: signals = [2, 2, 5, 5, 5, 9]
Output: 3
Mutated signals: [2, 5, 9]
```

**Example 2**

```
Input: signals = [-4, -4, -4]
Output: 1
Mutated signals: [-4]
```

**Example 3**

```
Input: signals = [1, 2, 3, 4]
Output: 4
Mutated signals: [1, 2, 3, 4]
```

No duplicates, so nothing moves.

**Example 4**

```
Input: signals = [0, 0, 0, 1, 1, 2, 2, 2]
Output: 3
Mutated signals: [0, 1, 2]
```

**Example 5**

```
Input: signals = []
Output: 0
Mutated signals: []
```

## Constraints

- `0 <= signals.length <= 100,000`
- `-1,000,000,000 <= signals[i] <= 1,000,000,000`
- `signals` is sorted in non-decreasing order.

## Follow-up

Can you solve it in one pass while using `O(1)` extra space?
