# Circular Vault Run

A row of vault rooms is arranged in a ring. Room `i` contains `values[i]` coins. Opening two neighboring rooms triggers the shared alarm, and because the row is circular, the first and last rooms are neighbors as well.

Choose a set of rooms to open so that no two chosen rooms are adjacent and the total number of coins is as large as possible. Return that maximum total.

## Input

- `values`: the coin count stored in each room around the ring.

## Output

The largest total that can be collected without opening two adjacent rooms.

## Examples

**Example 1**

```
Input: values = [5, 1, 9, 4]
Output: 14
```

**Example 2**

```
Input: values = [8, 2, 2, 9]
Output: 11
```

**Example 3**

```
Input: values = [6]
Output: 6
```

**Example 4**

```
Input: values = [7, 4, 1, 8, 3]
Output: 15
```

## Constraints

- `1 <= values.length <= 100,000`
- `0 <= values[i] <= 10,000`
