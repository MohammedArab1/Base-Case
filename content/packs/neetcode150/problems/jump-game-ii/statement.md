# Fewest Leaps

A runway has a maximum leap length at each marker. Starting at marker `0`, you may jump from marker `i` to any marker whose index is at most `steps[i]` positions ahead. The final marker is guaranteed to be reachable.

Return the smallest number of jumps needed to land on the final marker.

## Input

- `steps`: the maximum forward leap available at each marker, listed from left to right.

## Output

The minimum number of jumps required. A runway with one marker requires `0` jumps.

## Examples

**Example 1**

```
Input: steps = [3, 1, 2, 0, 4, 1]
Output: 3
```

**Example 2**

```
Input: steps = [2, 0, 1, 0]
Output: 2
```

**Example 3**

```
Input: steps = [0]
Output: 0
```

**Example 4**

```
Input: steps = [4, 0, 0, 0, 0]
Output: 1
```

## Constraints

- `1 <= steps.length <= 100,000`
- `0 <= steps[i] <= 100,000`
- The final marker is reachable from index `0`.

## Follow-up

How would you also produce one landing sequence that uses the minimum number of jumps?
