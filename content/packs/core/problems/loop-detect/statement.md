# Loop Detect

A linked list is described by its sequence of values and an optional link index. Build the list from `values`; then, when `linkIndex` is not `-1`, connect the last node's `next` pointer to the node at that index. A link index of `-1` means the list ends normally.

Return whether the resulting list contains a cycle.

## Input

- `values`: the node values in order.
- `linkIndex`: the index where the tail points, or `-1`.

## Output

`true` if following `next` pointers eventually revisits a node, otherwise `false`.

## Examples

**Example 1**

```
Input: values = [3,2,0,-4], linkIndex = 1
Output: true
```

The tail connects back to the node holding `2`.

**Example 2**

```
Input: values = [1,2], linkIndex = 0
Output: true
```

**Example 3**

```
Input: values = [1], linkIndex = -1
Output: false
```

## Constraints

- `0 <= values.length <= 100,000`
- `linkIndex` is `-1` or a valid index into `values`.
- When `values` is empty, `linkIndex` is `-1`.

## Follow-up

Can you detect the cycle without a visited set and with constant extra space?
