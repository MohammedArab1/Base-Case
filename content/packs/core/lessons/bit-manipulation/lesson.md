# Bit Manipulation

A computer stores numbers as bits. Most of the time you can ignore that. A few interview problems become much simpler when you look directly at the 0s and 1s.

## Place values

Binary works like decimal, but each place is a power of two.

```text
13 = 8 + 4 + 1

bit:     1  1  0  1
place:   8  4  2  1
value:   8  4  0  1  = 13
```

The lowest bit is the **least significant bit**. The far-left bit is the **most significant bit**.

## The four basic operations

```text
AND (&):   1 only when both bits are 1
OR  (|):   1 when at least one bit is 1
XOR (^):   1 when the bits are different
NOT (~):   flips every bit
```

```text
  0110
& 1100
------
  0100

  0110
| 1100
------
  1110

  0110
^ 1100
------
  1010
```

Shifts move the bits:

```text
5 << 1  = 10     (5 * 2)
10 >> 1 = 5      (10 / 2, integer division)
```

## XOR and pairing

XOR has two useful rules:

```text
x ^ x = 0
x ^ 0 = x
```

That means XOR cancels duplicate pairs.

```text
values: 4, 7, 4

4 ^ 7 = 3
3 ^ 4 = 7
```

The two 4s cancel and 7 remains. **Lone Beacon** is this exact idea. It finds the one value that appears once while every other value appears twice.

XOR is also associative, so the order does not matter.

## Masks

A mask is a number designed to select or change specific bits.

```text
set bit 2:      x | (1 << 2)
clear bit 2:    x & ~(1 << 2)
toggle bit 2:   x ^ (1 << 2)
check bit 2:    (x >> 2) & 1
```

A mask with many bits can represent a set of choices. If you have 20 optional items, a 20-bit integer can say which ones are included. That is why bit masks appear in subset dynamic programming.

## Counting set bits

The straightforward version checks each bit. Brian Kernighan's trick is faster when there are few 1s:

```text
x = 12      binary 1100
x - 1 = 11  binary 1011
x & (x-1)   binary 1000  -> one 1 removed

repeat:
8 - 1 = 7   0111
8 & 7 = 0   -> second 1 removed
```

Each iteration clears the lowest set bit, so the loop runs once per 1.

## A practical warning

JavaScript bitwise operators convert numbers to 32-bit signed integers. For values beyond that range, use `BigInt` or avoid bit tricks. Python integers are arbitrary precision, but `~x` on a negative number follows Python's infinite sign extension rules.

Read the language before assuming a bit trick behaves like the textbook.

## When to use bits

- A problem says "every value appears twice except one."
- A small set of options must be represented compactly.
- A permission or feature flag needs to combine independent switches.
- A number's binary representation is the input, such as **Binary Sum**.

If none of those apply, ordinary data structures are usually clearer. Bit code is compact but easy to misread; use it when the compactness buys something.
