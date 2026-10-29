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
Input: nums = [-4,2,2,1,3,-1]
Output: [[-4,1,3],[-4,2,2]]
```

**Example 2**

```
Input: nums = [6,-3,-2,-1,4,-4,5]
Output: [[-4,-2,6],[-4,-1,5],[-3,-2,5],[-3,-1,4]]
```

**Example 3**

```
Input: nums = [0,0,1,-1,2,-2]
Output: [[-2,0,2],[-1,0,1]]
```

**Example 4**

```
Input: nums = [1,2,3]
Output: []
```

**Example 5**

```
Input: nums = [1,-1,0]
Output: [[-1,0,1]]
```

## Constraints

- `0 <= nums.length <= 3,000`
- `-100,000 <= nums[i] <= 100,000`

## Follow-up

Can you avoid a hash set of triplets by skipping duplicate values during the scan?
