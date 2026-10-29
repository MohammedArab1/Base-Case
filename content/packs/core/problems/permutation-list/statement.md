# Permutation List

Given distinct integers, return every possible ordering of all of them. The output must be sorted lexicographically.

## Input

- `nums`: distinct integers.

## Output

All permutations of `nums` in lexicographic order.

## Examples

**Example 1**

```
Input: nums = [3,1,4]
Output: [[1,3,4],[1,4,3],[3,1,4],[3,4,1],[4,1,3],[4,3,1]]
```

**Example 2**

```
Input: nums = [2,5]
Output: [[2,5],[5,2]]
```

**Example 3**

```
Input: nums = [-2,0]
Output: [[-2,0],[0,-2]]
```

**Example 4**

```
Input: nums = [7]
Output: [[7]]
```

**Example 5**

```
Input: nums = [0,4,2]
Output: [[0,2,4],[0,4,2],[2,0,4],[2,4,0],[4,0,2],[4,2,0]]
```

## Constraints

- `1 <= nums.length <= 8`
- `-1,000,000,000 <= nums[i] <= 1,000,000,000`
- All values are distinct.

## Follow-up

Can you generate the permutations in lexicographic order without an explicit used array?
