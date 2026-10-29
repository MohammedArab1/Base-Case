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
Input: weights = [4, 7, 2, 5, 8], days = 3
Output: 11
```

Capacity 11 gives the loads `[4, 7]`, `[2, 5]`, and `[8]`.

**Example 2**

```
Input: weights = [6, 5, 4, 3, 2, 1], days = 4
Output: 6
```

Capacity 6 gives the loads `[6]`, `[5]`, `[4]`, and `[3, 2, 1]`.

**Example 3**

```
Input: weights = [3, 3, 3, 3], days = 2
Output: 6
```

Capacity 6 gives the loads `[3, 3]` and `[3, 3]`.

**Example 4**

```
Input: weights = [9], days = 1
Output: 9
```

**Example 5**

```
Input: weights = [2, 2, 2], days = 3
Output: 2
```

Each ship carries one package.

## Constraints

- `1 <= weights.length <= 50,000`
- `1 <= days <= weights.length`
- `1 <= weights[i] <= 10,000`
- The answer is at most `500,000,000`.

## Follow-up

How would you find the answer if packages could be reordered to minimize the number of days?
