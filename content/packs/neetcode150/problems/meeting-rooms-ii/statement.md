# Room Scheduling

A list of bookings is given as half-open intervals `[start, end)`. A booking occupies its room from its start time up to, but not including, its end time.

Find the minimum number of rooms needed to host every booking without double-booking a room.

## Input

- `intervals`: each entry is `[start, end]` with `start < end`.

## Output

The smallest number of rooms required. If there are no bookings, return `0`.

## Notes

- Because intervals are half-open, one booking may end at the exact moment another begins in the same room.

## Examples

**Example 1**

```
Input: intervals = [[1, 5], [2, 6], [3, 7]]
Output: 3
```

**Example 2**

```
Input: intervals = [[1, 4], [4, 5], [5, 6]]
Output: 1
```

**Example 3**

```
Input: intervals = []
Output: 0
```

**Example 4**

```
Input: intervals = [[9, 10], [1, 3], [2, 4], [4, 8]]
Output: 2
```

## Constraints

- `0 <= intervals.length <= 10,000`
- `0 <= start < end <= 1,000,000,000`

## Follow-up

How would you assign each booking a specific room while still using the minimum number of rooms?
