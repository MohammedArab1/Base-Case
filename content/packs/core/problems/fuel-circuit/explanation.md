# Explanation

## Key insight

If total fuel is less than total cost, no start can work. Otherwise, a valid start exists. Scan once while tracking the balance from the current candidate. Whenever the balance becomes negative, the current candidate and every station before the failure point are invalid, so the next station becomes the new candidate.

## Why skipping failed stations is safe

Suppose a run starts at `s` and runs out of fuel between `k - 1` and `k`. Consider any station `j` with `s < j <= k - 1`. Starting at `j`, the tank at `j` is what remained after starting at `s` and passing through `j - 1`, which was non-negative, minus the fuel already used. The run from `j` has no more fuel than the remainder of the failed run and therefore also fails before returning. So the next possible start is `k`.

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
- Using the station after the failure instead of the station where the failure occurred.
