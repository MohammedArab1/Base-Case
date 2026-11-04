# Timestamped String Store

A store keeps string values under string keys. Every write carries a distinct integer timestamp, and writes arrive in strictly increasing timestamp order. A read asks for the value of a key at a query time: it should return the value from the latest write to that key whose timestamp is less than or equal to the query time. If no such write exists, the read returns the empty string.

Simulate a sequence of operations and return the result of every read.

## Input

- `operations`: `"set"` or `"get"` for each operation.
- `keys`: the key used by each operation.
- `values`: the value written by a `"set"`; ignored for a `"get"` (use `""`).
- `times`: the timestamp of each operation. Timestamps attached to `"set"` operations are strictly increasing across the whole sequence. A `"get"` may use any timestamp and may repeat one.

All four arrays have the same length.

## Output

Return a `string[]` containing one entry per `"get"` operation, in order. Each entry is the stored value or `""` if no write applies.

## Examples

**Example 1**

```
Input:
operations = ["set", "get", "get"]
keys       = ["alpha", "alpha", "alpha"]
values     = ["ready", "", ""]
times      = [5, 5, 4]

Output: ["ready", ""]
```

**Example 2**

```
Input:
operations = ["set", "set", "get", "get", "get"]
keys       = ["x", "x", "x", "x", "y"]
values     = ["red", "blue", "", "", ""]
times      = [2, 8, 1, 8, 100]

Output: ["", "blue", ""]
```

**Example 3**

```
Input:
operations = ["set", "set", "set", "get", "get", "get"]
keys       = ["a", "b", "a", "a", "b", "c"]
values     = ["one", "two", "three", "", "", ""]
times      = [1, 3, 7, 5, 7, 6]

Output: ["one", "two", ""]
```

**Example 4**

```
Input:
operations = ["get", "get"]
keys       = ["missing", "missing"]
values     = ["", ""]
times      = [0, 1000000000]

Output: ["", ""]
```

## Constraints

- `1 <= operations.length <= 20,000`
- `1 <= keys[i].length <= 10`
- `0 <= values[i].length <= 10` for a `"set"` operation
- `0 <= times[i] <= 1,000,000,000`
- Every `"set"` timestamp is strictly larger than the previous `"set"` timestamp.
- A `"get"` may use a timestamp smaller than, equal to, or larger than any preceding write.

## Follow-up

What changes if writes can arrive out of order? Can you keep the same query complexity?
