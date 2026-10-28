# Hash Maps and Sets

A hash map is like a wall of labelled drawers.

```text
key "apple"  ->  [ drawer 42 ] -> value 3
key "banana" ->  [ drawer 17 ] -> value 1
key "cherry" ->  [ drawer 09 ] -> value 7
```

You do not open every drawer. You compute a label from the key, go to that drawer, and take what you need. That is the everyday idea behind a hash function.

## From list search to instant recall

Suppose you want to know whether a value appeared earlier in a list. With a list, you might scan backwards:

```text
[2, 7, 11, 15]
       ↑
"have I seen 2 before?"  -> look through everything on the left
```

With a set, you remember what you saw:

```text
seen = {}

2  -> not in seen -> add 2
7  -> not in seen -> add 7
11 -> not in seen -> add 11
```

The set answers "have I seen this?" without rescanning. Each check is average `O(1)`, so one pass over the input is `O(n)`.

## Keys and values

A map adds a value to each key. The value can be a count, an index, a list, or anything else that helps you answer the question.

```text
word frequencies

"the"    -> 3
"quick"  -> 1
"brown"  -> 1
```

The code shape is usually:

```text
for item in input:
    if key(item) in table:
        use table[key(item)]
    else:
        create an entry
    update the entry
```

The details change, but the rhythm is the same: **read what you have stored, then update it for the future**.

## The complement trick

**Pair Sum** is the cleanest example. For each value, compute the number you would need to reach the target. If that number is already in the map, you found a pair.

```text
target = 9

value 2 -> need 7 -> map has no 7 -> store 2 at index 0
value 7 -> need 2 -> map has 2 at index 0 -> return [0, 1]
```

Check before insert. If you insert first, a value can pair with its own index when the target is twice that value.

## Running sums

Maps are also useful for cumulative totals. If the sum of the first `i` items is `S`, and an earlier prefix sum was `S - target`, then the items between those two positions add up to `target`.

```text
prefix sums: 0, 3, 5, 11, 14
target: 6

at 11: 11 - 6 = 5, and 5 appeared earlier
       so the items after that earlier position sum to 6
```

This is **Target Totals** and the foundation of many subarray problems.

## Sets versus maps

Use a **set** when the answer only depends on presence:

- Have I seen this value?
- Is this word in the dictionary?
- Which values are unique?

Use a **map** when you need extra information:

- At which index did I see this value?
- How many times did it appear?
- Which group does this value belong to?

## Collisions, briefly

Two different keys can land in the same bucket. The table handles this by storing multiple entries in that bucket and checking which key matches. With a good hash function, buckets stay small and lookups stay near `O(1)`. With a poor one, many keys pile into one bucket and lookups degrade toward `O(n)`.

In an interview, say "average `O(1)`" and move on. You do not need to implement a hash function unless the problem asks.
