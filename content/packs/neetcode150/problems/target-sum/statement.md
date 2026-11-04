# Plus-Minus Ledger

Each entry in a ledger receives either a plus sign or a minus sign. Entries with the same value are still distinct positions, so swapping signs between two equal entries counts as a different assignment.

Given the ledger entries and a target total, count how many sign assignments produce exactly that total.

## Input

- `values`: the non-negative entries to which signs are assigned.
- `target`: the desired signed sum.

## Output

The number of distinct sign assignments whose sum equals `target`.

## Examples

**Example 1**

```
Input: values = [1, 2, 3], target = 0
Output: 2
```

**Example 2**

```
Input: values = [2, 2, 2], target = 2
Output: 3
```

**Example 3**

```
Input: values = [5], target = 5
Output: 1
```

**Example 4**

```
Input: values = [4, 1], target = 10
Output: 0
```

## Constraints

- `1 <= values.length <= 30`
- `0 <= values[i] <= 100`
- `-1,000 <= target <= 1,000`
- The answer fits in a signed 32-bit integer.
