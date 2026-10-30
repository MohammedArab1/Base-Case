# Stacks and Monotonic Stacks

A stack is a pile of plates. You add to the top and take from the top. The last plate you put down is the first one you pick up. That is **LIFO**: last in, first out.

```text
push 3   push 7   push 1

| 1 |    <- top
| 7 |
| 3 |
+---+

pop -> 1
pop -> 7
```

Push, pop, and peek are all `O(1)`.

## Nested things want a stack

Brackets are the simplest example:

```text
"( [ { } ] )"

push (    stack: (
push [    stack: ( [
push {    stack: ( [ {
} matches { -> pop
] matches [ -> pop
) matches ( -> pop
empty -> balanced
```

If a closing bracket does not match the top of the stack, the expression is invalid. If the stack is empty at the end, every opening bracket was closed.

The same pattern appears in nested function calls, undo histories, and depth-first search.

## Postfix expressions

Postfix notation puts the operator after its operands:

```text
3 4 + 2 *   means   (3 + 4) * 2 = 14
```

A stack evaluates it directly:

```text
read 3 -> push 3          [3]
read 4 -> push 4          [3, 4]
read + -> pop 4, pop 3    push 7   [7]
read 2 -> push 2          [7, 2]
read * -> pop 2, pop 7    push 14  [14]
```

Operands are pushed. An operator pops its inputs and pushes its result. Parentheses are unnecessary because the order is explicit.

## Monotonic stacks

A monotonic stack keeps its values in sorted order by popping anything that breaks the order.

**Warmer Days** asks how many days until a warmer temperature.

```text
temperatures: 73, 74, 75, 71, 69, 72, 76, 73

stack of indices with decreasing temperatures:

73 -> [73]
74 -> 74 > 73, so day 0 waits 1 day; stack [74]
75 -> 75 > 74, so day 1 waits 1 day; stack [75]
71 -> smaller, push: [75, 71]
69 -> push: [75, 71, 69]
72 -> 72 > 69 and 72 > 71; days 4 and 3 get answers; stack [75, 72]
```

Each index is pushed once and popped once, so the scan is `O(n)`.

The stack does not store every value. It stores the values that are still waiting for a bigger value. Once a value is popped, it has its answer and never needs to be considered again.

## Largest rectangle in a histogram

**Histogram Area** uses the same idea. For each bar, you need the nearest smaller bar on the left and right. Those smaller bars mark where the rectangle must stop.

```text
heights: 2 1 5 6 2 3
            ↑
        bar of height 5 can extend left to the 1 and right to the 2 at index 4
```

A monotonic increasing stack gives both boundaries in one pass. When a shorter bar arrives, it is the right boundary for every taller bar on the stack. The stack also tells you the nearest smaller bar on the left.

## A stack is a behavior, not a specific type

In Python, a list is a stack with `append` and `pop`. In JavaScript, an array is a stack with `push` and `pop`. In a linked list, the head is the top. The important part is the rule: **only the most recent item is visible**.

When a problem says "most recent," "nested," "undo," "next greater," or "matching pair," a stack should be one of your first guesses.
