# Majority Value

A list contains a value that appears more than half the time. Return that majority value.

The majority value is guaranteed to exist.

## Input

- `nums`: a non-empty list of integers.

## Output

The value appearing more than `floor(n / 2)` times.

## Examples

**Example 1**

```
Input: nums = [3,2,3]
Output: 3
```

**Example 2**

```
Input: nums = [2,2,1,1,1,2,2]
Output: 2
```

**Example 3**

```
Input: nums = [1]
Output: 1
```

## Constraints

- `1 <= nums.length <= 100,000`
- `-1,000,000,000 <= nums[i] <= 1,000,000,000`
- A majority value exists.

## Follow-up

Can you solve it in one pass with constant extra space?
