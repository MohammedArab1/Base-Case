# Explanation

## Key insight

The cache needs constant-time lookup plus constant-time recency updates. A hash map provides lookup, while a doubly linked list provides ordered removal and insertion. Each map entry points directly at its list node, so no search is needed to move or evict it.

## Algorithm

1. Keep a map from key to a node containing the key, value, previous pointer, and next pointer.
2. Keep a doubly linked list of nodes ordered from most recently used at the front to least recently used at the back.
3. For `get`, look up the node. On a miss, record `-1`. On a hit, move the node to the front and record its value.
4. For `put`, if the key exists, update its value and move it to the front. Otherwise, if the cache is full, remove the node at the back and delete it from the map. Then insert the new node at the front.
5. Return the recorded results of the `get` operations.

## Correctness

The list always contains exactly the keys currently in the cache, ordered by recency. A `get` hit and a `put` update both move the affected node to the front, which matches the definition of most recently used. A `get` miss changes nothing. When a new key would exceed capacity, the node at the back is the least recently used, so removing it is exactly the required eviction. The map and list stay synchronized because every insertion and removal updates both.

## Complexity

- Time: `O(1)` average per operation.
- Space: `O(capacity)` for the map and the list nodes.

## Common mistakes

- Refreshing recency on `put` but not on a successful `get`.
- Evicting the most recently used entry instead of the least recently used one.
- Evicting when updating an existing key rather than only when inserting a new one.
- Failing to remove the evicted key from the hash map.
- Returning a value for a missing key instead of `-1`.
