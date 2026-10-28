# Tries

A trie (sometimes called a prefix tree) stores words one character at a time. Words that start the same way share the same path.

```text
words: cat, car, cart, dog

            (root)
           /      \
          c        d
          |        |
          a        o
         / \       |
        t   r      g
            |
            t
```

The path `c -> a -> r` spells `"car"`. The path continues to `t` for `"cart"`. The shared `"car"` prefix is stored once.

## Nodes and edges

Each node usually holds:

- a map or array of children, keyed by character;
- a boolean or count marking the end of a word;
- optionally, extra data such as a frequency or a list of suggestions.

```text
node for "car":
  children: { t: node }
  isWord: true
  count: 1
```

The root represents the empty prefix. It is not a word itself unless the problem allows an empty word.

## Insert and search

Insert `"cart"`:

```text
start at root
c -> child exists? no, create it
a -> create
r -> create
t -> create
mark the final node as a word
```

Search `"car"`:

```text
follow c, a, r
the path exists, and the node is marked as a word -> found
```

Check the prefix `"ca"`:

```text
follow c, a
the path exists -> yes, at least one word starts with "ca"
```

Each step is `O(L)` for a word of length `L`. The number of other stored words does not matter.

## Counting prefixes

**Prefix Ledger** stores a count at every node. During insertion, increment each node on the path. Then a query walks its characters and returns the final node's count.

```text
insert "cat" and "car" and "cart"

root.count = 3
c.count    = 3
a.count    = 3
t.count    = 1   (only "cat" ends here)
r.count    = 2   (car and cart)
t.count    = 1   (cart)
```

Query `"ca"` returns 3. Query `"car"` returns 2. Query `"cab"` falls off the tree and returns 0.

## Autocomplete

A trie is the natural index for autocomplete. Walk the typed prefix, then enumerate everything below that node. In a real system you would not return every suggestion; you would keep the top results by popularity at each node or merge a few ranked lists.

This is the idea behind the **Search Autocomplete** design scenario: a prefix index in memory, backed by a durable store and a cache.

## Memory trade-offs

A trie can use more memory than a sorted list of strings because every node is an object with a child map. The benefit is that prefix queries are fast and do not depend on sorting or scanning the whole dictionary.

For a small fixed alphabet, replace the child map with an array of 26 slots. That uses more memory per node but removes hash overhead and makes child access a simple index.

## When not to use a trie

If you only need exact membership, a hash set is simpler and usually uses less memory. If you need sorted order, a sorted array or balanced tree may fit better. Choose a trie when **prefixes are the question**, not just the storage format.
