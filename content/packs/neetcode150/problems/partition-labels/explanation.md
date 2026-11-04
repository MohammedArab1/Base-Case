## Approach

Record the last index at which each letter occurs. Then scan the string from left to right while maintaining the end of the current block.

For each character, the block must extend at least to that character's final occurrence; otherwise the same letter would appear again in a later block. Take the maximum of the current block end and the current character's last index. When the scan index reaches that end, every letter seen so far has had its final occurrence inside the block, so the block can close. Record its length and begin the next block at the following index.

## Correctness

While scanning, `end` is the smallest index at which the current block could possibly close, because every letter encountered must be contained entirely within the block. Closing earlier would split a letter across blocks. When `i == end`, no letter seen so far occurs later, and no unseen letter has appeared inside the block, so closing is both legal and forced for a maximal partition. Thus each recorded block is valid, and cutting at every such boundary yields the maximum possible number of blocks.

## Complexity

- Time: `O(n)`, with one pass to record last positions and one pass to cut blocks.
- Space: `O(1)` for a fixed lowercase alphabet, or `O(k)` for `k` distinct letters.

## Common mistakes

- Using the first occurrence instead of the last occurrence of each letter.
- Cutting as soon as a letter repeats instead of expanding to its final occurrence.
- Forgetting to update the next block's start after a cut.
- Returning the blocks themselves rather than their lengths.

## Related pattern

The expanding-boundary scan also applies to merging intervals and grouping overlapping ranges.
