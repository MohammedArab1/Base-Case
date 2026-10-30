# Explanation

The key insight is that many words share the same first characters. A trie stores that shared beginning once. Each node represents a prefix, and the path from the root to the node spells that prefix.

While inserting a word, increment a counter at every node along its path. The root represents the empty prefix, so its counter starts at the number of words (or is incremented for every word). A node's counter is exactly the number of inserted words that start with the prefix represented by that node.

To answer a query, start at the root and follow one child per query character. If a child is missing, no word has that prefix, so the answer is zero. Otherwise, the counter at the final node is the answer. An empty query stops immediately at the root, which is why the root counter must include every word.

## Algorithm

1. Create a root node and set its count to zero.
2. For each word, increment the root count once.
3. Walk the word's characters from the root. Create missing children, and increment each visited child's count.
4. For each query, start at the root and follow its characters.
5. If a child is missing, record zero; otherwise record the final node's count.
6. Return the recorded counts in query order.

## Complexity

Let `C` be the total number of characters in all words and queries.

- Building the trie takes `O(C_words)` time.
- Answering all queries takes `O(C_queries)` time.
- The trie stores at most one node per distinct prefix, so it uses `O(C_words)` space.

For comparison, scanning every word for every query would take `O(C_words * queries.length)` time, which is far too slow at the upper limits.

## Correctness sketch

Every word follows exactly one path from the root. Its insertion increments the counter on every prefix of that word, including the empty prefix at the root. A query follows the path for its own characters. If that path exists, the node's counter equals the number of words that passed through it, which is exactly the number of words with that prefix. If the path does not exist, no word has that prefix. Therefore each returned count is correct.

## Common mistakes

- Counting only whole words instead of every word that starts with the prefix.
- Forgetting that duplicate words count separately.
- Rebuilding the word list for every query, which makes the solution too slow.

## Related idea

Use the same node-counter technique for autocomplete: the counter tells you how many options are available before you enumerate them.
