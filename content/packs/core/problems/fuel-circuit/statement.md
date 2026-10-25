# Fuel Circuit

A circular route has `n` fuel stations. Station `i` provides `gas[i]` units of fuel and reaching the next station costs `cost[i]` units.

You start with an empty tank at one station. Find the station index from which you can complete the full circuit and return to the start. The answer is guaranteed to be unique when a valid start exists.

Return `-1` if no starting station works.

## Input

- `gas`: the fuel available at each station.
- `cost`: the fuel needed to travel from each station to the next.

## Output

The zero-based index of the unique valid starting station, or `-1`.

## Examples

**Example 1**

```
Input: gas = [1, 2, 3, 4, 5], cost = [3, 4, 5, 1, 2]
Output: 3
```

Starting at station 3 gives enough fuel to finish the loop.

**Example 2**

```
Input: gas = [2, 3, 4], cost = [3, 4, 3]
Output: -1
```

The total fuel is less than the total cost.

**Example 3**

```
Input: gas = [5], cost = [4]
Output: 0
```

The only station covers its own leg.

**Example 4**

```
Input: gas = [4], cost = [5]
Output: -1
```

**Example 5**

```
Input: gas = [2, 4, 1, 3], cost = [3, 1, 2, 4]
Output: 1
```

Starting at station 1 completes the loop with an empty tank at the end.

## Constraints

- `1 <= gas.length == cost.length <= 100,000`
- `0 <= gas[i], cost[i] <= 1,000,000,000`
- If a valid starting station exists, it is unique.

## Follow-up

Can you find the start in one pass without simulating every candidate?
