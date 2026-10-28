# Sliding Windows

A sliding window is a range that moves across a sequence. Instead of recomputing the range from scratch, you update the answer as one item enters and one leaves.

```text
window size 3

[1][3][-1] -3   5   3   6   7
 └──────┘

 1 [3][-1][-3]  5   3   6   7
    └──────┘
```

For a sum, the update is simple: add the new item, subtract the old item.

```text
sum of first window: 1 + 3 + (-1) = 3
next window: subtract 1, add -3 -> 5? no, 3 - 1 + (-3) = -1
```

The window moved one step, and only two values changed. That is why the scan is `O(n)` instead of `O(n * k)`.

## Fixed windows

Use a fixed window when the problem names the size.

```text
for each right index:
    add nums[right]
    if window size > k:
        remove nums[left]
        left += 1
    if window size == k:
        record the answer
```

The order matters. Add first, then remove, then record. Otherwise the state may describe the wrong range.

## Variable windows

A variable window is useful when the problem asks for the longest or shortest range that satisfies a condition.

```text
longest substring with no repeated characters

right expands:
[a b c a ...]
       ↑
       a repeats

left shrinks until the repeat is gone:
[a b c a ...]
 ↑
 b c a is valid again
```

The shape is:

```text
for each right:
    add item at right to state
    while state is invalid:
        remove item at left from state
        left += 1
    update best answer using the current window
```

The `while` is important. A single `if` only works when one removal is guaranteed to fix the state.

## What state should the window hold?

Keep the smallest state that answers the question.

- Sum of values: one number.
- Number of distinct characters: a count of counts or a frequency map.
- Frequency of each needed character: a map plus a `matched` counter.
- Maximum in the window: a monotonic deque of candidate indices.

If you find yourself scanning the window to recompute the state, step back. The benefit of the window is that the state is updated incrementally.

## A worked example

**Longest Unique Stretch** asks for the longest substring with no repeated character.

```text
text = "abcabcbb"

right=0  window "a"        best 1
right=1  window "ab"       best 2
right=2  window "abc"      best 3
right=3  window "abca"     invalid: shrink to "bca"
right=4  window "bcab"     invalid: shrink to "cab"
right=5  window "cabc"     invalid: shrink to "abc"
right=6  window "abcb"     invalid: shrink to "cb"
right=7  window "cbb"      invalid: shrink to "b"
```

At each step, the window stores a count per character. When the new character makes a count greater than one, move the left edge until every count is at most one.

## Window maximum needs a deque

For **Window Max**, a counter is not enough. The largest value may leave, and you need the next largest.

```text
nums:  1  3  -1  -3  5
queue of useful indices (values decrease):
[1]        value 3
[1, 2]     value 3, -1
[3]        -3 replaces -1, then 3 is still at the front
[4]        5 replaces everything smaller
```

The front is always the current maximum. This is the same monotonic idea as a stack, but items can also leave from the front when they fall out of the window.

## The one-sentence check

Before coding, say:

> "The window is the longest/shortest range such that ______, and I can update ______ when an item enters or leaves."

If the blank is not cheap to update, the sliding window is not the right tool yet.
