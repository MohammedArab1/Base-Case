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
Input: gas = [4, 6, 2, 8, 5], cost = [5, 3, 4, 6, 7]
Output: 1
```

Starting at station 1 completes the circuit.

**Example 2**

```
Input: gas = [3, 3, 3], cost = [4, 4, 4]
Output: -1
```

The total fuel is less than the total cost.

**Example 3**

```
Input: gas = [9], cost = [9]
Output: 0
```

The only station covers its own leg exactly.

**Example 4**

```
Input: gas = [2], cost = [3]
Output: -1
```

**Example 5**

```
Input: gas = [5, 2, 7, 1, 4], cost = [4, 5, 3, 6, 1]
Output: 4
```

Starting at station 4 completes the loop with an empty tank.

## Constraints

- `1 <= gas.length == cost.length <= 100,000`
- `0 <= gas[i], cost[i] <= 1,000,000,000`
- If a valid starting station exists, it is unique.

## Follow-up

Can you find the start in one pass without simulating every candidate?
