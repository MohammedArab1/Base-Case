# Shift Merge

A scheduling service receives a list of work shifts. Each shift is a pair `[start, end]` with `start <= end`.

Two shifts belong to the same block when their time ranges overlap or touch, meaning one shift ends exactly when the next one begins. Merge every connected block and return the blocks ordered by start time.

## Input

- `shifts`: a list of `[start, end]` pairs. The list is not necessarily sorted.

## Output

A list of merged `[start, end]` pairs, sorted by start time. Each block covers every shift in its group with no unnecessary gaps.

## Examples

**Example 1**

```
Input: shifts = [[7, 10], [2, 4], [15, 16], [3, 8]]
Output: [[2, 10], [15, 16]]
```

After sorting, the first three shifts form one block; the last is separate.

**Example 2**

```
Input: shifts = [[5, 6], [1, 2], [2, 3]]
Output: [[1, 3], [5, 6]]
```

The first two shifts touch at `2`, so they merge.

**Example 3**

```
Input: shifts = [[10, 12], [1, 2], [3, 4]]
Output: [[1, 2], [3, 4], [10, 12]]
```

The input is unsorted and no shifts overlap.

**Example 4**

```
Input: shifts = [[-5, -2], [-4, 0], [1, 2]]
Output: [[-5, 0], [1, 2]]
```

Negative times are allowed.

**Example 5**

```
Input: shifts = []
Output: []
```

## Constraints

- `0 <= shifts.length <= 100,000`
- `shifts[i].length == 2`
- `-1,000,000,000 <= start <= end <= 1,000,000,000`

## Follow-up

Can you process the shifts in one pass after sorting, without copying every interval into a new block?
