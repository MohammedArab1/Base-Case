# Complexity and Big O

Big O is a way to answer one question: **when the input gets bigger, how much more work does this take?**

It is not a stopwatch. A slow laptop and a fast server can run the same code. Big O ignores the machine and looks at the shape of the growth.

## Counting steps

Imagine you have a list of `n` numbers and you want to find the largest one.

```text
numbers:  [4, 9, 2, 7]
           ^  ^  ^  ^
visit:     1  2  3  4
```

You look at every number once. Double the list, and you do twice as much work. That is **linear** growth, written `O(n)`.

Now imagine comparing every pair:

```text
for each number i:
    for each number j:
        compare numbers[i] and numbers[j]
```

For `n = 4` there are 16 comparisons. For `n = 8` there are 64. The work grows with the square of the input, so this is `O(n²)`.

## Dropping the small stuff

Suppose a function does `3n + 5` steps. When `n` is one million, the `5` is irrelevant and the `3` is just a constant multiplier. We write `O(n)`.

This is a model, not a measurement. It tells you which approach will survive a large input.

```text
growth, from gentle to steep

O(1)        ▁▁▁▁▁▁▁▁▁▁
O(log n)    ▁▂▃▄▅▆▇██
O(n)        ▁▂▃▄▅▆▇█
O(n log n)  ▁▂▃▅▆███
O(n²)       ▁▂▄▇████
O(2ⁿ)       ▁▂▄█████
```

The vertical axis is work. The horizontal axis is input size. Small differences at the bottom become enormous at the top.

## A worked example

The problem **Pair Sum** asks for two numbers in a list that add up to a target.

The direct idea is to check every pair:

```text
for i in range(n):
    for j in range(i + 1, n):
        if nums[i] + nums[j] == target:
            return [i, j]
```

That is `O(n²)` time and `O(1)` extra space.

The better idea is to remember values you have already seen in a hash map. For each value, check whether its complement is already stored. That is one pass:

```text
nums = [2, 7, 11, 15], target = 9

value 2: complement 7 -> not seen -> store 2
value 7: complement 2 -> seen at index 0 -> return [0, 1]
```

This is `O(n)` time and `O(n)` extra space. You traded memory for speed. That trade-off is the heart of many interview solutions.

## Reading the common patterns

- A single pass over the input: `O(n)`.
- Halving the search range each step: `O(log n)`.
- Sorting first: usually `O(n log n)`.
- A loop inside a loop over the same input: often `O(n²)`.
- Trying every subset: `O(2ⁿ)`.
- Recursion: include the depth of the call stack in your space estimate.

## What to say in an interview

Start with the simple approach and its cost. Then say what is too slow and why. If you change the data structure, explain which operation became cheaper and which resource you spent.

> "The nested loop is O(n²). I can remove the inner loop with a hash map, which makes it O(n) time and O(n) space."

That sentence is more useful than a memorized table, because it shows the reasoning behind the table.
