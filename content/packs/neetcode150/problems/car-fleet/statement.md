# Fleet Arrival Count

Cars travel along a single-lane road toward a destination `target` miles from the start. Each car `i` begins at `position[i]` miles from the start with a constant speed of `speed[i]` miles per hour. All starting positions are distinct, and the input is not necessarily sorted.

Cars cannot pass one another. If a faster car catches a slower car ahead, it slows down to that car's speed and they travel together as a fleet. A car arriving at the destination at the same time as the fleet directly ahead joins that fleet. A car arriving later than the fleet ahead forms a new fleet behind it.

Return the number of fleets that reach the destination.

## Input

- `target`: the destination position in miles.
- `position`: the starting position of each car.
- `speed`: the speed of each car, aligned with `position`.

## Output

The number of distinct fleets that arrive at the destination.

## Examples

**Example 1**

```
Input: target = 12, position = [10, 4, 7, 1], speed = [2, 3, 1, 2]
Output: 3
```

The car at `10` arrives in `1` hour. The car at `7` is slower and arrives in `5` hours, forming a second fleet. The car at `4` catches that fleet before the destination. The car at `1` arrives in `5.5` hours, after the fleet ahead, so it is a third fleet.

**Example 2**

```
Input: target = 10, position = [3], speed = [3]
Output: 1
```

**Example 3**

```
Input: target = 100, position = [0, 50], speed = [50, 1]
Output: 1
```

The car behind would arrive much earlier, so it catches the slow car ahead and they arrive together.

**Example 4**

```
Input: target = 10, position = [0, 2, 4], speed = [1, 1, 1]
Output: 3
```

All cars have the same speed, so no car catches another and the gaps between them never close.

## Constraints

- `1 <= position.length == speed.length <= 100,000`
- `0 <= position[i] < target`
- All values in `position` are distinct.
- `1 <= speed[i] <= 1,000,000`
- `1 <= target <= 1,000,000,000`

## Follow-up

How would you report the size of each fleet in addition to the number of fleets?
