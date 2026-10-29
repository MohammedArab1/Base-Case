# Equal Split

Given positive integers, decide whether they can be split into two groups with equal sums. Every value must belong to exactly one group.

## Input

- `nums`: positive integers.

## Output

`true` if an equal-sum split exists, otherwise `false`.

## Examples

**Example 1**

```
Input: nums = [3,1,4,2]
Output: true
```

The groups `[3,2]` and `[1,4]` both sum to `5`.

**Example 2**

```
Input: nums = [2,3,5,7]
Output: false
```

The total is `17`, which is odd.

**Example 3**

```
Input: nums = [6,6]
Output: true
```

The groups `[6]` and `[6]` match.

**Example 4**

```
Input: nums = [1,1,1]
Output: false
```

The total is `3`, so no equal integer halves exist.

**Example 5**

```
Input: nums = [2,2,4,4]
Output: true
```

The groups `[2,4]` and `[2,4]` both sum to `6`.

## Constraints

- `1 <= nums.length <= 200`
- `1 <= nums[i] <= 100`

## Follow-up

Can you use a one-dimensional table and still ensure each value is used once?
