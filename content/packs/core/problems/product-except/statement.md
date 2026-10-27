# Product Except

For each position in `nums`, compute the product of every other value. Do not use division, and do not modify the input.

The product of any prefix or suffix of `nums` fits in a signed 32-bit integer.

## Input

- `nums`: a list of at least two integers.

## Output

A list where position `i` is the product of all values except `nums[i]`.

## Examples

**Example 1**

```
Input: nums = [1,2,3,4]
Output: [24,12,8,6]
```

**Example 2**

```
Input: nums = [-1,1,0,-3,3]
Output: [0,0,9,0,0]
```

**Example 3**

```
Input: nums = [2,3]
Output: [3,2]
```

## Constraints

- `2 <= nums.length <= 100,000`
- `-30 <= nums[i] <= 30`
- Prefix and suffix products fit in a signed 32-bit integer.

## Follow-up

Can you fill the output array with prefix products and then multiply in suffix products using only constant extra space?
