## Approach

Simulate the digit-square process directly. Before each step, record the current value. If the value becomes `1`, the number is cheerful. If a value is encountered that has already been seen, the process has entered a cycle and can never reach `1`.

Only a small set of states is reachable. In particular, once the number has at most ten digits, the next value is at most `810`, so the process quickly enters a bounded range.

## Correctness

The process is deterministic: each value has exactly one successor. If it reaches `1`, we report cheerful. If it repeats a value before reaching `1`, the deterministic sequence from that point is identical to the earlier occurrence, so it will loop forever and never reach `1`. Since there are finitely many reachable states, one of these two cases must occur, so the algorithm always terminates with the correct answer.

## Complexity

- Time: `O(log n)` for the initial digits, then a bounded number of further steps.
- Space: `O(log n)` for the visited set.

## Common mistakes

- Forgetting to reset the digit sum for each iteration.
- Squaring the number instead of its digits.
- Stopping only after a fixed number of steps instead of detecting a cycle.
- Treating `1` as non-cheerful because it does not change after a step.

## Related pattern

Cycle detection with a visited set also applies to linked-list loops and state-machine reachability.
