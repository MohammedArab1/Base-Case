# Explanation

## Key insight

For each value `x`, the only partner that works is `target - x`. Instead of comparing every pair, remember the values already seen and ask a constant-time question: "Have I already seen the complement?"

## Why the naive approach is too slow

Checking every pair takes `O(n²)` time. With `n = 100,000`, that is about five billion comparisons in the worst case, which is far beyond the time limit.

## Algorithm

1. Create an empty hash map from value to index.
2. Iterate through `nums` with index `i`.
3. Compute `complement = target - nums[i]`.
4. If `complement` is in the map, return the stored index and `i` in ascending order.
5. Otherwise, store `nums[i] -> i`.
6. If the loop finishes, return an empty list. The problem guarantees a pair exists, so this line is defensive.

## Correctness

When the algorithm returns indices `[j, i]`, it has found `nums[j] = target - nums[i]`, so `nums[i] + nums[j] = target`. The indices are distinct because `j` was stored during an earlier iteration. If a valid pair `(a, b)` with `a < b` exists, then when the loop reaches `b`, the complement `nums[a]` is already in the map, so the pair is found. Therefore the algorithm returns a correct pair whenever one exists.

## Complexity

- Time: `O(n)` on average, because each map lookup and insertion is `O(1)` on average.
- Space: `O(n)` in the worst case, for the map.

## Common mistakes

- Returning the values instead of the indices.
- Checking for the complement after inserting the current value, which can pair an element with itself.
- Sorting the array and using two pointers without preserving the original indices.
