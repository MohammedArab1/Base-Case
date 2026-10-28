# Prefix Sums and Prefix Products

A prefix sum is a running total stored before you need it.

```text
numbers:      3   1   4   1   5
prefix:    0   3   4   8   9  14
           ↑
        empty prefix
```

`prefix[i]` is the sum of the first `i` numbers. The extra leading zero is not a mistake. It represents the empty prefix and removes special cases.

## Range sums in one subtraction

The sum from index `left` to index `right`, inclusive, is:

```text
prefix[right + 1] - prefix[left]
```

```text
numbers:      3   1   4   1   5
indices:      0   1   2   3   4

sum(1..3) = prefix[4] - prefix[1]
          = 9 - 3
          = 6

check: 1 + 4 + 1 = 6
```

Building the prefix array takes `O(n)`. Each range query then takes `O(1)`. If there are many queries, that preprocessing pays for itself quickly.

## Counting subarrays

**Target Totals** asks how many contiguous subarrays sum to a target. Combine prefix sums with a frequency map.

```text
numbers:  [1, 2, 3, -1, 1], target = 3

prefix 0 -> seen {0: 1}
prefix 1 -> need -2 -> not seen
prefix 3 -> need 0  -> seen once -> count 1
prefix 6 -> need 3  -> seen once -> count 2
prefix 5 -> need 2  -> not seen
prefix 6 -> need 3  -> seen once -> count 3
```

Why does this work? If the prefix sum at position `j` minus the prefix sum at position `i` equals the target, then the items between `i` and `j` sum to the target. The map tells you how many earlier prefixes would make that true.

The map stores **frequencies**, not just presence, because different starting positions can produce the same prefix sum.

## Prefix products without division

**Product Except** asks for the product of every value except the current one. Dividing the total product is tempting, but a zero breaks it.

Instead, make two passes:

```text
values:        1   2   3   4

left products: 1   1   2   6
right products:24  12   4   1

answer:        24  12   8   6
```

The left pass stores the product of everything before each index. The right pass multiplies in the product of everything after it. Each index gets both sides without division.

The same pass idea can answer "what is the tallest wall to my left and to my right?" in **Trapped Water**.

## The invariant to remember

For a prefix array with a leading zero:

> `prefix[i]` is the total of the first `i` items, and the range `[left, right)` is `prefix[right] - prefix[left]`.

If you write that sentence down first, the off-by-one errors mostly disappear.
