# Explanation

## Key insight

A colder day can be answered by any later warm day, so several unresolved days may be settled by the same new temperature. A monotonic stack keeps those unresolved days in decreasing temperature order, letting each day be pushed and popped once.

## Why scanning forward is too slow

For every day, walking forward until a warmer day appears takes `O(n)` time in the worst case, such as a strictly decreasing list. Over all days that becomes `O(n^2)`.

## Algorithm

1. Create an answer array of zeros.
2. Create an empty stack of indices.
3. For each index from left to right:
   - While the stack is non-empty and the current temperature is greater than the temperature at the top index, pop that index and set its answer to the distance from the popped index to the current index.
   - Push the current index.
4. Return the answer array.

Indices still on the stack at the end have no warmer day ahead, so their answers remain zero.

## Correctness

The stack always holds unresolved indices in decreasing temperature order. When the current temperature is warmer than the top, it is the first such day for that index, because any earlier warmer day would already have popped it. Recording the distance is therefore correct. Equal temperatures do not pop, preserving the strict inequality. Each index is pushed once and popped at most once.

## Complexity

- Time: `O(n)`, because each index is pushed and popped at most once.
- Space: `O(n)` for the stack and the answer.

## Common mistakes

- Using `>=` and treating equal temperatures as warmer.
- Storing only temperatures and losing the distance calculation.
- Initializing answers to something other than zero for unresolved days.
- Popping in the wrong order, which assigns distances to the wrong days.
