# Explanation

## Key insight

A consecutive run is determined entirely by which values are present. Duplicates are irrelevant, so a hash set is the natural representation. Starting an expansion only at values whose predecessor is absent ensures that each run is walked exactly once.

## Algorithm

1. Insert every value into a hash set. This removes duplicates.
2. Initialize `best = 0`.
3. For each value `x` in the set:
   - If `x - 1` is also in the set, skip `x`; it is not the beginning of a run.
   - Otherwise count how many values `x, x + 1, x + 2, ...` are in the set and update `best`.
4. Return `best`.

## Correctness

Every maximal run has exactly one smallest value. For that value, the predecessor is absent, so the algorithm expands from it and counts the entire run. For any other value in the run, the predecessor is present, so it is skipped and the run is not counted twice. Therefore every maximal run is considered once, and the maximum length is correct.

## Complexity

Let `n` be the number of input values.

- Building the set takes `O(n)` expected time.
- The outer loop examines each distinct value once.
- The inner loop advances only through values that belong to the current run. Across all starting points, each value is counted at most once, so the total inner-loop work is `O(n)`.
- Space is `O(n)` for the set.

The expected time is `O(n)` because hash-set operations are average `O(1)`. A sorting solution is `O(n log n)` and uses `O(1)` or `O(n)` extra space depending on the sort.

## Common mistakes

- Expanding from every value, which makes a long run get traversed many times and can become `O(n^2)`.
- Counting duplicates separately; `[1, 1, 2]` still has a run of length two, not three.
- Checking `x + 1` before confirming that `x` is a run start, which still works but wastes time.
- Returning the last value of the run instead of its length.
- Forgetting the empty list, where the correct answer is `0`.
