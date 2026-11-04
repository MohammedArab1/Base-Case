## Approach

Instead of committing to one replacement for each joker, maintain the range `[low, high]` of possible open-bracket balances after the prefix processed so far.

An opening bracket raises both ends of the range. A closing bracket lowers both ends, but the lower end cannot go below zero. A joker can act as a closing bracket (lower the balance), an opening bracket (raise it), or nothing (leave it unchanged), so it expands the range downward by one, with a floor of zero, and upward by one. If `high` ever becomes negative, no assignment can keep the prefix valid. At the end, the string is balanceable exactly when `low == 0`, meaning zero is still among the possible balances.

## Correctness

The interval invariant follows from the three possible effects of each character. Every balance in `[low, high]` is achievable by some assignment, and no balance outside it is achievable. If `high` becomes negative, even the most favorable assignment has more closes than opens, so the prefix is impossible. At the end, a balanced sequence requires balance zero; since `low` is the smallest achievable balance and balances are non-negative, zero is achievable exactly when `low == 0`. Therefore the algorithm accepts precisely the strings with a valid assignment.

## Complexity

- Time: `O(n)`, with one pass over the string.
- Space: `O(1)`, using two counters.

## Common mistakes

- Treating every joker as an opening bracket or as empty in a fixed way.
- Letting `low` become negative, which would represent an impossible negative open count.
- Failing to reject a prefix whose maximum balance is negative.
- Requiring the minimum balance to be positive at the end instead of allowing zero.

## Related pattern

Maintaining a range of reachable states is also useful for wildcard matching and bounded reachability problems.
