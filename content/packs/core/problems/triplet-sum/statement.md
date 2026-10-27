# Triplet Sum

Find every unique triplet of values from `nums` whose sum is zero.

A triplet is a set of three different positions. Triplets that contain the same values are duplicates and must appear only once. Each triplet should be listed in ascending order, and the list of triplets should be sorted lexicographically.

## Input

- `nums`: a list of integers, possibly containing duplicates.

## Output

The unique zero-sum triplets in the required order.

## Examples

**Example 1**

```
Input: nums = [-1,0,1,2,-1,-4]
Output: [[-1,-1,2],[-1,0,1]]
```

**Example 2**

```
Input: nums = [0,1,1]
Output: []
```

**Example 3**

```
Input: nums = [0,0,0]
Output: [[0,0,0]]
```

## Constraints

- `0 <= nums.length <= 3,000`
- `-100,000 <= nums[i] <= 100,000`

## Follow-up

Can you avoid a hash set of triplets by skipping duplicate values during the scan?
