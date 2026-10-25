# Join Sticks

A workshop has several wooden sticks of different lengths. Joining two sticks produces one stick whose length is their sum, and the join costs exactly that combined length.

Keep joining sticks until only one remains. Find the minimum total cost.

## Input

- `sticks`: the lengths of the available sticks.

## Output

The minimum total cost of joining all sticks into one. A single stick costs `0`.

## Examples

**Example 1**

```
Input: sticks = [2, 4, 3]
Output: 14
```

Join `2` and `3` for cost `5`, then join `5` and `4` for cost `9`. Total: `14`.

**Example 2**

```
Input: sticks = [1, 8, 3, 5]
Output: 30
```

Join `1` and `3` (cost `4`), then `4` and `5` (cost `9`), then `9` and `8` (cost `17`). Total: `30`.

**Example 3**

```
Input: sticks = [5]
Output: 0
```

There is nothing to join.

**Example 4**

```
Input: sticks = [4, 4]
Output: 8
```

**Example 5**

```
Input: sticks = [1, 2, 3, 4, 5]
Output: 33
```

Join `1+2`, then `3+3`, then `4+5`, then `6+9`.

## Constraints

- `1 <= sticks.length <= 10,000`
- `1 <= sticks[i] <= 10,000`
- The total cost fits in a signed 64-bit integer.

## Follow-up

Why does joining the two shortest sticks first lead to the minimum total cost?
