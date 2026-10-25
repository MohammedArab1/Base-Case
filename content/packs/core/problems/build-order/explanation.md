# Explanation

## Key insight

A valid build order exists exactly when the dependency graph has no directed cycle. Kahn's algorithm repeatedly removes modules with no unmet prerequisites; if fewer than all modules can be removed, the remainder is blocked by at least one cycle.

## Algorithm

1. Create an adjacency list from a prerequisite `b` to the modules `a` that depend on it.
2. Compute the incoming prerequisite count for every module. Count each pair separately, even if the pair is duplicated.
3. Put every module with count zero in a queue.
4. Repeatedly remove a module from the queue, increment the built count, and decrement the count of each dependent. Add a dependent to the queue when its count reaches zero.
5. Return whether the built count equals `numModules`.

## Correctness

A module is added to the queue only after all of its prerequisites have been removed, so every dequeue corresponds to a legal build step. If the process removes all modules, that dequeue order is a valid build order.

If some modules remain, each remaining module has at least one remaining prerequisite, because a count only reaches zero through removal. Following those prerequisites within the finite remaining set must eventually revisit a module, which is a directed cycle. No build order can exist for a cycle, so returning `false` is correct.

## Complexity

- Time: `O(V + E)` for `V` modules and `E` prerequisite pairs.
- Space: `O(V + E)` for the adjacency list and counts.

## Common Mistakes

- Reversing the edge direction so dependents look like prerequisites.
- Marking a module buildable when only one of several prerequisites is done.
- Treating a duplicate pair as one edge while decrementing twice, or the reverse.
- Checking connectivity instead of acyclicity.
