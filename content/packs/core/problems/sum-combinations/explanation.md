# Explanation

## Key insight

Sorting the candidates and allowing reuse only from the current index onward produces every multiset exactly once. Later candidates cannot be followed by earlier ones, so permutations of the same combination never appear.

## Algorithm

1. Sort `candidates`.
2. Recursively choose a value at or after `start`.
3. Append the value, recurse with the same index (reuse allowed), then remove it.
4. Stop when the remaining sum is zero; prune values larger than the remainder.

## Correctness

Every generated path is nondecreasing and sums to the target, so it is a valid unique combination. Conversely, any valid multiset has a sorted representation; the recursion can choose exactly those values in order. Pruning removes only values that cannot fit, so no solution is missed.

## Complexity

- Time: exponential in the target relative to the smallest candidate.
- Space: `O(target)` for the recursion path.

## Common mistakes

- Advancing the index after choosing a value, which forbids reuse.
- Starting each call at index `0`, which generates permutations.
- Recording a combination before the remaining sum reaches zero.

## Related pattern

Subsets and permutation generation use the same choose/recurse/un-choose structure.
