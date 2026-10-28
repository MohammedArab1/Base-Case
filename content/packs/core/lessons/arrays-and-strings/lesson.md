# Arrays and Strings

An array is a row of boxes with numbers on them.

```text
index:   0    1    2    3    4
       +----+----+----+----+----+
value: | 10 | 20 | 30 | 40 | 50 |
       +----+----+----+----+----+
```

The index is the address of the box. If you know the index, you can go straight to it. That is why reading `items[3]` is `O(1)`.

## The cost of moving things

Reading is cheap. Resizing the row is not. If you insert at the front, every other item has to move right:

```text
insert X at 0

before: [a][b][c][d]
after:  [X][a][b][c][d]
             ↑  ↑  ↑  ↑
             all shifted
```

That is `O(n)` work. Appending at the end is usually `O(1)`, but when the underlying storage is full, the array allocates a larger block and copies everything. Because the copies happen rarely, we call the average cost `O(1)` **amortized**.

## Strings are arrays with a rule

A string is a sequence of characters. Reading one position is `O(1)` in the usual implementations. The important difference is that strings are often **immutable**: you cannot change one character in place.

```text
s = "cat"

s[0] = "b"       # not allowed in Python or JavaScript
s = "b" + s[1:]  # a new string is created
```

Building a result with `+=` in a loop can therefore become `O(n²)`, because each step may copy the whole string so far. Collect the pieces and join them once:

```text
pieces = []
for character in text:
    pieces.append(transform(character))
result = "".join(pieces)
```

That is `O(n)` time for the join plus the work to build each piece.

## The write-index trick

Many in-place array problems use two roles: one index reads, and another index writes.

```text
keep only positive values

read:  1  2  3  4  5  6
value: -2  7 -1  8  9 -3
write: ↑

after reading 7:
result: [7]  7 -1  8  9 -3
         ↑
```

The write index only advances when you keep a value. You never need a second array. This pattern appears in **Compact Signals** and **Color Sort**.

## Counting characters

For text, a small frequency table is often enough. If the alphabet is known and small, use an array of counters. If it is open-ended, use a hash map.

```text
"letter" -> l:1, e:2, t:1, r:1

array-of-26 version:
a b c d e f ... l ... r ... t
0 0 0 0 2 0 ... 1 ... 1 ... 1
```

An array of 26 counters is `O(1)` extra space because the alphabet size is fixed. This is why **Letter Tally** can stay simple even for long strings.

## Working with two ends

A string is a row, so you can often walk it from both ends:

```text
"r a c e c a r"
 ↑           ↑
 compare, then move both pointers inward
```

If the characters match all the way to the middle, the string is a palindrome. This is the same two-pointer idea you will use on arrays.

## What to ask before you code

- May I modify the input, or should I leave it unchanged?
- Is the alphabet small and fixed, or arbitrary Unicode?
- Do I need indices, values, or both?
- Is the array sorted? If yes, can I exploit that?

Those four questions usually decide whether the solution is a simple scan, a counting pass, or a two-pointer walk.
