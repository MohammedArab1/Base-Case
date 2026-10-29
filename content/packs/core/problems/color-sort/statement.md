# Color Sort

A list contains only the values `0`, `1`, and `2`, representing three colors. Sort the list in place so all `0`s come first, then all `1`s, then all `2`s.

Do not use a library sort. Return nothing; the input list must be modified.

## Input

- `nums`: a list of values from `{0, 1, 2}`.

## Output

Nothing. `nums` must be sorted in place.

## Examples

**Example 1**

```
Input: nums = [1,2,0,1,2,0]
Output: [0,0,1,1,2,2]
```

**Example 2**

```
Input: nums = [2,2,1,1,0,0]
Output: [0,0,1,1,2,2]
```

**Example 3**

```
Input: nums = [0,2,1,0,2]
Output: [0,0,1,2,2]
```

**Example 4**

```
Input: nums = [2]
Output: [2]
```

**Example 5**

```
Input: nums = []
Output: []
```

## Constraints

- `0 <= nums.length <= 100,000`
- `nums[i]` is `0`, `1`, or `2`.

## Follow-up

Can you do it in one pass with three regions instead of counting and rewriting?
