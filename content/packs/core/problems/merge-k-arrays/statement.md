# Merge K Arrays

You are given several arrays, each sorted in ascending order. Merge them into one sorted array and return it.

## Input

- `arrays`: a list of sorted integer arrays.

## Output

A single sorted array containing every value.

## Examples

**Example 1**

```
Input: arrays = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]
```

**Example 2**

```
Input: arrays = []
Output: []
```

**Example 3**

```
Input: arrays = [[],[1],[]]
Output: [1]
```

## Constraints

- `0 <= arrays.length <= 10,000`
- `0 <= total number of values <= 100,000`
- `-1,000,000,000 <= value <= 1,000,000,000`
- Each inner array is sorted in ascending order.

## Follow-up

How does a min-heap of the current head of each array achieve `O(N log k)`?
