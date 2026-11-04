# The Repeated Label

A list contains `n + 1` integer labels. Every label lies between 1 and `n` inclusive, and exactly one label occurs more than once. Every other label occurs at most once. Return the repeated label.

Treat the list as read-only: do not sort it or change its entries. A solution that uses `O(1)` extra space is possible.

## Input

- `nums`: the label list.

## Output

Return the label that appears more than once.

## Examples

**Example 1**

```
Input: nums = [2, 5, 4, 1, 3, 2]
Output: 2
```

**Example 2**

```
Input: nums = [5, 1, 5, 2, 3, 4]
Output: 5
```

**Example 3**

```
Input: nums = [1, 1]
Output: 1
```

**Example 4**

```
Input: nums = [4, 4, 4, 4, 1, 2, 3]
Output: 4
```

## Constraints

- `2 <= nums.length <= 100,000`
- `1 <= nums[i] <= nums.length - 1`
- Exactly one value occurs more than once.
- Every other value occurs at most once.
- The input must not be modified.

## Follow-up

Can you find the answer in linear time without modifying the list and without allocating a set?
