# Permutation List

Given distinct integers, return every possible ordering of all of them. The output must be sorted lexicographically.

## Input

- `nums`: distinct integers.

## Output

All permutations of `nums` in lexicographic order.

## Examples

**Example 1**

```
Input: nums = [1,2,3]
Output: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
```

**Example 2**

```
Input: nums = [0,1]
Output: [[0,1],[1,0]]
```

**Example 3**

```
Input: nums = [1]
Output: [[1]]
```

## Constraints

- `1 <= nums.length <= 8`
- `-1,000,000,000 <= nums[i] <= 1,000,000,000`
- All values are distinct.

## Follow-up

Can you generate the permutations in lexicographic order without an explicit used array?
