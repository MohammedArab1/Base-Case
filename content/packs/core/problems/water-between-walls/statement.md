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
Input: heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]
Output: 49
```

Choose walls at indices `1` and `8`. The width is `7`, the shorter wall is `7`, and `7 * 7 = 49`.

**Example 2**

```
Input: heights = [1, 1]
Output: 1
```

There is only one pair: width `1`, shorter wall `1`.

**Example 3**

```
Input: heights = [4, 3, 2, 1, 4]
Output: 16
```

Choose the walls at indices `0` and `4`: width `4`, shorter wall `4`.

**Example 4**

```
Input: heights = [1, 2, 1]
Output: 2
```

The outer walls are the best choice: width `2`, shorter wall `1`.

**Example 5**

```
Input: heights = [0, 0]
Output: 0
```

Both walls have height `0`, so the tank holds no water.

## Constraints

- `2 <= heights.length <= 100,000`
- `0 <= heights[i] <= 10,000`

## Follow-up

Can you prove that moving the shorter wall inward never skips the best pair?
