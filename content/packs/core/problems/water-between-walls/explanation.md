# Explanation

## Key insight

The widest possible tank uses the two end walls. To beat it, a narrower pair must be taller. Moving a pointer inward always reduces the width, so the only useful move is the one that might increase the limiting height: move the shorter wall.

## Why the naive approach is too slow

Checking every pair takes `O(n²)` time. With `n = 100,000`, that is roughly five billion pairs, which is far beyond the time limit.

## Algorithm

1. Put one pointer at the left end and one at the right end.
2. Compute the area using the current pair and update the best area.
3. Move the pointer at the shorter wall inward. If the walls are equal, moving either one is safe.
4. Repeat until the pointers meet.

## Correctness

Consider the pair `(left, right)` at some step. If `heights[left] <= heights[right]`, then for every `k` with `left < k < right`, the pair `(left, k)` has width at most `right - left - 1` and height at most `heights[left]`. Its area is therefore no larger than the current area, so no pair that uses `left` and an index to its right can beat the current best. The same argument applies symmetrically when `heights[right] < heights[left]`. Moving the shorter pointer is therefore safe, and the algorithm never discards a pair that could be optimal.

## Complexity

- Time: `O(n)`, because each step moves one pointer inward and there are at most `n - 1` steps.
- Space: `O(1)`, because only two indices and the best area are stored.

## Common mistakes

- Moving the taller wall, which cannot increase the limiting height.
- Forgetting that a wall of height `0` makes the area `0`.
- Assuming the two tallest walls always form the best tank; distance matters too.
