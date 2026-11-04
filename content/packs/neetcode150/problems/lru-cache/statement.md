# Bounded Recency Cache

A cache holds at most `capacity` key-value pairs. It supports two operations:

- `get(key)`: return the stored value and mark the key as the most recently used. If the key is absent, return `-1` and leave recency unchanged.
- `put(key, value)`: insert or update the key and mark it as the most recently used. If inserting would exceed capacity, first evict the least recently used key.

Simulate the operations and return every `get` result in order.

## Input

- `capacity`: maximum number of entries, at least 1.
- `operations`: `"get"` or `"put"` for each step.
- `keys`: the key for each step.
- `values`: the value for a `"put"`; ignored for a `"get"` (use `0`).

All arrays have the same length.

## Output

Return an `int[]` with one entry per `"get"` operation, in order.

## Examples

**Example 1**

```
Input:
capacity = 2
operations = ["put", "put", "get", "put", "get", "put", "get", "get", "get"]
keys       = [1, 2, 1, 3, 2, 4, 1, 3, 4]
values     = [10, 20, 0, 30, 0, 40, 0, 0, 0]

Output: [10, -1, -1, 30, 40]
```

**Example 2**

```
Input:
capacity = 1
operations = ["put", "get", "put", "get", "get"]
keys       = [2, 2, 3, 2, 3]
values     = [5, 0, 9, 0, 0]

Output: [5, -1, 9]
```

**Example 3**

```
Input:
capacity = 2
operations = ["get", "put", "get", "put", "get"]
keys       = [1, 1, 2, 2, 1]
values     = [0, 10, 0, 20, 0]

Output: [-1, -1, 10]
```

**Example 4**

```
Input:
capacity = 3
operations = ["put", "put", "put", "get", "put", "get", "get"]
keys       = [1, 2, 3, 1, 4, 2, 3]
values     = [1, 2, 3, 0, 4, 0, 0]

Output: [1, -1, 3]
```

## Constraints

- `1 <= capacity <= 1,000`
- `1 <= operations.length <= 10,000`
- `0 <= keys[i] <= 1,000,000,000`
- `0 <= values[i] <= 1,000,000,000`
- Each operation is exactly `"get"` or `"put"`.

## Follow-up

How would you add a time-to-live to each entry? How would the eviction rule change for a least-frequently-used cache?
