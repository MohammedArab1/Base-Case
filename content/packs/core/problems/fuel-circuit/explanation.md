# Explanation

## Key insight

If total fuel is less than total cost, no start can work. Otherwise, a valid start exists. Scan once while tracking the balance from the current candidate. Whenever the balance becomes negative, the current candidate and every station before the failure point are invalid, so the next station becomes the new candidate.

## Why skipping failed stations is safe

Suppose a run starts at `s` and first runs out of fuel on the leg from station `k - 1` to station `k`. That means the tank before adding station `k` was non-negative, but adding `gas[k] - cost[k]` made it negative. Consider any station `j` with `s < j <= k`. The run from `s` reached `j` with a non-negative tank, so starting at `j` with an empty tank has no more fuel than the remaining part of the failed run. It therefore also fails before completing the circuit. The next possible start is `k + 1`.

## Algorithm

1. Set `total = 0`, `balance = 0`, and `candidate = 0`.
2. For each station:
   - Add `gas[i] - cost[i]` to both `total` and `balance`.
   - If `balance` becomes negative, set `candidate = i + 1` and reset `balance = 0`.
3. After the scan, return `candidate` if `total >= 0`; otherwise return `-1`.

## Correctness

When `total >= 0`, the last candidate starts a suffix whose running balance never drops below zero and wraps around with enough total fuel to finish the circuit. The skipping argument shows that no earlier station could be the unique valid start. When `total < 0`, every full circuit consumes more than it gains, so no start can succeed.

## Complexity

- Time: `O(n)`, with one pass.
- Space: `O(1)`.

## Common mistakes

- Simulating each start, which is `O(n^2)`.
- Returning the candidate without checking the total balance.
- Resetting `total` along with `balance`.
- Using the failing station `i` instead of `i + 1` as the next candidate.
