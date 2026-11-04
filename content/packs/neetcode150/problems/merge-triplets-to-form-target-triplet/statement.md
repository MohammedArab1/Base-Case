# Triplet Assembly

Each card in a workshop holds three component ratings. You may choose any non-empty collection of cards and fuse them into one card by keeping, in each of the three positions, the largest rating among the selected cards.

Given the available cards and a target rating triple, decide whether some selection can fuse into exactly the target.

## Input

- `triplets`: the available cards, each containing exactly three integers.
- `target`: the three ratings that must be produced.

## Output

Return `true` if a non-empty selection of cards can be fused into the target; otherwise return `false`.

## Notes

- Fusing is componentwise maximum: the result in position `j` is the largest value in position `j` among the selected cards.

## Examples

**Example 1**

```
Input: triplets = [[2, 4, 1], [3, 1, 5], [1, 5, 3]], target = [3, 4, 5]
Output: true
```

**Example 2**

```
Input: triplets = [[1, 1, 1], [2, 2, 2], [3, 3, 3]], target = [4, 4, 4]
Output: false
```

**Example 3**

```
Input: triplets = [[4, 4, 1], [1, 4, 4], [4, 1, 4]], target = [4, 4, 4]
Output: true
```

**Example 4**

```
Input: triplets = [[1, 2, 3], [0, 0, 0]], target = [1, 2, 3]
Output: true
```

## Constraints

- `0 <= triplets.length <= 1,000`
- Each entry of `triplets` has exactly three integers.
- `0 <= triplets[i][j] <= 1,000`
- `target.length == 3` and `1 <= target[j] <= 1,000`

## Follow-up

What if fusing added the ratings instead of taking the maximum?
