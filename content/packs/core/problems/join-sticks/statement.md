# Join Sticks

A workshop has several wooden sticks of various lengths; duplicate lengths are allowed. Joining two sticks produces one stick whose length is their sum, and the join costs exactly that combined length.

Keep joining sticks until only one remains. Find the minimum total cost.

## Input

- `sticks`: the lengths of the available sticks.

## Output

The minimum total cost of joining all sticks into one. A single stick costs `0`.

## Examples

**Example 1**

```
Input: sticks = [3, 5, 2, 6]
Output: 31
```

Join `2 + 3`, then `5 + 5`, then `6 + 10`.

**Example 2**

```
Input: sticks = [7, 1, 4, 2]
Output: 24
```

Join `1 + 2`, then `3 + 4`, then `7 + 7`.

**Example 3**

```
Input: sticks = [8]
Output: 0
```

There is nothing to join.

**Example 4**

```
Input: sticks = [3, 3]
Output: 6
```

**Example 5**

```
Input: sticks = [2, 2, 3, 3]
Output: 20
```

Join `2 + 2`, then `3 + 3`, then `4 + 6`.

## Constraints

- `1 <= sticks.length <= 10,000`
- `1 <= sticks[i] <= 10,000`
- The total cost fits in a signed 64-bit integer.

## Follow-up

Why does joining the two shortest sticks first lead to the minimum total cost?
