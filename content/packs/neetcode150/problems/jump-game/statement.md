# Runway Reach

A runway is marked with integer stepping limits. You begin on the first marker. From marker `i`, you may leap forward to any marker whose index is at most `steps[i]` positions ahead. Leaps may stop short of the maximum.

Determine whether you can land on the final marker. Reaching beyond it is allowed, but landing exactly on it is what matters.

## Input

- `steps`: the maximum forward leap available at each marker, listed from left to right.

## Output

Return `true` if the last marker can be reached starting from index `0`. A runway with a single marker is already reachable, so it returns `true`.

## Notes

- You may choose any leap length from `0` through `steps[i]`; you are not forced to use the maximum.

## Examples

**Example 1**

```
Input: steps = [3, 1, 2, 0, 4, 1]
Output: true
```

**Example 2**

```
Input: steps = [2, 0, 0, 1]
Output: false
```

**Example 3**

```
Input: steps = [0]
Output: true
```

**Example 4**

```
Input: steps = [4, 0, 0, 0, 0]
Output: true
```

## Constraints

- `1 <= steps.length <= 100,000`
- `0 <= steps[i] <= 100,000`

## Follow-up

Can you decide reachability while scanning the array only once, without exploring every possible path?
