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
Input: tasks = "AAABBB", cooldown = 2
Output: 8
```

One schedule is `A B _ A B _ A B`.

**Example 2**

```
Input: tasks = "AAABBB", cooldown = 0
Output: 6
```

No idle time is needed.

**Example 3**

```
Input: tasks = "A", cooldown = 2
Output: 1
```

**Example 4**

```
Input: tasks = "AAAAA", cooldown = 2
Output: 13
```

## Constraints

- `1 <= tasks.length <= 100,000`
- `tasks` contains only uppercase English letters.
- `0 <= cooldown <= 100`

## Follow-up

Why is the most frequent task the bottleneck, and how do ties for that frequency affect the formula?
