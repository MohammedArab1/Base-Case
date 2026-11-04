# Minimum-Tracking Stack

Design a stack that supports four operations in constant time:

- `push(value)` adds a value on top.
- `pop()` removes the top value.
- `top()` returns the top value without removing it.
- `getMin()` returns the smallest value currently in the stack.

The judge does not instantiate a class. Instead, it sends an operation log to one function that simulates the stack and records the requested outputs.

## Function

`minStack(operations: string[], arguments: int[][]): int[]`

- `operations[i]` is `"push"`, `"pop"`, `"top"`, or `"getMin"`.
- For `"push"`, `arguments[i]` contains one integer: the value to push.
- For every other operation, `arguments[i]` is empty.
- A `"pop"` appends `-1` to the result.
- A `"top"` appends the current top value to the result.
- A `"getMin"` appends the current minimum to the result.
- A `"push"` appends nothing.

All `pop`, `top`, and `getMin` operations are guaranteed to be called on a non-empty stack.

## Examples

**Example 1**

```
Input:
operations = ["push", "push", "push", "getMin", "pop", "top", "getMin"]
arguments = [[5], [2], [7], [], [], [], []]
Output: [2, -1, 2, 2]
```

After pushing `5, 2, 7`, the minimum is `2`. Popping removes `7` and emits `-1`; the new top and minimum are both `2`.

**Example 2**

```
Input:
operations = ["push", "push", "getMin", "pop", "getMin", "top"]
arguments = [[-3], [-3], [], [], [], []]
Output: [-3, -1, -3, -3]
```

The duplicate minimum must survive one pop.

**Example 3**

```
Input:
operations = ["push", "top", "getMin", "pop", "push", "getMin"]
arguments = [[0], [], [], [], [9], []]
Output: [0, 0, -1, 9]
```

After the stack becomes empty, a new value defines a new minimum.

**Example 4**

```
Input:
operations = ["push", "push", "pop", "top"]
arguments = [[4], [1], [], []]
Output: [-1, 4]
```

## Constraints

- `1 <= operations.length <= 100,000`
- `-1,000,000,000 <= value <= 1,000,000,000` for every pushed value.
- The operation sequence is valid: no `pop`, `top`, or `getMin` runs on an empty stack.

## Follow-up

Can you support both `getMin` and `getMax` in constant time without storing a pair for every push?
