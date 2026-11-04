# Running Kth Largest

You are given an integer `k`, an initial collection of numbers, and a sequence of additions. After each addition, report the `k`-th largest value in the collection so far.

Duplicates count as separate values. For example, in the collection `[7, 7, 3]`, the second largest value is `7`. The initial collection always contains at least `k - 1` values, and after every addition the collection contains at least `k` values.

## Input

- `k`: the rank to report, where `1` means the maximum.
- `initial`: the starting numbers.
- `additions`: numbers added one at a time, in order.

## Output

A list containing the `k`-th largest value after each addition.

## Examples

**Example 1**

```
Input: k = 3, initial = [7, 1, 9], additions = [2, 12, 8, 5]
Output: [2, 7, 8, 8]
```

After the additions the collections are `[7,1,9,2]`, `[7,1,9,2,12]`, `[7,1,9,2,12,8]`, and `[7,1,9,2,12,8,5]`. Their third largest values are `2`, `7`, `8`, and `8`.

**Example 2**

```
Input: k = 1, initial = [], additions = [5, -2, 7]
Output: [5, 5, 7]
```

**Example 3**

```
Input: k = 2, initial = [0], additions = [-1, 1, 2]
Output: [-1, 0, 1]
```

## Constraints

- `1 <= k <= 1000`
- `0 <= initial.length <= 1000`
- `0 <= additions.length <= 1000`
- `initial.length >= k - 1`
- After every addition the total number of values is at least `k`.
- `-10,000 <= initial[i], additions[i] <= 10,000`

## Notes

`k` is fixed for the whole sequence.
