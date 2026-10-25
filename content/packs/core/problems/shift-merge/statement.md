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
Input: shifts = [[1, 3], [2, 6], [8, 10], [15, 18]]
Output: [[1, 6], [8, 10], [15, 18]]
```

The first two shifts overlap, while the last two are separate.

**Example 2**

```
Input: shifts = [[1, 4], [4, 5]]
Output: [[1, 5]]
```

Touching shifts are merged.

**Example 3**

```
Input: shifts = [[5, 7], [1, 2]]
Output: [[1, 2], [5, 7]]
```

The input is unsorted, and the shifts do not overlap.

**Example 4**

```
Input: shifts = [[1, 10], [2, 3], [4, 8]]
Output: [[1, 10]]
```

A long shift can contain shorter shifts that arrive later.

## Constraints

- `0 <= shifts.length <= 100,000`
- `shifts[i].length == 2`
- `-1,000,000,000 <= start <= end <= 1,000,000,000`

## Follow-up

Can you process the shifts in one pass after sorting, without copying every interval into a new block?
