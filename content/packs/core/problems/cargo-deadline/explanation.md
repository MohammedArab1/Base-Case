# Explanation

## Key insight

For a fixed capacity, the best strategy is greedy: load packages in order until the next one would overflow, then start a new ship. Greedy is optimal because delaying a package cannot reduce the number of ships used. Feasibility is monotone in capacity, so binary search finds the minimum.

## Algorithm

1. Set `low` to the heaviest package and `high` to the total weight.
2. While `low < high`:
   - Compute `middle`.
   - Count how many ships are needed with capacity `middle` by scanning the packages once and starting a new ship whenever the next package would exceed the capacity.
   - If the count is at most `days`, set `high = middle`; otherwise set `low = middle + 1`.
3. Return `low`.

## Correctness

The greedy count is the minimum number of ships for a given capacity: on any day, taking as many packages as fit leaves at least as much room for later packages as stopping earlier would. The count never increases when capacity grows, because each day's load can only become more capable. Binary search therefore converges to the smallest capacity whose count is at most `days`.

## Complexity

- Time: `O(n log(sum(weights)))`, because each feasibility check is `O(n)`.
- Space: `O(1)` extra space.

## Common mistakes

- Setting the lower bound to zero, which permits impossible capacities.
- Reordering the packages to balance loads, which violates the order rule.
- Resetting the load incorrectly when a package starts a new day.
- Using linear search over the capacity range.
