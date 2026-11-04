# Explanation

## Approach

Store added words in a trie. During a wildcard search, walk the pattern from left to right. A literal character follows one specific edge. A dot recursively tries every child edge. The search succeeds only when the pattern is fully consumed and the current node marks the end of an added word.

## Correctness

Each root-to-terminal path in the trie spells exactly one added word. At a literal position, the algorithm follows the only edge that can match. At a dot position, it explores every possible next letter, which is exactly the set of choices represented by the wildcard. Therefore a recursive branch reaches a terminal node exactly when the pattern can be expanded to a stored word. Because all branches are considered, the search succeeds if and only if some stored word matches.

## Complexity

Let `L` be the pattern length and `k` the number of dots.

- Adding a word costs `O(L)` time.
- A search costs `O(26^k * L)` time in the worst case, with trie pruning reducing the branching in practice.
- The trie uses `O(C)` space for `C` stored characters, and recursion uses `O(L)` stack space.

## Common mistakes

- Letting a dot match zero characters or multiple characters.
- Returning true when the pattern ends at a nonterminal node.
- Accepting a match before the pattern is exhausted.
- Forgetting that a dot can also match a letter that has no edge in the trie.
