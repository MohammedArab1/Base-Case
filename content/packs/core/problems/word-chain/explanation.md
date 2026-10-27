# Explanation

## Key insight

Words are nodes and one-letter changes are edges. The shortest transformation is therefore the shortest path in an unweighted graph, which breadth-first search finds.

## Algorithm

1. Return `0` if `end` is not in the allowed words.
2. Put `begin` in a queue with distance one and remove it from the available set.
3. For each queued word, try every position and every lowercase letter.
4. When a neighbor is the target, return the current distance plus one.
5. Otherwise enqueue unvisited neighbors and remove them from the set.
6. Return `0` when the queue empties.

## Correctness

Breadth-first search explores words in nondecreasing distance from `begin`. The first time `end` is reached is therefore through a shortest chain. Removing a word on enqueue prevents cycles and cannot hide a shorter path, because the first visit already has minimal distance.

## Complexity

- Time: `O(n * L * 26)`, where `L` is the word length.
- Space: `O(n)`.

## Common mistakes

- Using depth-first search, which may find a longer chain.
- Requiring `begin` to appear in the word list.
- Forgetting to check that the target is allowed.
- Revisiting words and looping forever.

## Related pattern

Word-ladder graphs also appear in gene-mutation and dictionary problems.
