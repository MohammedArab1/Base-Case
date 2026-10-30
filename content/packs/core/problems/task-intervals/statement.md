# Task Intervals

A processor must run every task in `tasks`. Identical tasks must be separated by at least `cooldown` other intervals. The processor may idle between tasks.

Return the minimum number of intervals needed to finish all tasks, including idle intervals.

## Input

- `tasks`: uppercase task labels, one character per task.
- `cooldown`: the minimum gap between two runs of the same task.

## Output

The minimum total interval count.

## Examples

**Example 1**

```
Input: tasks = "AAB", cooldown = 2
Output: 4
```

One schedule is `A B _ A`.

**Example 2**

```
Input: tasks = "ABCABC", cooldown = 3
Output: 7
```

One schedule is `A B C _ A B C`.

**Example 3**

```
Input: tasks = "AAABBB", cooldown = 1
Output: 6
```

**Example 4**

```
Input: tasks = "ABCD", cooldown = 5
Output: 4
```

All task labels are distinct, so no idle time is needed.

**Example 5**

```
Input: tasks = "A", cooldown = 5
Output: 1
```

## Constraints

- `1 <= tasks.length <= 100,000`
- `tasks` contains only uppercase English letters.
- `0 <= cooldown <= 100`

## Follow-up

Why is the most frequent task the bottleneck, and how do ties for that frequency affect the formula?
