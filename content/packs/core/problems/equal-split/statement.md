# Equal Split

Given positive integers, decide whether they can be split into two groups with equal sums. Every value must belong to exactly one group.

## Input

- `nums`: positive integers.

## Output

`true` if an equal-sum split exists, otherwise `false`.

## Examples

**Example 1**

```
Input: nums = [1,5,11,5]
Output: true
```

The groups `[1,5,5]` and `[11]` both sum to `11`.

**Example 2**

```
Input: nums = [1,2,3,5]
Output: false
```

The total is `11`, which cannot be split evenly.

**Example 3**

```
Input: nums = [2,2]
Output: true
```

## Constraints

- `1 <= nums.length <= 200`
- `1 <= nums[i] <= 100`

## Follow-up

Can you use a one-dimensional table and still ensure each value is used once?
