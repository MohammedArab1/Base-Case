# Explanation

## Key insight

Arrange the most frequent task first. Its occurrences create fixed gaps that must contain either another task or idle time. If enough other tasks exist, the gaps fill completely and the answer is just the number of tasks.

## Algorithm

1. Count each task.
2. Find the maximum frequency and how many tasks share it.
3. Compute `(maximum - 1) * (cooldown + 1) + tied`.
4. Return the larger of that value and the number of tasks.

## Correctness

The first `maximum - 1` copies of the most frequent task each need `cooldown` slots before the next copy, producing `(maximum - 1) * (cooldown + 1)` slots. The final copies of all tied tasks occupy the last frame, adding `tied`. No schedule can be shorter than this frame. If the remaining tasks exceed the gaps, they fill the idle slots and the result is simply the task count. Thus the maximum of the two bounds is achievable and minimal.

## Complexity

- Time: `O(n)`.
- Space: `O(1)` for 26 task labels.

## Common mistakes

- Using only one most-frequent task when several tie.
- Forgetting that the answer cannot be smaller than `tasks.length`.
- Counting idle slots when `cooldown` is zero.

## Related pattern

The frame argument also solves rearrange-string-with-distance problems.
