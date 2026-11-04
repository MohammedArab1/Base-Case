# Clone a Chain with Back-References

Each node in a chain stores an integer label and a back-reference to another node in the same chain, or no reference at all.

Given the labels in chain order and the back-reference target for each position, build an independent copy of the chain. The copy has fresh nodes with the same labels, the same `next` order, and the same back-reference pattern. No node may be shared between the original and the copy.

Return the copied chain as an `int[][]` with one pair per node, in chain order:

- `pair[0]` is the node's label.
- `pair[1]` is the 0-based position in the copied chain that the node's back-reference points to, or `-1` when there is no reference.

## Input

- `values`: node labels in chain order.
- `random`: for each node, the 0-based target position of its back-reference, or `-1`.

The two arrays have the same length.

## Output

Return the copied chain described above as a list of pairs.

## Examples

**Example 1**

```
Input: values = [7, 13, 11, 10], random = [-1, 0, 3, 2]
Output: [[7, -1], [13, 0], [11, 3], [10, 2]]
```

**Example 2**

```
Input: values = [3, 3, 3], random = [2, 1, 0]
Output: [[3, 2], [3, 1], [3, 0]]
```

**Example 3**

```
Input: values = [5], random = [-1]
Output: [[5, -1]]
```

**Example 4**

```
Input: values = [], random = []
Output: []
```

## Constraints

- `0 <= values.length <= 1,000`
- `-1,000,000,000 <= values[i] <= 1,000,000,000`
- `random.length == values.length`
- `random[i] == -1` or `0 <= random[i] < values.length`
- Labels may repeat.

## Follow-up

Can you clone the chain without a separate hash map by interleaving copied nodes with the originals?
