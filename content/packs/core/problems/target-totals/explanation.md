# Explanation

## Key insight

The sum of a contiguous range equals the difference between two prefix totals. If the prefix total through position `i` is `running`, then a range ending at `i` has sum `target` exactly when an earlier prefix total was `running - target`.

## Why the direct approach is too slow

Checking every start and end pair takes `O(n^2)` time. With up to 100,000 changes, that is far too many pairs, especially when the answer itself can be large. The prefix-difference view lets us replace the inner search with a constant-time map lookup.

## Algorithm

1. Create a map `counts` with `0 -> 1`, representing the empty prefix.
2. Set `running = 0` and `answer = 0`.
3. For each value in `weights`:
   - Add the value to `running`.
   - Add `counts[running - target]` to `answer`; a missing key contributes zero.
   - Increment `counts[running]`.
4. Return `answer`.

The order in step 3 matters: look up the complement before recording the current prefix, so a range always has a non-empty length.

## Correctness

Every range `weights[i..j]` corresponds to the prefix totals `P[j] - P[i - 1]`, with `P[-1] = 0`. When the loop reaches `j`, all earlier prefix totals, including the empty one, are already in `counts`. The lookup adds exactly the number of earlier prefixes equal to `P[j] - target`, which is exactly the number of starts that make the range sum to `target`. Each range is counted once at its right endpoint, so the total is correct.

## Complexity

- Time: `O(n)` average, because each value causes one map lookup and one insertion.
- Space: `O(n)` for the prefix-count map.

## Common mistakes

- Omitting the initial `0 -> 1` entry, which loses every range that starts at index 0.
- Incrementing the current prefix before the lookup, which can count an empty range.
- Returning after finding the first match instead of counting all matches.
- Using 32-bit arithmetic when the number of matching ranges can exceed two billion.
