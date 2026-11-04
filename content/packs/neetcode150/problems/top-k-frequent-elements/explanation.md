# Explanation

## Key insight

Frequency is the only thing that determines membership. Once every distinct value has a count, selecting the top `k` is a ranking problem. The unusual part is the output order: membership is decided by frequency, but the returned list must be ascending by value.

## Algorithm

1. Count occurrences of every value with a hash map.
2. Convert the map into `(value, count)` pairs.
3. Sort the pairs by `(-count, value)`: higher counts first, smaller values first on ties.
4. Take the values from the first `k` pairs.
5. Sort those selected values numerically and return them.

## Correctness

The sort key orders values exactly by the selection rule in the statement. Therefore the first `k` pairs are precisely the values that should be selected, including the tie at the boundary. Sorting the selected values afterward produces the required ascending output. No value can be selected twice because the pairs come from a map keyed by value.

## Complexity

Let `n` be the length of `nums` and `d` the number of distinct values.

- Counting takes `O(n)` time.
- Sorting the distinct pairs takes `O(d log d)` time.
- Sorting the selected values takes `O(k log k)` time.
- Total time is `O(n + d log d)`.
- Space is `O(d)` for the map and the pairs, plus `O(k)` for the output.

A min-heap of size `k` gives `O(n log k)` time and `O(d + k)` space; bucket sort by frequency can reach `O(n)` time when frequencies are bounded by `n`.

## Common mistakes

- Returning the values in frequency order. The required output is ascending by value.
- Breaking a tie by taking the larger value.
- Confusing the value with its index when building the frequency map.
- Sorting only by count and letting the language's unstable ordering decide ties.
- Forgetting that `k` can equal the number of distinct values.
