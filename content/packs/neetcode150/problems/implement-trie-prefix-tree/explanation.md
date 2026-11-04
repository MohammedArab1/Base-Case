# Explanation

## Approach

Represent the trie as a growable list of nodes. Every node owns a dictionary from a character to a child index. A parallel boolean list records whether a word ends at that node.

Insertion walks the word one character at a time, creating children only when an edge is missing, and finally marks the last node as terminal. A lookup follows the same path and returns the terminal node, or a sentinel when an edge is missing. `search` requires the terminal flag; `startsWith` only requires that the path exists.

## Correctness

A path from the root spells exactly the characters followed during insertion. Therefore a word is present exactly when its entire path exists and its final node is marked terminal. Likewise, a stored word begins with a prefix exactly when the prefix path exists, because every node on that path was created by some inserted word. Inserting a duplicate word follows an existing path and only sets an already-true flag, so it has no unintended effect.

## Complexity

Let `L` be the length of a word or prefix.

- Each operation takes `O(L)` time.
- The trie uses `O(C)` space, where `C` is the total number of distinct character prefixes inserted.
- The returned list uses `O(operations.length)` space.

## Common mistakes

- Returning `true` for an exact search merely because a prefix path exists.
- Marking intermediate nodes as terminal instead of only the last node.
- Creating a new node even when the character edge already exists.
- Forgetting that inserting a duplicate word must not break later searches.
