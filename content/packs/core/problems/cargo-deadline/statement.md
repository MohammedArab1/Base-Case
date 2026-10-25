# Cargo Deadline

A port must load a sequence of packages onto ships. Packages must be loaded in the given order, and one ship leaves per day. Each ship has the same weight capacity.

Find the smallest capacity that lets every package ship within `days` days. Every package must fit on a ship, and a day's load may not exceed the capacity.

## Input

- `weights`: the package weights, in loading order.
- `days`: the maximum number of ships (days) available.

## Output

The minimum integer capacity that ships all packages within `days` days while preserving order.

## Examples

**Example 1**

```
Input: weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], days = 5
Output: 15
```

With capacity 15, the loads are `[1,2,3,4,5]`, `[6,7]`, `[8]`, `[9]`, and `[10]` — five days.

**Example 2**

```
Input: weights = [3, 2, 2, 4, 1, 4], days = 3
Output: 6
```

Capacity 6 gives the loads `[3,2]`, `[2,4]`, and `[1,4]`.

**Example 3**

```
Input: weights = [1, 2, 3, 1, 1], days = 4
Output: 3
```

Capacity 2 would need five days because the `3` cannot share a ship.

**Example 4**

```
Input: weights = [10], days = 1
Output: 10
```

**Example 5**

```
Input: weights = [1, 1, 1, 1, 1], days = 5
Output: 1
```

Each ship carries one package.

## Constraints

- `1 <= weights.length <= 50,000`
- `1 <= days <= weights.length`
- `1 <= weights[i] <= 10,000`
- The answer is at most `500,000,000`.

## Follow-up

How would you find the answer if packages could be reordered to minimize the number of days?
