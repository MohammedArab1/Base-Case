# Product Except

For each position in `nums`, compute the product of every other value. Do not use division, and do not modify the input.

Every value in the result fits in a signed 32-bit integer.

## Input

- `nums`: a list of at least two integers.

## Output

A list where position `i` is the product of all values except `nums[i]`.

## Examples

**Example 1**

```
Input: nums = [3,5,2,4]
Output: [40,24,60,30]
```

The first value is `5 * 2 * 4 = 40`.

**Example 2**

```
Input: nums = [-2,3,0,4]
Output: [0,0,-24,0]
```

At index `2` the product is `-2 * 3 * 4 = -24`.

**Example 3**

```
Input: nums = [7,2]
Output: [2,7]
```

**Example 4**

```
Input: nums = [-1,-1,-1]
Output: [1,1,1]
```

Each product multiplies two negative values.

**Example 5**

```
Input: nums = [0,0,5]
Output: [0,0,0]
```

Every product includes at least one zero.

## Constraints

- `2 <= nums.length <= 100,000`
- `-30 <= nums[i] <= 30`
- Every output value fits in a signed 32-bit integer.

## Follow-up

Can you fill the output array with prefix products and then multiply in suffix products using only constant extra space?
