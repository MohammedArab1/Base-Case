# Explanation

## Approach

Let `P` be the sum of entries with plus signs and `N` the sum of entries with minus signs. The two equations are `P - N = target` and `P + N = total`, where `total` is the sum of all entries. Adding them yields `P = (total + target) / 2`.

Thus each valid sign assignment corresponds to choosing a subset of entries whose sum is `wanted = (total + target) / 2`. Count those subsets with a one-dimensional 0/1 knapsack DP: initialize `ways[0] = 1`, then process each entry and update totals downward so each entry is used at most once. Entries equal to zero are handled naturally; processing a zero doubles the number of subsets because both including and excluding it produce the same subtotal.

If `abs(target) > total`, or if `total + target` is odd, no valid subset sum exists and the answer is zero.

## Correctness

Every sign assignment determines exactly one plus-subset, and its plus-sum must satisfy the derived equation. Conversely, choosing any subset with sum `wanted` determines a sign assignment: plus on the chosen entries, minus on the rest. Its signed total is `wanted - (total - wanted) = 2 * wanted - total = target`. This is a bijection, so counting plus-subsets counts sign assignments.

The knapsack invariant is that after processing some entries, `ways[s]` is the number of subsets of those entries summing to `s`. Processing an entry `v` adds the subsets that include it, which are exactly the previously counted subsets summing to `s - v`. Walking downward prevents the same entry from being included more than once. Induction proves the final count.

## Complexity

- Time: `O(n * wanted)`, bounded by `O(n * total)`, where `n` is the number of entries.
- Space: `O(wanted)`, bounded by `O(total)`.

## Common mistakes

- Forgetting the parity check and performing integer division on an impossible target.
- Reversing the knapsack loop, which allows an entry to be reused.
- Dropping zero entries instead of counting their two sign choices.
- Treating equal-valued entries as indistinguishable when they are separate positions.

## Related pattern

The plus/minus transformation reduces many signed-sum problems to subset-sum counting and partitioning.
