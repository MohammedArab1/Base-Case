# Merge K Arrays

You are given several arrays, each sorted in ascending order. Merge them into one sorted array and return it.

## Input

- `arrays`: a list of sorted integer arrays.

## Output

A single sorted array containing every value.

## Examples

**Example 1**

```
Input: arrays = [[1,4,7],[2,5,8],[3,6,9]]
Output: [1,2,3,4,5,6,7,8,9]
```

**Example 2**

```
Input: arrays = []
Output: []
```

**Example 3**

```
Input: arrays = [[],[],[]]
Output: []
```

**Example 4**

```
Input: arrays = [[-5,0],[0,5]]
Output: [-5,0,0,5]
```

**Example 5**

```
Input: arrays = [[10,20],[1,30],[15]]
Output: [1,10,15,20,30]
```

## Constraints

- `0 <= arrays.length <= 10,000`
- `0 <= total number of values <= 100,000`
- `-1,000,000,000 <= value <= 1,000,000,000`
- Each inner array is sorted in ascending order.

## Follow-up

How does a min-heap of the current head of each array achieve `O(N log k)`?
