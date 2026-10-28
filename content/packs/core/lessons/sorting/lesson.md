# Sorting

Sorting is the act of putting items in a predictable order. It is often the first step because order unlocks cheaper tools: binary search, two pointers, and simple merging.

## Merge sort: split, sort, combine

Merge sort uses three ideas:

1. Split the list in half.
2. Sort each half.
3. Merge the two sorted halves.

```text
[5, 2, 8, 1]
      ↓ split
[5, 2]   [8, 1]
  ↓         ↓
[2, 5]   [1, 8]
      ↓ merge
[1, 2, 5, 8]
```

The merge step is like zipping two sorted queues:

```text
left:  2, 5
right: 1, 8

compare 2 and 1 -> take 1
compare 2 and 8 -> take 2
compare 5 and 8 -> take 5
left empty      -> take 8
```

Each level of splitting touches every item once, and there are about `log n` levels. The total is `O(n log n)`. Merge sort is **stable**: items with equal keys keep their original relative order.

## Quick sort: choose a pivot, partition

Quick sort picks a pivot and moves smaller items to one side and larger items to the other.

```text
pivot = 4

[7, 2, 4, 1, 9, 3]
           ↓
[2, 1, 3]   4   [7, 9]
```

Then it sorts the two sides. With a good pivot, each side is about half the input, giving `O(n log n)` average time. With the smallest or largest value as a pivot on already-sorted data, the split is extremely uneven and the time becomes `O(n²)`.

In most languages, the built-in sort is already good. Use it unless the problem is about implementing the algorithm or needs a special property.

## Counting sort: when the range is small

If the values are exam scores from 0 to 100, sorting comparisons is overkill. Count how many times each value appears, then write them out in order.

```text
values: 3, 1, 3, 2

counts: index 1 -> 1
        index 2 -> 1
        index 3 -> 2

output: 1, 2, 3, 3
```

This is `O(n + k)` time and `O(k)` space, where `k` is the number of possible values. **Color Sort** is a counting problem with only three categories, so it can be solved in one pass with three write positions.

## Custom comparators

Many problems are "sort, then scan." The comparator encodes the insight.

```text
intervals sorted by start:
[1, 4], [2, 3], [6, 8]

intervals sorted by end:
[2, 3], [1, 4], [6, 8]
```

- Merging overlapping intervals: sort by start.
- Scheduling the most non-overlapping meetings: sort by end.
- Grouping anagrams: sort the characters of each word and use the result as a key.
- Merging k sorted lists: use a heap instead of sorting all values.

Keep comparators simple. A comparator must be consistent: if `a < b` and `b < c`, then `a < c`. A comparator that changes its mind can produce unpredictable results.

## What sorting buys you

After sorting, equal or nearby values are adjacent. That makes duplicates easy to find, binary search possible, and two pointers safe. The cost is usually `O(n log n)` time and, depending on the algorithm, `O(n)` extra space.

If you sort, say so. Then update your complexity and explain what the order lets you do.
