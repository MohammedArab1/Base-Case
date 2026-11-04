# Middle Value of Two Sorted Ranges

Two integer arrays are each sorted in non-decreasing order. Consider the multiset formed by merging them. Return its median as a floating-point number.

For an odd number of values, the median is the middle value. For an even number, it is the average of the two middle values.

At least one array is non-empty. Aim for `O(log(min(m, n)))` time.

## Input

- `nums1`, `nums2`: sorted integer arrays. Either may be empty, but not both.

## Output

Return the median as a `double`.

## Examples

**Example 1**

```
Input: nums1 = [1, 4, 7], nums2 = [2, 3, 8, 9]
Output: 4.0
```

The merged values are `[1, 2, 3, 4, 7, 8, 9]`.

**Example 2**

```
Input: nums1 = [1, 2], nums2 = [3, 4]
Output: 2.5
```

**Example 3**

```
Input: nums1 = [], nums2 = [7, 10, 14]
Output: 10.0
```

**Example 4**

```
Input: nums1 = [5, 6, 7], nums2 = []
Output: 6.0
```

## Constraints

- `0 <= nums1.length, nums2.length <= 100,000`
- `1 <= nums1.length + nums2.length`
- `-1,000,000,000 <= nums1[i], nums2[j] <= 1,000,000,000`
- Both arrays are non-decreasing.
- The answer fits in a `double`.

## Follow-up

Can you find the median of three sorted arrays in logarithmic time? What about `k` sorted arrays?
