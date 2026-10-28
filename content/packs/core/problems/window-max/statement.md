# Window Max

You are given a list of integers `nums` and a window size `k`. A window is a contiguous block of exactly `k` elements. Slide the window from the start of the list to the end, one position at a time.

Return the largest value in every window, in the order the windows appear.

## Input

- `nums`: a non-empty list of integers.
- `k`: the window size, where `1 <= k <= nums.length`.

## Output

A list of `nums.length - k + 1` integers. The value at index `i` is the maximum of `nums[i]` through `nums[i + k - 1]`.

## Examples

**Example 1**

```
Input: nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3
Output: [3, 3, 5, 5, 6, 7]
```

The windows are `[1, 3, -1]`, `[3, -1, -3]`, `[-1, -3, 5]`, `[-3, 5, 3]`, `[5, 3, 6]`, and `[3, 6, 7]`.

**Example 2**

```
Input: nums = [9, 8, 7, 6], k = 2
Output: [9, 8, 7]
```

**Example 3**

```
Input: nums = [4], k = 1
Output: [4]
```

**Example 4**

```
Input: nums = [-1, -2, -3], k = 2
Output: [-1, -2]
```

Negative values are allowed; the maximum is still the least negative value in the window.

## Constraints

- `1 <= nums.length <= 200,000`
- `1 <= k <= nums.length`
- `-1,000,000,000 <= nums[i] <= 1,000,000,000`
- The list must be processed in `O(n)` time, not `O(n * k)`.

## Follow-up

What if the values arrive one at a time and you cannot look at the whole list first?
