# Subset List

Given distinct integers, return every subset, including the empty subset and the full set.

Order the subsets first by length, then lexicographically by their elements. For example, `[1,2]` comes before `[1,3]`, and both come before `[2,3]`.

## Input

- `nums`: distinct integers.

## Output

All subsets in the required order.

## Examples

**Example 1**

```
Input: nums = [1,2,3]
Output: [[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]
```

**Example 2**

```
Input: nums = [0]
Output: [[],[0]]
```

**Example 3**

```
Input: nums = [1,2]
Output: [[],[1],[2],[1,2]]
```

## Constraints

- `1 <= nums.length <= 10`
- `-1,000,000,000 <= nums[i] <= 1,000,000,000`
- All values are distinct.

## Follow-up

Can you generate subsets iteratively by doubling a list of existing subsets?
