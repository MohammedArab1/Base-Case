# Water Between Walls

A channel has a row of vertical walls. The wall at position `i` has height `heights[i]`. Choose two walls to form the sides of a rectangular tank.

The tank's width is the distance between the chosen walls, and its height is the shorter of the two walls. Water cannot rise above the shorter wall.

Return the largest area of water the tank can hold.

## Input

- `heights`: a list of non-negative integers, where `heights[i]` is the height of wall `i`.

## Output

An integer: the maximum area `(j - i) * min(heights[i], heights[j])` over all pairs `0 <= i < j < heights.length`.

## Examples

**Example 1**

```
Input: heights = [6, 2, 9, 4, 7, 1, 8]
Output: 36
```

Choose the walls at indices `0` and `6`: width `6`, shorter wall `6`.

**Example 2**

```
Input: heights = [3, 3, 3, 3, 3]
Output: 12
```

The widest pair gives width `4` and height `3`.

**Example 3**

```
Input: heights = [0, 5, 0, 4, 0]
Output: 8
```

Choose indices `1` and `3`: width `2`, shorter wall `4`.

**Example 4**

```
Input: heights = [9, 1, 1, 1, 8]
Output: 32
```

Choose the two ends: width `4`, shorter wall `8`.

**Example 5**

```
Input: heights = [2, 10, 10, 2]
Output: 10
```

The adjacent tall walls win with area `1 * 10`.

## Constraints

- `2 <= heights.length <= 100,000`
- `0 <= heights[i] <= 10,000`

## Follow-up

Can you prove that moving the shorter wall inward never skips the best pair?
