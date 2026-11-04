# Explanation

## Key insight

Each full block can be reversed independently. The only subtlety is reconnecting three pieces: the end of the previous block, the new head of the current block, and the start of the next block.

## Algorithm

1. Create a dummy node in front of the head.
2. Let `previousBlockEnd` start at the dummy.
3. Probe ahead `k` nodes. If fewer than `k` remain, return `dummy.next` because the tail is already correct.
4. Record the node after the block and reverse the block's links. During reversal, the block's first node becomes its last node.
5. Connect `previousBlockEnd.next` to the block's new head, and connect the block's old first node to the next block start.
6. Move `previousBlockEnd` to the old first node and repeat.
7. Return `dummy.next`.

## Correctness

Every complete block is reversed exactly once, and the final short block is never touched. The dummy node gives the first block a predecessor, so the head replacement is handled uniformly. After each iteration, the processed prefix is correctly linked to the reversed block, and the block's old first node is correctly linked to the next block. Induction over blocks shows the entire chain is correct when the probe can no longer find `k` nodes.

## Complexity

- Time: `O(n)`, because each node is probed and reversed a constant number of times.
- Space: `O(1)` extra space.

## Common mistakes

- Reversing a final block that has fewer than `k` nodes.
- Losing the pointer to the next block while reversing.
- Forgetting to connect the previous block to the new head.
- Mishandling `k = 1`, where the list should not change.
- Using recursion deep enough to overflow the call stack on a long chain.
