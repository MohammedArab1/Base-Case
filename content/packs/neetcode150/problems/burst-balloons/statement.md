# Balloon Burst Bounty

A row of balloons carries the numbers in `nums`. Bursting balloon `i` earns

`left * nums[i] * right`

where `left` and `right` are the numbers on the nearest balloons still standing on either side. If there is no standing balloon on a side, that side's value is treated as `1`. After a balloon bursts, its two neighbors become adjacent.

Choose the burst order that maximizes the total bounty. Return the maximum total.

## Input

- `nums`: the numbers on the balloons, in left-to-right order.

## Output

Return the maximum total bounty obtainable by bursting every balloon.

## Examples

**Example 1**

```
Input: nums = [4, 2, 7]
Output: 91
```

Bursting the 2 first earns 4 * 2 * 7 = 56, then the 4 earns 1 * 4 * 7 = 28, and the 7 earns 7, for 91.

**Example 2**

```
Input: nums = [1]
Output: 1
```

A single balloon earns its value multiplied by the two boundary 1s.

**Example 3**

```
Input: nums = [0, 5]
Output: 5
```

Burst the zero first for 0, then the 5 for 5.

**Example 4**

```
Input: nums = [0, 0, 0]
Output: 0
```

Every burst earns zero.

## Constraints

- `1 <= nums.length <= 50`
- `0 <= nums[i] <= 100`
- The answer fits in a signed 64-bit integer.

## Follow-up

How would you reconstruct the burst order that achieves the maximum?
