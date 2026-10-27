# Stair Count

A staircase has `steps` steps. Each move climbs either one step or two steps. In how many distinct orders can you reach the top?

## Input

- `steps`: the number of steps, at least one.

## Output

The number of distinct climbing orders.

## Examples

**Example 1**

```
Input: steps = 2
Output: 2
```

The orders are `1 + 1` and `2`.

**Example 2**

```
Input: steps = 3
Output: 3
```

The orders are `1+1+1`, `1+2`, and `2+1`.

**Example 3**

```
Input: steps = 1
Output: 1
```

## Constraints

- `1 <= steps <= 45`

## Follow-up

Can you use two variables instead of an array of all previous answers?
