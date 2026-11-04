# Stone Smash Reduction

You have a collection of stones, each with a positive weight. Repeat the following step while at least two stones remain:

1. Take the two heaviest stones, with weights `a` and `b`.
2. If `a == b`, both stones are destroyed.
3. Otherwise the heavier stone is replaced by a stone of weight `a - b`, and the lighter stone is destroyed.

Return the weight of the final remaining stone, or `0` if no stones remain.

## Input

- `stones`: a list of positive stone weights.

## Output

The final weight, or `0` when the collection becomes empty.

## Examples

**Example 1**

```
Input: stones = [9, 4, 7, 3, 2]
Output: 1
```

**Example 2**

```
Input: stones = [1]
Output: 1
```

**Example 3**

```
Input: stones = [1, 1]
Output: 0
```

**Example 4**

```
Input: stones = [10, 4, 2]
Output: 4
```

The first smash leaves `6` and `2`; the second leaves `4`.

## Constraints

- `0 <= stones.length <= 30`
- `1 <= stones[i] <= 1000`
